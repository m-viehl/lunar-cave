import { LitElement, html } from 'lit';

/**
 * a reusable HTML select button that is similar to a <select> field
 * 
 * - option labels and respective values are given as semicolon-separated strings
 *   (using <option> tags inside was too complicated to set up for the simple use-case...)
 * - these are expected to NOT CHANGE.
 * - each selectbutton automatically persists its last selected value to localstorage.
 * - as key, a "cleaned" version of this.label is used, so this should be unique for the
 *   whole app! (If not, you'll need to extend this implementation...)
 * - this is robust to changes of the set of possible values
 * - the current value can be read by `this.value`.
 */
export class SelectButton extends LitElement {

    // state
    static properties = {
        label: { type: String },
        value: { type: String },
        options: { type: String },
        values: { type: String },
        default_index: { type: Number },
    };
    declare value: string
    declare label: string
    declare options: string
    declare values: string
    declare default_index: number

    constructor() {
        super();
        this.value = ""
        this.label = ""
        this.options = ""
        this.values = ""
        this.default_index = 0
    }

    // non-state fields
    initialized = false
    options_list: { option: string, value: string, id: string }[] = []
    button_uid = ""


    willUpdate(): void {
        // this will run on every value update and before first render
        if (!this.initialized) {
            // only run this once!
            this.init()
            this.initialized = true
        }
    }

    /**
     * - should only be run once, when public state can be read and before first render
     * - reads options, values and default from string HTML attributes (these stay static!)
     * 
     * - they are written to `this.options_list` and `this.value`
     * - then tries to overwrite the default if a valid entry is found in localstorage
     * - then overwrites localstorage with whatever is now set. (This is because if options are
     *   changed during development, now invalid values may still be in localstorage and should
     *   be overwritten.)
     * - then fires a "init" event that tells parents that the correct value can now be read.
     */
    private init() {
        let option_list = this.options.split(";")
        let value_list = this.values.split(";")
        this.value = value_list[this.default_index]

        {
            // set this.button_uid to something label-specific
            let label_clean = this.label.toUpperCase().replace(/[^a-zA-Z0-9]+/g, '')
            this.button_uid = `SELECTBUTTON_${label_clean}`
        }

        // read current option from localstorage
        let val = window.localStorage.getItem(this.button_uid)
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
            id: `${this.button_uid}_${option}`
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

    /**
     * Writes this element's currently selected option to localstorage
     */
    private persist() {
        window.localStorage.setItem(this.button_uid, this.value);
    }


    render() {
        const groupId = this.button_uid;
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
