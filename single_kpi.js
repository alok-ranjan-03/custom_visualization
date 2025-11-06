looker.plugins.visualizations.add({
  options: {
    main_color: {
      section: "Style",
      type: "string",
      label: "Main Value Color",
      display: "color",
      default: "#1a73e8"
    },
    comparison_positive_color: {
      section: "Style",
      type: "string",
      label: "Positive Change Color",
      display: "color",
      default: "#34a853"
    },
    comparison_negative_color: {
      section: "Style",
      type: "string",
      label: "Negative Change Color",
      display: "color",
      default: "#ea4335"
    },
    background_color: {
      section: "Style",
      type: "string",
      label: "Background Color",
      display: "color",
      default: "#ffffff"
    },
    font_size: {
      section: "Style",
      type: "number",
      label: "Main Font Size",
      display: "range",
      min: 20,
      max: 120,
      default: 60
    },
    comparison_font_size: {
      section: "Style",
      type: "number",
      label: "Comparison Font Size",
      display: "range",
      min: 10,
      max: 50,
      default: 20
    },
    font_family: {
      section: "Style",
      type: "string",
      label: "Font Family",
      default: "Roboto, sans-serif"
    },
    prefix: {
      section: "Format",
      type: "string",
      label: "Prefix (e.g. $, ₹, etc.)",
      default: ""
    },
    suffix: {
      section: "Format",
      type: "string",
      label: "Suffix (e.g. %, units)",
      default: ""
    },
    comparison_mode: {
      section: "Comparison",
      type: "string",
      label: "Comparison Type",
      values: [
        {"None": "none"},
        {"Absolute Change": "absolute"},
        {"Percentage Change": "percent"}
      ],
      display: "radio",
      default: "none"
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
        }
        .kpi-value {
          font-weight: 600;
          margin: 0;
          text-align: center;
        }
        .kpi-comparison {
          margin-top: 5px;
          font-weight: 500;
          text-align: center;
        }
      </style>
      <div class="kpi-container">
        <div class="kpi-value"></div>
        <div class="kpi-comparison"></div>
      </div>
    `;
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    const container = element.querySelector(".kpi-container");
    const valueEl = element.querySelector(".kpi-value");
    const comparisonEl = element.querySelector(".kpi-comparison");

    // ✅ Error handling
    if (!queryResponse || queryResponse.fields.measure_like.length === 0) {
      this.addError({ title: "Missing Measure", message: "Please select at least one measure." });
      return;
    }
    this.clearErrors();

    // ✅ Assume measure 1 = main KPI, measure 2 = comparison (optional)
    const measure1 = queryResponse.fields.measure_like[0].name;
    const measure2 = queryResponse.fields.measure_like[1]
      ? queryResponse.fields.measure_like[1].name
      : null;

    const currentValue = data[0][measure1].value;
    const previousValue = measure2 ? data[0][measure2].value : null;

    // ✅ Style container
    container.style.backgroundColor = config.background_color;

    // ✅ Display Main KPI
    valueEl.style.fontSize = `${config.font_size}px`;
    valueEl.style.color = config.main_color;
    valueEl.style.fontFamily = config.font_family;
    valueEl.innerText = `${config.prefix}${currentValue}${config.suffix}`;

    // ✅ Comparison logic
    if (config.comparison_mode !== "none" && previousValue !== null) {
      let diff = currentValue - previousValue;
      let pct = previousValue !== 0 ? (diff / previousValue) * 100 : 0;
      let comparisonText = "";
      let comparisonColor = diff >= 0 ? config.comparison_positive_color : config.comparison_negative_color;
      let arrow = diff >= 0 ? "▲" : "▼";

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
