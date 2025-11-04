<template>
  <div v-show="ui_game_state != 'ingame'">
    <div class="menu">
      <h1>Lunar Cave</h1>
      <SelBtn v-model="state.mode" label="" group_id="mode-sel" :options="{
        'custom': 'Custom Game',
        'challenge': 'Weekly Challenge'
      }" />

      <CustomSettings v-show="state.mode == 'custom'" />

      <ChallengeMenu v-if="is_game_ready" v-show="state.mode == 'challenge'" ref="challengeMenu" />
      <p v-else><b>Challenge not available. Try reloading the page.</b></p>
    </div>
    <Help v-if="is_game_ready" :ui_state="ui_game_state" />
  </div>
</template>

<script lang="ts" setup>
import { is_dialog_open, state } from "./state";
import SelBtn from "./SelBtn.vue";
import CustomSettings from "./CustomSettings.vue";
import Help from "./Help.vue";
import { draw_main, screen_size_changed } from '../logic/rendering';
import { computed, onMounted, ref, useTemplateRef, watch, type ComputedRef, type Ref } from "vue";
import { FrontendGame } from "../logic/frontend_game";
import ChallengeMenu from "./ChallengeMenu.vue";
import type { CurrentChallengeType } from "../../backend/api_types"
import type { GameConfig } from "../../shared/config";

type UIGameState = "init" | "ingame" | "won" | "lost";

//////////////////////////////////////////////
// Refs
//////////////////////////////////////////////
let ui_game_state: Ref<UIGameState> = ref("init");
let custom_seed = ref(Date.now()) // seed for custom mode
let challengeMenu = useTemplateRef("challengeMenu")
let challenge_config: Ref<GameConfig | null> = ref(null);

//////////////////////////////////////////////
// Computed refs
//////////////////////////////////////////////

let is_game_ready = computed(() => {
  // Whether the current game object is valid with the current settings.
  if (state.mode == "challenge" && challenge_config.value == null)
    return false
  return true
})
// TODO blur game canvas when not ready!

let game = computed(() => {
  if (state.mode == "challenge" && challenge_config.value != null) {
    return new FrontendGame(challenge_config.value, gameover, won);
  }
  /*
  => custom mode or challenge not ready yet (need to fetch config!)
  In both cases we return the custom game to display something.
  In challenge mode, background will be blurred + error message.
  */
  const SCALE = 20;
  let game_config = {
    time_factor: parseFloat(state.customSettings.speed_select),
    cave_scale: parseFloat(state.customSettings.size_select) * SCALE,
    length: parseFloat(state.customSettings.length_select),
    seed: custom_seed.value,
    ship_scale: SCALE,
  }
  return new FrontendGame(game_config, gameover, won);
})


//////////////////////////////////////////////
// watchers
//////////////////////////////////////////////
watch(game, () => {
  // redraw with new game
  screen_size_changed()
  draw_main(game.value)
},
  { immediate: true } // also run when game is initialized!
)

// on new game, go to init mode
watch(game, () => { ui_game_state.value = "init" })

//////////////////////////////////////////////
// Listeners
//////////////////////////////////////////////
onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("resize", () => {
    screen_size_changed()
    draw_main(game.value)
  });
})


async function fetchChallengeGame() {
  try {
    const response = await fetch('/api/current-challenge', { method: 'GET' })
    if (!response.ok)
      return

    const data = await response.json() as CurrentChallengeType
    
    challenge_config.value = data.game_config;

    // TODO handle expiration of challenge!
  } catch (_) {
    // ignore and keep challenge_game as null
  }
}
onMounted(fetchChallengeGame);

function handleKeyDown(event: KeyboardEvent) {
  // don't react if the dialog is open
  if (is_dialog_open.value) return;

  // disable game interaction when not ready
  if (!is_game_ready.value) return;

  // Skip if this is a repeated key press
  if (event.repeat) return;

  const key = event.key.toLowerCase();

  // Handle N key
  if (key === 'n') {
    if (ui_game_state.value != "ingame") {
      custom_seed.value = Date.now() // new seed, rest is reactive
    }
  }

  // Handle space key
  if (key === ' ') {
    game.value.reset()
    ui_game_state.value = "init"
  }

  // Handle WASD and arrow keys
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    if (ui_game_state.value == "init") {
      ui_game_state.value = "ingame"
      game.value.start()
    }
  }
}

//////////////////////////////////////////////
// callback functions for game component
//////////////////////////////////////////////
function gameover() {
  ui_game_state.value = "lost"
}

function won() {
  ui_game_state.value = "won"
  if (state.mode == "challenge") {
    challengeMenu.value!.won_game(1234, game.value.game.get_recording_string()); // TODO number currently unused!
  }
}

</script>
