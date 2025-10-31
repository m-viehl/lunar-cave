import { LitElement, TemplateResult, html } from 'lit';
import { GameConfig } from '../../shared/config';
import * as main from '../logic/frontend_game';
import { SelectButton } from './select-button';
import { draw_main, screen_size_changed } from '../logic/rendering';
import { GameState } from '../../shared/game';

export type UIGameState = "init" | "ingame" | "won" | "lost";

export class MenuComponent extends LitElement {

    // TODO hide mouse cursor! (and show briefly when moved and hidden, then re-hide.)

    // REACTIVE STATE
    static properties = {
        state: { type: String }
    };

    declare state: UIGameState;

    constructor() {
        super();
        // initialize reactive state variables, these must be initialized in the constructor!
        this.state = "init";
    }

    // OTHER VARIABLES
    seed = Date.now();
    first_init_done = false;
    game: main.FrontendGame | null = null;


    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('keydown', this._handleKeyDown.bind(this));
        window.addEventListener("resize", this.screen_size_callback.bind(this));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('keydown', this._handleKeyDown.bind(this));
        window.removeEventListener("resize", this.screen_size_callback.bind(this));
    }

    screen_size_callback() {
        if (this.game) {
            screen_size_changed()
            draw_main(this.game)
        }
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
            this.new_game(this.getConfig(true)!)
            this.state = "init"
        }
    }

    private _onSpaceKeyPressed() {
        // TODO this will interfere with pressing space when entering name for highscore
        if (this.state != "ingame" && this.game) {
            this.game.reset()
            this.state = "init"
        }
    }

    private _onMovementKeyPressed(key: string) {
        if (this.state == "init" && this.game) {
            this.state = "ingame"
            this.game.start()
        }
    }

    private new_game(config: GameConfig) {
        this.game = new main.FrontendGame(config, this)
        screen_size_changed();
        draw_main(this.game);
    }

    private on_config_init() {
        // each config element calls this after it is fully initialized.
        // if all are ready, getConfig will not return undefined anymore and we can start the game.
        // this is just for the very first init, where we want to create the very first game instance.
        // This is introduced because the config selectbuttons handle their own defaults and current values
        // and we need to wait with reading their values until they are fully initialized.
        // A bit ugly, yes, but seemed pragmatic.

        if (this.first_init_done)
            return
        let config = this.getConfig(false) // new seed only when we press N
        if (config) {
            this.new_game(config)
            this.first_init_done = true
        }
    }


    public gameover() {
        switch (this.game?.game.state) {
            case GameState.GAMEOVER:
                this.state = "lost"
                break
            case GameState.WON:
                this.state = "won"
                break
        }
    }


    private _onConfigChange() {
        // called when any config selectbutton is changed.
        // TODO include support for the mode toggle!

        this.state = "init" // when game ended and config is changed, go back to init
        let config = this.getConfig(false) // new seed only when we press N
        if (config) {
            this.new_game(config)
        }
    }

    /**
     * @returns the gameconfig or undefined if the UI is not ready yet
     */
    getConfig(new_seed: boolean): GameConfig | undefined {
        // TODO also query mode toggle and respond appropriately!

        const speedEl = this.querySelector('#speed_select') as SelectButton | null;
        const sizeEl = this.querySelector('#size_select') as SelectButton | null;
        const lengthEl = this.querySelector('#length_select') as SelectButton | null;
        if (!speedEl || !sizeEl || !lengthEl)
            return undefined;

        let time_factor = parseFloat(speedEl.value)
        let scale_factor = parseFloat(sizeEl.value)
        let length = parseFloat(lengthEl.value)

        if (isNaN(time_factor) || isNaN(scale_factor) || isNaN(length))
            return undefined;

        if (new_seed) {
            this.seed = Date.now();
        }
        const SCALE = 20

        let config = {
            time_factor: time_factor,
            cave_scale: scale_factor * SCALE,
            ship_scale: SCALE,
            length: length,
            seed: this.seed,
        }
        return config
    }


    render() {
        if (this.state == "ingame") {
            return html``;
        }

        let msg: string | TemplateResult = ""
        if (this.state != "init") {
            msg = html`
                <div>
                    <h2>${this.state == "won" ? "You won!" : "You lost!"}</h2>
                </div>
                `
        }

        return html`
    <div class="menu">
        <h1>Lunar Cave</h1>
        ${msg}

        <select-button id="mode_select" label="Select Game Mode:" @change=${this._onConfigChange}
                @init=${this.on_config_init} options="Weekly Challenge;Custom Game" values="challenge;custom" default_index=1></select-button>

        <div class="menu">
            <h2>Settings</h2>
            <select-button id="speed_select" label="Select physics speed:" @change=${this._onConfigChange}
                @init=${this.on_config_init} options="Slow;Fast" values="0.5;1.0" default_index=1></select-button>
    
            <select-button id="size_select" label="Select cave size:" @change=${this._onConfigChange}
                @init=${this.on_config_init} options="Wide;Narrow" values="2.0;1.0" default_index=1></select-button>
    
            <select-button id="length_select" label="Select cave length:" @change=${this._onConfigChange}
                @init=${this.on_config_init} options="Short;Medium;Long" values="100;350;600" default_index=1>
            </select-button>
    
            <p>Click <button onclick="document.body.requestFullscreen()">here</button> to go to fullscreen mode.</p>
        </div>
    </div>


    <div class="menu right">
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
                html`<p>Press <span class="key">space</span> to retry this cave or <span class="key">N</span> for a new cave.
            </p>`
            }
        </div>
    `;
    }

    createRenderRoot() {
        return this; // Light DOM for global CSS
    }
}

customElements.define('menu-component', MenuComponent);

declare global {
    interface HTMLElementTagNameMap {
        'menu-component': MenuComponent;
    }
}
