class ChordDependencyWidget extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    const container = document.createElement("div");
    container.id = "chord-container";
    container.style.cssText = "width:100%;height:100%;";
    this.shadowRoot.appendChild(container);

    const script = document.createElement("script");
    script.src = "https://d3js.org/d3.v7.min.js";
    script.onload = () => {
      this._onD3Loaded(container);
    };
    script.onerror = (e) => {
      container.textContent = "Failed to load D3.";
      console.error("Failed to load D3", e);
    };
    this.shadowRoot.appendChild(script);
  }

  _onD3Loaded(container) {
    container.textContent = ""; // clear text

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#f5f5f5");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("font-family", "sans-serif")
      .style("font-size", "14px")
      .text("D3 loaded – chord coming next");
  }

  onCustomWidgetAfterUpdate(changedProps) {}
}

window.customElements.define("com-sample-chorddependency", ChordDependencyWidget);

