<template>
  <div v-show="ui_game_state != 'ingame'">
    <div class="menu">
      <h1>Lunar Cave</h1>
      <SelBtn v-model="state.mode" label="" group_id="mode-sel" :options="{
        'custom': 'Custom Game',
        'challenge': 'Weekly Challenge'
      }" />

      <CustomSettings v-show="state.mode == 'custom'" />
    </div>
    <Help :initmode="ui_game_state == 'init'" />
  </div>
</template>

<script lang="ts" setup>
import { state } from "./state";
import SelBtn from "./SelBtn.vue";
import CustomSettings from "./CustomSettings.vue";
import Help from "./Help.vue";
// TODO what are these ts errors?
import { draw_main, screen_size_changed } from '../logic/rendering';
import { computed, onMounted, ref, watch, type ComputedRef, type Ref } from "vue";
import { FrontendGame } from "../logic/frontend_game";

type UIGameState = "init" | "ingame" | "won" | "lost";

let ui_game_state: Ref<UIGameState> = ref("init");
let seed: Ref<number> = ref(Date.now())

let game: ComputedRef<FrontendGame> = computed(() => {
  // get config
  const SCALE = 20
  // TODO consider both modes
  let config = {
    time_factor: parseFloat(state.customSettings.speed_select),
    cave_scale: parseFloat(state.customSettings.size_select) * SCALE,
    length: parseFloat(state.customSettings.length_select),
    seed: seed.value,
    ship_scale: SCALE,
  }
  let game = new FrontendGame(config, gameover, won);
  screen_size_changed()
  draw_main(game)
  return game
})

// on new game, go to init mode
watch(game, () => { ui_game_state.value = "init" })

// register listeners
onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("resize", () => {
    screen_size_changed()
    draw_main(game.value)
  });
})

function handleKeyDown(event: KeyboardEvent) {
  // Skip if this is a repeated key press
  if (event.repeat) return;

  const key = event.key.toLowerCase();

  // Handle N key
  if (key === 'n') {
    if (ui_game_state.value != "ingame") {
      seed.value = Date.now() // new seed, rest is reactive
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

// callback functions for game component
function gameover() {
  ui_game_state.value = "lost"
}

function won() {
  // TODO pass game result to handle upload
  ui_game_state.value = "won"
}

</script>
