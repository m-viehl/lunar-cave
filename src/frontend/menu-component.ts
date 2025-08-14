import { LitElement, html, css } from 'lit';
import { GameConfig } from '../shared/config';
import * as main from './main';

export type GameState = "init" | "ingame" | "won" | "lost";

export class MenuComponent extends LitElement {
    static properties = {
        state: { type: String }
    };

    state: GameState = "init";

    static styles = css`
    :host {
      display: block;
    }

    .menu {
      padding: 2rem;
      margin: 2rem;
      background-color: rgba(255, 255, 255, 0.25);
      border-radius: 1rem;
      width: fit-content;
      height: fit-content;
    }

    .key {
      border: 1pt solid black;
      padding-left: 3pt;
      padding-right: 3pt;
      border-radius: 3pt;
    }

    .keygrid {
      display: inline-grid;
      grid-template-columns: 1fr 1fr 1fr;
    }

    h2 {
      margin-top: 2em;
    }

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

    /* Button styling to match radio buttons */
    button {
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      background-color: rgba(255, 255, 255, 0.25);
      border: none;
      border-radius: 0.25rem;
      outline: none;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
    }

    button:hover {
      background-color: rgba(255, 255, 255, 0.4);
    }

    .hidden {
      display: none;
    }
  `;

    connectedCallback() {
        // COMPONENT ADDED TO DOM
        super.connectedCallback();
        window.addEventListener('keydown', this._handleKeyDown.bind(this));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('keydown', this._handleKeyDown.bind(this));
    }

    private _handleKeyDown(event: KeyboardEvent) {
        // Skip if this is a repeated key press
        if (event.repeat) {
            return;
        }

        const key = event.key.toLowerCase();

        // Handle N key
        if (key === 'n') {
            this._onNKeyPressed();
        }

        // Handle space key
        if (key === ' ') {
            this._onSpaceKeyPressed();
        }

        // Handle WASD and arrow keys
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
            this._onMovementKeyPressed(key);
        }
    }

    // Callback functions for key presses
    private _onNKeyPressed() {
        if (this.state != "ingame"){
            main.new_game()
            this.state = "init"
        }
    }

    private _onSpaceKeyPressed() {
        if (this.state != "ingame") {
            main.reset()
            this.state = "init"
        }
    }

    private _onMovementKeyPressed(key: string) {
        if (this.state == "init") {
            main.start()
            // sets this.state in first tick
        }
    }


    private _onConfigChange() {
        main.new_game()
        this.state = "init"
    }

    getConfig(): GameConfig {
        let time_factor = parseFloat((this.shadowRoot?.querySelector('input[name="physics_speed"]:checked') as HTMLInputElement)?.value || "1.0")
        let scale_factor = parseFloat((this.shadowRoot?.querySelector('input[name="cave_size"]:checked') as HTMLInputElement)?.value || "1.0")
        let length = parseFloat((this.shadowRoot?.querySelector('input[name="cave_length"]:checked') as HTMLInputElement)?.value || "350")
        let seed = Date.now();
        const SCALE = 20
        return {
            time_factor: time_factor,
            cave_scale: scale_factor * SCALE,
            ship_scale: SCALE,
            length: length,
            seed: seed,
        }
    }

    // TODO extract the toggle buttons to separate lit components later, and simplyfy getConfig with that.


    render() {
        if (this.state == "ingame") {
            return html``;
        }

        return html`
      <div class="menu">
        <h1>Lunar Cave</h1>
        ${this.state !== "init" ? html`
          <div>
            <h2>${this.state == "won" ? "You won!" : "You lost!"}</h2>
          </div>
        ` : ''}
        <div>
          <h2>Controls</h2>
          <p>
            Use <div class="keygrid">
                <span></span>
                <span class="key">W</span>
                <span></span>
                <span class="key">A</span>
                <span></span>
                <span class="key">D</span>
            </div> or <div class="keygrid">
                <span></span>
                <span class="key">↑</span>
                <span></span>
                <span class="key">←</span>
                <span></span>
                <span class="key">→</span>
            </div> to control the ship.
          </p>
          ${this.state == "init" ?
                html`<p>Press any of these keys to start.</p>`
                :
                html`<p>Press <span class="key">space</span> to retry this cave or <span class="key">N</span> for a new cave.</p>`
            }
        </div>
        <div>
          <h2>Settings</h2>
          <p>Select physics speed:</p>
          <div class="radio-group" id="physics_speed_group">
            <input type="radio" id="physics_slow" name="physics_speed" value="0.5" @change=${this._onConfigChange}>
            <label for="physics_slow">Slow</label>
            <input type="radio" id="physics_fast" name="physics_speed" value="1.0" checked @change=${this._onConfigChange}>
            <label for="physics_fast">Fast</label>
          </div>
          
          <p>Select cave size:</p>
          <div class="radio-group" id="cave_size_group">
            <input type="radio" id="cave_wide" name="cave_size" value="2.0" @change=${this._onConfigChange}>
            <label for="cave_wide">Wide</label>
            <input type="radio" id="cave_narrow" name="cave_size" value="1.0" checked @change=${this._onConfigChange}>
            <label for="cave_narrow">Narrow</label>
          </div>
          
          <p>Select cave length:</p>
          <div class="radio-group" id="cave_length_group">
            <input type="radio" id="cave_short" name="cave_length" value="100" @change=${this._onConfigChange}>
            <label for="cave_short">Short</label>
            <input type="radio" id="cave_medium" name="cave_length" value="350" checked @change=${this._onConfigChange}>
            <label for="cave_medium">Medium</label>
            <input type="radio" id="cave_long" name="cave_length" value="600" @change=${this._onConfigChange}>
            <label for="cave_long">Long</label>
          </div>
          
          <p>Click <button onclick="document.body.requestFullscreen()">here</button> to go to fullscreen mode.</p>
        </div>
      </div>
    `;
    }
}

customElements.define('menu-component', MenuComponent);

declare global {
    interface HTMLElementTagNameMap {
        'menu-component': MenuComponent;
    }
}
