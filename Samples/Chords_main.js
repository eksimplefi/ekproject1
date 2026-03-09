class ChordDependencyWidget extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Do nothing heavy here; just a plain div.
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    const container = document.createElement("div");
    container.id = "chord-container";
    container.style.cssText = "width:100%;height:100%;";
    container.textContent = "Chord widget placeholder.";
    this.shadowRoot.appendChild(container);
  }

  onCustomWidgetBeforeUpdate(changedProps) {
    // Required hook, but empty.
  }

  onCustomWidgetAfterUpdate(changedProps) {
    // Required hook, but empty.
  }
}

window.customElements.define("com-sample-chorddependency", ChordDependencyWidget);

