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

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;
    const innerRadius = Math.min(width, height) * 0.35;
    const outerRadius = innerRadius + 20;

    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .style("font", "10px sans-serif");

    // Static example data (simplified from the Observable dependency diagram)
    const names = ["A", "B", "C", "D"];
    const matrix = [
      [0, 5, 3, 1],
      [5, 0, 2, 0],
      [3, 2, 0, 4],
      [1, 0, 4, 0]
    ];

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

    // Group arcs
    group.append("path")
      .attr("fill", d => color(d.index))
      .attr("stroke", d => d3.rgb(color(d.index)).darker())
      .attr("d", arc);

    // Group labels
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

    // Chords (dependencies)
    svg.append("g")
      .attr("fill-opacity", 0.7)
      .selectAll("path")
      .data(chord)
      .join("path")
      .attr("d", ribbon)
      .attr("fill", d => color(d.target.index))
      .attr("stroke", d => d3.rgb(color(d.target.index)).darker())
      .on("click", (event, d) => {
        // Simple click event for now
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

  onCustomWidgetAfterUpdate(changedProps) {}
}

window.customElements.define("com-sample-chorddependency", ChordDependencyWidget);
