<template>
    <div class="menu right">
        <h2>Controls</h2>
        <p>
            Use
        <div class="keygrid">
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

        <p v-if="initmode">
            Press any of these keys to start.
        </p>
        <p v-else>
            Press <span class="key">space</span> to retry this cave or <span class="key">N</span> for a new cave.
        </p>
    </div>
</template>


<script lang="ts" setup>
const props = defineProps<{
  initmode: boolean;
}>();
</script>