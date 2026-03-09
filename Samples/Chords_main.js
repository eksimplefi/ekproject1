import * as d3 from 'd3';  // Bundle or load via ES module

class ChordDependencyWidget extends HTMLElement {
  static get observedAttributes() { return ['title', 'inner-radius', 'outer-radius']; }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `<div id="container" style="width:100%;height:100%;"></div>`;
    this.container = this.shadowRoot.querySelector('#container');
    this.svg = null;
    this.chord = null;
    this._nodes = [];
    this._matrix = [];
  }

  onCustomWidgetBeforeUpdate(changedProps) {}

  onCustomWidgetAfterUpdate(changedProps) {
    if (changedProps.includes('title')) {
      // Update title DOM
    }
    if (changedProps.includes('inner-radius') || changedProps.includes('outer-radius')) {
      this._render();
    }
  }

  _updateData(dataBinding) {
    if (dataBinding.id === 'chordData' && dataBinding.data) {
      // Extract unique nodes and build matrix
      const edges = dataBinding.data.map(row => ({
        from: row['from'].id || row['from'].label,
        to: row['to'].id || row['to'].label,
        value: row['value'].raw
      }));
      
      const nodeSet = new Set();
      edges.forEach(e => { nodeSet.add(e.from); nodeSet.add(e.to); });
      this._nodes = Array.from(nodeSet);
      const n = this._nodes.length;
      this._matrix = Array(n).fill().map(() => Array(n).fill(0));
      
      edges.forEach(e => {
        const i = this._nodes.indexOf(e.from);
        const j = this._nodes.indexOf(e.to);
        if (i >= 0 && j >= 0) this._matrix[i][j] = e.value;
      });
      
      this._render();
    }
  }

  _renderStatic() {
    // Similar matrix build from this._staticLabels/_staticMatrix
    this._render();
  }

  _render() {
    const width = this.clientWidth, height = this.clientHeight;
    const ir = parseFloat(this.getAttribute('inner-radius') || 180);
    const or = parseFloat(this.getAttribute('outer-radius') || 200);
    const colors = JSON.parse(this.getAttribute('color-scheme') || '[]');

    if (!this.svg) {
      this.svg = d3.select(this.container).append('svg').attr('viewBox', `0 0 ${width} ${height}`);
    } else {
      this.svg.selectAll('*').remove();
    }

    const g = this.svg.append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    const arc = d3.arc().innerRadius(ir).outerRadius(or);

    const groups = chord.groups(this._matrix);
    const chords = chord(this._matrix);

    // Groups
    g.append('g').selectAll('path')
      .data(groups)
      .join('path')
      .style('fill', (d, i) => colors[i % colors.length])
      .style('stroke', d => d3.rgb(colors[d.index % colors.length]).darker())
      .attr('d', arc)
      .on('click', (event, d) => {
        this.dispatchEvent(new CustomEvent('onSelectionChanged', {
          detail: { type: 'group', index: d.index, label: this._nodes[d.index] }
        }));
      });

    // Chords  
    g.append('g').selectAll('path')
      .data(chords)
      .join('path')
      .style('fill', d => colors[d.target.index % colors.length])
      .style('opacity', 0.8)
      .style('stroke', 'white')
      .style('stroke-width', 0.5)
      .attr('d', arc)
      .on('click', (event, d) => {
        this.dispatchEvent(new CustomEvent('onSelectionChanged', {
          detail: { type: 'chord', source: this._nodes[d.source.index], target: this._nodes[d.target.index] }
        }));
      });

    // Labels (adapted from Observable example)
    const labelArc = d3.arc().innerRadius(or).outerRadius(or + 20);
    g.append('g').selectAll('text')
      .data(groups)
      .join('text')
      .each(d => { d.angle = (d.endAngle - d.startAngle) / 2 + d.startAngle; })
      .attr('dy', '.35em')
      .style('font-family', 'sans-serif')
      .style('font-size', '12px')
      .attr('text-anchor', d => d.angle > Math.PI ? 'end' : null)
      .attr('transform', d => {
        return `rotate(${(d.angle * 180 / Math.PI - 90)}) translate(${labelArc.innerRadius()})` +
          (d.angle > Math.PI ? 'rotate(180)' : '');
      })
      .text((d, i) => this._nodes[i]);
  }
}

customElements.define('com-sample-chorddependency', ChordDependencyWidget);

