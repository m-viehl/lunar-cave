<template>
    <canvas ref="canvas" id="canvas" width="100px" height="100px" :class="{ blurred: blur }">Your browser does not
        support
        HTML5 canvas.</canvas>
</template>
<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from 'vue';
import type { FrontendGame } from '../logic/frontend_game';
import { draw_main, screen_size_changed, set_canvas } from '../logic/rendering';

let props = defineProps<{
    game: FrontendGame;
    blur: boolean;
}>();

function repaint() {
    screen_size_changed()
    draw_main(props.game)
}

let canvas = useTemplateRef("canvas");

watch(() => props.game, repaint);

onMounted(() => {
    set_canvas(canvas.value!);
    window.addEventListener("resize", repaint);
    repaint();
})

</script>

<style lang="css" scoped>
canvas.blurred {
    filter: blur(2em);
    transform: scale(1.2);
}
</style>