class ChordDependencyWidget extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    const container = document.createElement("div");
    container.id = "chord-container";
    container.style.cssText = "width:100%;height:100%;";
    container.textContent = "Minimal widget, no D3.";
    this.shadowRoot.appendChild(container);
  }

  onCustomWidgetAfterUpdate(changedProps) {}
}

window.customElements.define("com-sample-chorddependency", ChordDependencyWidget);
