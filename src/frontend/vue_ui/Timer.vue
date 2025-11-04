<template>
    <div class="menu timer">
        <span>{{ time.toFixed(1) }}</span>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

let props = defineProps<{
    tstart: number; // starting timestamp, as from Date.now()
    running: boolean;
}>();

let time = ref(0);
let intervalId: number | null = null;

function updateTime() {
    time.value = (Date.now() - props.tstart) / 1000;
}

function startTimer() {
    if (intervalId != null) return;
    updateTime();
    intervalId = window.setInterval(updateTime, 50);
}

function stopTimer() {
    if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

watch(() => props.running, (isRunning) => {
    if (isRunning) startTimer(); else stopTimer();
});

watch(() => props.tstart, () => {
    // reset displayed time on new start timestamp
    time.value = 0;
    if (props.running) {
        stopTimer();
        startTimer();
    }
});

onMounted(() => {
    time.value = props.running ? (Date.now() - props.tstart) / 1000 : 0;
    if (props.running) startTimer();
});

onUnmounted(() => {
    stopTimer();
});
</script>

<style lang="css" scoped>
span {
    display: inline-block;
    width: 6ch;
    text-align: center;
    font-variant-numeric: tabular-nums;
}
</style>