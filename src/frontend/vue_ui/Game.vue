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


/////////////////////////////////
// cursor hiding functionality
/////////////////////////////////

let hideCursorTimer: number = -1;

function updateCursorCSS() {
    // disable running timer, if exists
    clearTimeout(hideCursorTimer!); // (invalid ids don't do anything)
    // set css
    canvas.value!.style.cursor = props.hidecursor ? "none" : "";
}

function onMouseMove() {
    if (!props.hidecursor) return;
    // hide
    canvas.value!.style.cursor = "";
    // (re)set hide timeout to 1s
    if (hideCursorTimer) clearTimeout(hideCursorTimer);
    hideCursorTimer = window.setTimeout(() => {
        canvas.value!.style.cursor = "none";
    }, 1000);
}

watch(() => props.hidecursor, updateCursorCSS);

/////////////////////////////////
/////////////////////////////////


onMounted(() => {
    set_canvas(canvas.value!);
    window.addEventListener("resize", repaint);
    canvas.value!.addEventListener("mousemove", onMouseMove);
    updateCursorCSS();
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