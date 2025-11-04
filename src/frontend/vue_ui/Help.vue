<template>
    <div class="menu right">
        <template v-if="ui_state == 'init'">
            <h2>Controls</h2>
            <p>
                Use
                <span class="keygrid">
                    <span></span>
                    <span class="key">W</span>
                    <span></span>
                    <span class="key">A</span>
                    <span></span>
                    <span class="key">D</span>
                </span> or <span class="keygrid">
                    <span></span>
                    <span class="key">↑</span>
                    <span></span>
                    <span class="key">←</span>
                    <span></span>
                    <span class="key">→</span>
                </span> to control the ship.
            </p>

            <p>
                Press any of these keys to start.
            </p>
        </template>
        <template v-else-if="ui_state != 'ingame'">
            <h2 v-if="ui_state == 'won'">You won!</h2>
            <h2 v-else>You lost!</h2>
            <p v-if="state.mode == 'custom'">
                Press <span class="key">space</span> to retry this cave or <span class="key">N</span> for a new cave.
            </p>
            <p v-else>Press <span class="key">space</span> to retry the challenge.</p>
        </template>
    </div>
</template>


<script lang="ts" setup>
import { state } from './state';

defineProps<{
    ui_state: string;
}>();
</script>