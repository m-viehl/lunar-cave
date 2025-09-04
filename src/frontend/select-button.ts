import { LitElement, html } from 'lit';

const LOCALSTORAGE_PREFIX = "SELECT_BTN_" // TODO is this random enough? Should be app-specific..?

export class SelectButton extends LitElement {


    // state
    static properties = {
        label: { type: String },
        value: { type: String },
        options: { type: String },
        values: { type: String },
        default_index: { type: Number },
    };

    value: string = ""
    label: string = ""
    options: string = ""
    values: string = ""
    default_index: number = 0

    options_list: { option: string, value: string, id: string }[] = []

    willUpdate(): void {
        let option_list = this.options.split(";")
        let value_list = this.values.split(";")
        this.value = value_list[this.default_index]

        // read current option from localstorage
        let val = window.localStorage.getItem(this.get_storage_key())
        if (
            val !== null && // any value stored
            value_list.indexOf(val) >= 0 // and valid option
        ) {
            this.value = val;
        }
        this.persist(); // this overwrites invalid options that may be in localstorage

        this.options_list = option_list.map((option, index) => ({
            option: option,
            value: value_list[index],
            id: `option_${option}`
        }));

        // after initialization, fire a changed event
        this.dispatchEvent(new Event('init', { bubbles: true, composed: true }));
    }



    private on_change(e: Event): void {
        const target = e.target as HTMLInputElement;
        this.value = target.value;
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        this.persist();
    }

    private get_storage_key() {
        return LOCALSTORAGE_PREFIX + this.label.toUpperCase().replace(/[^a-zA-Z0-9]+/g, '');
    }

    /**
     * Writes this element's currently selected option to localstorage
     */
    private persist() {
        window.localStorage.setItem(this.get_storage_key(), this.value);
    }


    render() {
        const groupId = this.get_storage_key();
        return html`
    <p>${this.label}</p>
    <div class="radio-group" id=${groupId}>
        ${this.options_list.map(o => html`
        <input type="radio" id=${o.id} name=${groupId} value=${o.value} ?checked=${this.value===o.value}
            @change=${this.on_change}>
        <label for=${o.id}>${o.option}</label>
        `)}
    </div>
    `;
    }

    createRenderRoot() {
        return this; // Light DOM for global CSS
    }
}

customElements.define('select-button', SelectButton);

declare global {
    interface HTMLElementTagNameMap {
        'select-button': SelectButton;
    }
}
