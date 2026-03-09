class ChordDependencyWidget extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    const div = document.createElement("div");
    div.textContent = "Chord widget loaded.";
    div.style.cssText =
      "width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#eef;";
    this.shadowRoot.appendChild(div);
  }

  onCustomWidgetAfterUpdate(changedProps) {
    // required by SAC, even if empty
  }
}

customElements.define("com-sample-chorddependency", ChordDependencyWidget);
