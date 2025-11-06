<template>
    <canvas ref="canvas" width="100px" height="100px" :class="{ blurred: blur }">Your browser does not
        support
        HTML5 canvas.</canvas>
</template>


<script setup lang="ts">
import { onMounted, onBeforeUnmount, useTemplateRef, watch } from 'vue';
import type { FrontendGame } from '../logic/frontend_game';
import { draw_main, screen_size_changed, set_canvas } from '../logic/rendering';

let props = defineProps<{
    game: FrontendGame;
    blur: boolean;
    hidecursor: boolean;
}>();

function repaint() {
    screen_size_changed()
    draw_main(props.game)
}

let canvas = useTemplateRef("canvas");
let hideCursorTimer: number | null = null;

function updateCursorHidden() {
    if (!props.hidecursor) {
        canvas.value!.style.cursor = "";
        return;
    }
    canvas.value!.style.cursor = "none";
}

function onMouseMove() {
    if (!props.hidecursor) return;
    canvas.value!.style.cursor = "";
    if (hideCursorTimer) clearTimeout(hideCursorTimer);
    hideCursorTimer = window.setTimeout(() => {
        canvas.value!.style.cursor = "none";
    }, 1000);
}

watch(() => props.hidecursor, updateCursorHidden);

onMounted(() => {
    set_canvas(canvas.value!);
    window.addEventListener("resize", repaint);
    canvas.value!.addEventListener("mousemove", onMouseMove);
    updateCursorHidden();
    repaint();
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", repaint);
    canvas.value?.removeEventListener("mousemove", onMouseMove);
});
</script>


<style lang="css" scoped>
canvas.blurred {
    filter: blur(2em);
    transform: scale(1.2);
}

canvas {
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: -1;
}
</style>