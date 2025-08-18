import { LitElement, html, css } from 'lit';

const LOCALSTORAGE_PREFIX = "SELECT_BTN_" // TODO is this random enough? Should be app-specific..?

export class SelectButton extends LitElement {


    static styles = css`
    
        /* Radio button group styling */
        .radio-group {
          display: flex;
          gap: 0;
          margin: 0.5rem 0;
          padding: 0.5rem;
          background-color: rgba(255, 255, 255, 0.25);
          border-radius: 0.5rem;
          width: fit-content;
        }
    
        .radio-group input[type="radio"] {
          display: none;
        }
    
        .radio-group label {
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          margin: 0 0.125rem;
          border-radius: 0.25rem;
          outline: none;
        }
    
        .radio-group input[type="radio"]:checked + label {
          background-color: rgba(255, 255, 255, 0.4);
        }
    
        .radio-group label:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
    
      `;

    // state
    static properties = {
        label: { type: String },
        value: { type: String }
    };

    value: string = "" // TODO how to initialize such properties in lit?
    label: string = ""

    connectedCallback(): void {
      console.log("SELECT connected")
    }


    firstUpdated(): void {
        /*
        It is important to use firstUpdated, otherwise the slotted options
        might not be present yet and render won't trigger!
        */
        const options = this._getOptions();
        const selected = options.find(o => o.hasAttribute('selected'));
        if (selected) {
            this.value = selected.value;
        } else if (options.length) {
            this.value = options[0].value;
        } else {
            this.value = ""
            console.log("setting value to ''")
        }
        this.restore(); // does nothing if no value is present

        console.log("BUTTON firstupdated, value is ", this.value)
        // TODO parse options once, write to object property.
        // then, in restore, check that option is still valid (when changing options, we must
        // not load old ones!)
    }

    private _getOptions(): HTMLOptionElement[] {
        return Array.from(this.querySelectorAll('option'));
    }

    private _onChange(e: Event): void {
        const target = e.target as HTMLInputElement;
        this.value = target.value;
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        this.persist();
    }

    /**
     * Writes this element's currently selected option to localstorage
     */
    private persist() {
        const groupId = this.label.toUpperCase().replace(/\s+/g, '_');
        let storage_key = LOCALSTORAGE_PREFIX + groupId
        window.localStorage.setItem(storage_key, this.value);
    }

    /**
     * Reads and selects the currently selected option from localstorage
     */
    private restore() {
        const groupId = this.label.toUpperCase().replace(/\s+/g, '_');
        let storage_key = LOCALSTORAGE_PREFIX + groupId
        let val = window.localStorage.getItem(storage_key)
        if (val !== null) {
            this.value = val;
        }
    }


    render() {
        const options = this._getOptions();
        const groupId = this.label.toLowerCase().replace(/\s+/g, '_') + '_group';
        return html`
      <p>${this.label}</p>
      <div class="radio-group" id=${groupId}>
        ${options.map(o => html`
          <input
            type="radio"
            id=${o.id}
            name=${groupId}
            value=${o.value}
            ?checked=${this.value === o.value}
            @change=${this._onChange}
          >
          <label for=${o.id}>${o.textContent}</label>
        `)}
      </div>
    `;
    }

    // createRenderRoot() {
    //     return this; // Light DOM for existing CSS // TODO put all into global CSS!
    // }
}

customElements.define('select-button', SelectButton);

declare global {
    interface HTMLElementTagNameMap {
        'select-button': SelectButton;
    }
}
