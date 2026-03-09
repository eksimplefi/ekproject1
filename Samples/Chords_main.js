class ChordDependencyWidget extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    const div = document.createElement("div");
    div.textContent = "Chord widget loaded (minimal).";
    div.style.cssText =
      "width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#eef;";

    this.shadowRoot.appendChild(div);
  }

  onCustomWidgetAfterUpdate(changedProps) {
    // Intentionally empty; SAC expects this method to exist.
  }
}

customElements.define("com-sample-chorddependency", ChordDependencyWidget);
