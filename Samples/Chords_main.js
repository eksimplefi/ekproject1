class ChordDependencyWidget extends HTMLElement {
  constructor() {
    super();
    this._dataBinding = null;   // will hold chordData binding object
    this._names = [];
    this._matrix = [];
    this._d3Loaded = false;
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    const container = document.createElement("div");
    container.id = "chord-container";
    container.style.cssText = "width:100%;height:100%;";
    this.shadowRoot.appendChild(container);
    this._container = container;

    const script = document.createElement("script");
    script.src = "https://d3js.org/d3.v7.min.js";
    script.onload = () => {
      this._d3Loaded = true;
      this._tryRender();
    };
    script.onerror = (e) => {
      container.textContent = "Failed to load D3.";
      console.error("Failed to load D3", e);
    };
    this.shadowRoot.appendChild(script);
  }

  // Called before update, we just keep it for completeness
  onCustomWidgetBeforeUpdate(changedProps) {}

  // SAC will call this when properties or dataBindings change
  onCustomWidgetAfterUpdate(changedProps) {
    // In Analytics Designer, dataBindings come under changedProps.dataBindings
    if (changedProps && changedProps.dataBindings && changedProps.dataBindings.chordData) {
      this._dataBinding = changedProps.dataBindings.chordData;
      this._processDataBinding();
      this._tryRender();
    }
  }

  _processDataBinding() {
    const binding = this._dataBinding;
    if (!binding || !binding.data || binding.data.length === 0) {
      this._names = [];
      this._matrix = [];
      return;
    }

    // binding.data is an array of rows; each row has structures for feeds:
    // row.from, row.to, row.value, etc. The exact structure can vary slightly,
    // so we pick .id or .label for dimensions and .raw or .value for the measure.
    const edges = binding.data.map(row => {
      const from = row.from.id || row.from.label || row.from.description || "";
      const to = row.to.id || row.to.label || row.to.description || "";
      const valCell = row.value;
      const value = (valCell && (valCell.raw != null ? valCell.raw : valCell.value)) || 0;
      return { from, to, value: Number(value) || 0 };
    }).filter(e => e.from && e.to && e.value !== 0);

    const nameSet = new Set();
    edges.forEach(e => {
      nameSet.add(e.from);
      nameSet.add(e.to);
    });
    const names = Array.from(nameSet);
    const n = names.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));

    edges.forEach(e => {
      const i = names.indexOf(e.from);
      const j = names.indexOf(e.to);
      if (i >= 0 && j >= 0) {
        matrix[i][j] += e.value;
      }
    });

    this._names = names;
    this._matrix = matrix;
  }

  _tryRender() {
    if (!this._d3Loaded || !this._container) {
      return;
    }
    if (!this._names || this._names.length === 0 || !this._matrix || this._matrix.length === 0) {
      this._container.textContent = "No data.";
      return;
    }
    this._renderChord();
  }

  _renderChord() {
    const container = this._container;
    container.textContent = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;
    const innerRadius = Math.min(width, height) * 0.35;
    const outerRadius = innerRadius + 20;

    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .style("font", "10px sans-serif");

    const names = this._names;
    const matrix = this._matrix;

    const chord = d3.chordDirected()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending)(matrix);

    const color = d3.scaleOrdinal()
      .domain(d3.range(names.length))
      .range(d3.schemeCategory10);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbonArrow()
      .radius(innerRadius - 1)
      .padAngle(1 / innerRadius);

    const group = svg.append("g")
      .attr("fill-opacity", 0.75)
      .selectAll("g")
      .data(chord.groups)
      .join("g");

    group.append("path")
      .attr("fill", d => color(d.index))
      .attr("stroke", d => d3.rgb(color(d.index)).darker())
      .attr("d", arc);

    group.append("text")
      .each(d => d.angle = (d.startAngle + d.endAngle) / 2)
      .attr("dy", "0.35em")
      .attr("transform", d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 10})
        ${d.angle > Math.PI ? "rotate(180)" : ""}
      `)
      .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
      .text(d => names[d.index]);

    svg.append("g")
      .attr("fill-opacity", 0.7)
      .selectAll("path")
      .data(chord)
      .join("path")
      .attr("d", ribbon)
      .attr("fill", d => color(d.target.index))
      .attr("stroke", d => d3.rgb(color(d.target.index)).darker())
      .on("click", (event, d) => {
        this.dispatchEvent(new CustomEvent("onSelectionChanged", {
          detail: {
            type: "chord",
            source: names[d.source.index],
            target: names[d.target.index],
            value: matrix[d.source.index][d.target.index]
          }
        }));
      });
  }
}

window.customElements.define("com-sample-chorddependency", ChordDependencyWidget);
