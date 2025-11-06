looker.plugins.visualizations.add({
  options: {
    // ----- STYLE SECTION -----
    main_color: {
      section: "Style",
      order: 1,
      type: "string",
      label: "Value Color",
      display: "color",
      default: "#1a73e8"
    },
    auto_resize: {
      section: "Style",
      order: 2,
      type: "boolean",
      label: "Auto Resize Value Font",
      default: true
    },
    font_size: {
      section: "Style",
      order: 3,
      type: "number",
      label: "Manual Font Size (when Auto Resize is off)",
      display: "range",
      min: 20,
      max: 120,
      default: 60
    },
    font_family: {
      section: "Style",
      order: 4,
      type: "string",
      label: "Font Family",
      default: "Roboto, sans-serif"
    },
    background_color: {
      section: "Style",
      order: 5,
      type: "string",
      label: "Background Color",
      display: "color",
      default: "#ffffff"
    },

    // ----- TITLE SECTION -----
    show_title: {
      section: "Title",
      order: 1,
      type: "boolean",
      label: "Show Title",
      default: false
    },
    title_override: {
      section: "Title",
      order: 2,
      type: "string",
      label: "Custom Title Text",
      placeholder: "Enter custom title",
      display: "text"
    },

    // ----- COMPARISON SECTION -----
    comparison_mode: {
      section: "Comparison",
      order: 1,
      type: "string",
      label: "Comparison Type",
      values: [
        { "None": "none" },
        { "Absolute Change": "absolute" },
        { "Percentage Change": "percent" }
      ],
      display: "radio",
      default: "none"
    },
    comparison_positive_color: {
      section: "Comparison",
      order: 2,
      type: "string",
      label: "Positive Change Color",
      display: "color",
      default: "#34a853"
    },
    comparison_negative_color: {
      section: "Comparison",
      order: 3,
      type: "string",
      label: "Negative Change Color",
      display: "color",
      default: "#ea4335"
    },
    comparison_font_size: {
      section: "Comparison",
      order: 4,
      type: "number",
      label: "Comparison Font Size",
      display: "range",
      min: 10,
      max: 50,
      default: 20
    },

    // ----- FORMAT SECTION -----
    prefix: {
      section: "Format",
      order: 1,
      type: "string",
      label: "Prefix (e.g. $, ₹)",
      default: ""
    },
    suffix: {
      section: "Format",
      order: 2,
      type: "string",
      label: "Suffix (e.g. %, units)",
      default: ""
    }
  },

  create: function(element, config) {
    element.innerHTML = `
      <style>
        .kpi-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
          border-radius: 12px;
          transition: all 0.3s ease;
          padding: 10px;
          box-sizing: border-box;
        }
        .kpi-title {
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 8px;
          text-align: center;
          color: #555;
        }
        .kpi-value {
          font-weight: 600;
          margin: 0;
          text-align: center;
          white-space: nowrap;
        }
        .kpi-comparison {
          margin-top: 5px;
          font-weight: 500;
          text-align: center;
        }
      </style>
      <div class="kpi-container">
        <div class="kpi-title"></div>
        <div class="kpi-value"></div>
        <div class="kpi-comparison"></div>
      </div>
    `;
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    const container = element.querySelector(".kpi-container");
    const titleEl = element.querySelector(".kpi-title");
    const valueEl = element.querySelector(".kpi-value");
    const comparisonEl = element.querySelector(".kpi-comparison");

    // ✅ Data validation
    if (!queryResponse || queryResponse.fields.measure_like.length === 0) {
      this.addError({ title: "Missing Measure", message: "Please select at least one measure." });
      return;
    }
    this.clearErrors();

    // ✅ Extract measures
    const measure1 = queryResponse.fields.measure_like[0].name;
    const measure2 = queryResponse.fields.measure_like[1]
      ? queryResponse.fields.measure_like[1].name
      : null;

    const currentValue = data[0][measure1].value;
    const previousValue = measure2 ? data[0][measure2].value : null;

    // ----- APPLY STYLES -----
    container.style.backgroundColor = config.background_color;
    valueEl.style.color = config.main_color;
    valueEl.style.fontFamily = config.font_family;

    // ----- TITLE -----
    if (config.show_title) {
      titleEl.style.display = "block";
      titleEl.innerText = config.title_override || queryResponse.fields.measure_like[0].label_short || "KPI";
    } else {
      titleEl.style.display = "none";
    }

    // ----- MAIN VALUE -----
    valueEl.innerText = `${config.prefix}${currentValue}${config.suffix}`;

    // Auto resize logic
    if (config.auto_resize) {
      // dynamically fit text
      let containerWidth = container.clientWidth * 0.9;
      let textLength = valueEl.innerText.length;
      let dynamicFont = Math.max(Math.min(containerWidth / (textLength * 0.6), 120), 24);
      valueEl.style.fontSize = `${dynamicFont}px`;
    } else {
      valueEl.style.fontSize = `${config.font_size}px`;
    }

    // ----- COMPARISON -----
    if (config.comparison_mode !== "none" && previousValue !== null) {
      let diff = currentValue - previousValue;
      let pct = previousValue !== 0 ? (diff / previousValue) * 100 : 0;
      let arrow = diff >= 0 ? "▲" : "▼";
      let comparisonText = "";
      let comparisonColor = diff >= 0 ? config.comparison_positive_color : config.comparison_negative_color;

      if (config.comparison_mode === "absolute") {
        comparisonText = `${arrow} ${diff.toFixed(2)}`;
      } else if (config.comparison_mode === "percent") {
        comparisonText = `${arrow} ${pct.toFixed(1)}%`;
      }

      comparisonEl.style.fontSize = `${config.comparison_font_size}px`;
      comparisonEl.style.color = comparisonColor;
      comparisonEl.innerText = comparisonText;
    } else {
      comparisonEl.innerText = "";
    }

    done();
  }
});
