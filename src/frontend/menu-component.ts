import { LitElement, html, css, PropertyValues } from 'lit';
import { GameConfig } from '../shared/config';
import * as main from './main';
import { SelectButton } from './select-button';

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
    if (this.state != "ingame") {
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

  firstUpdated() {
    console.log("MENU firstupdated")
    main.new_game() // everything is loaded by now
  }


  private _onConfigChange() {
    main.new_game()
    this.state = "init"
  }

  getConfig(): GameConfig {
    // TODO how do I access these now? the getElements are null...
    console.log("speed_select: ", this.shadowRoot?.getElementById("speed_select"), "value", this.shadowRoot?.getElementById("speed_select").value)
    let time_factor = parseFloat((this.shadowRoot?.getElementById("speed_select") as SelectButton).value)
    let scale_factor = parseFloat((this.shadowRoot?.getElementById("size_select") as SelectButton).value)
    let length = parseFloat((this.shadowRoot?.getElementById("length_select") as SelectButton).value)

    console.log(`getConfig:`)

    let seed = Date.now();
    const SCALE = 20
    
    let config = {
      time_factor: time_factor,
      cave_scale: scale_factor * SCALE,
      ship_scale: SCALE,
      length: length,
      seed: seed,
    }
    console.log("config: ", config)
    return config
  }


  render() {
    console.log("render")
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
          <select-button id="speed_select" label="Select physics speed:" @change=${this._onConfigChange}>
            <option value="0.5">Slow</option>
            <option value="1.0" selected>Fast</option>
          </select-button>

          <select-button id="size_select" label="Select cave size:" @change=${this._onConfigChange}>
            <option value="2.0">Wide</option>
            <option value="1.0" selected>Narrow</option>
          </select-button>

          <select-button id="length_select" label="Select cave length:" @change=${this._onConfigChange}>
            <option value="100">Short</option>
            <option value="350" selected>Medium</option>
            <option value="600">Long</option>
          </select-button>

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
