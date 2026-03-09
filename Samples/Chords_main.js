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
    container.textContent = "";

  }

  onCustomWidgetAfterUpdate(changedProps) {}
}

window.customElements.define("com-sample-chorddependency", ChordDependencyWidget);
