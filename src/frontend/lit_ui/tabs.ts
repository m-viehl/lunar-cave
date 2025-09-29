import { LitElement, html, css } from 'lit';

class TabPanel extends LitElement {
    label = '';
    active = false;

    static styles = css`
    :host {
      display: none;
    }
    :host([active]) {
      display: block;
    }
  `;

    static get properties() {
        return {
            label: { type: String },
            active: { type: Boolean, reflect: true }
        };
    }

    render() {
        return html`<slot></slot>`;
    }
}

customElements.define('tab-panel', TabPanel);

class TabsContainer extends LitElement {
    activeIndex = 0;
    panels: TabPanel[] = [];

    static styles = css`
    .tablist {
      display: flex;
      border-bottom: 1px solid #ccc;
    }
    button {
      border: none;
      background: none;
      padding: 0.5rem 1rem;
      cursor: pointer;
    }
    button[active] {
      border-bottom: 2px solid blue;
      font-weight: bold;
    }
  `;

    static get properties() {
        return {
            activeIndex: { type: Number }
        };
    }

    firstUpdated() {
        this.panels = Array.from(this.querySelectorAll('tab-panel'));
        this._updatePanels();
    }

    _selectTab(index: number) {
        this.activeIndex = index;
        this._updatePanels();
    }

    _updatePanels() {
        this.panels.forEach((panel, i) => {
            panel.active = i === this.activeIndex;
        });
        this.requestUpdate();
    }

    render() {
        return html`
        <div class="tablist" role="tablist">
            ${this.panels.map(
            (panel, i) => html`
            <button role="tab" ?active=${i===this.activeIndex} @click=${()=> this._selectTab(i)}>
                ${panel.label}
            </button>
            `
            )}
        </div>
        <slot></slot>
        `;
    }
}

customElements.define('tabs-container', TabsContainer);

// Usage:
//
// <tabs-container>
//   <tab-panel label="A">Content A</tab-panel>
//   <tab-panel label="B">Content B</tab-panel>
// </tabs-container>
