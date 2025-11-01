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
        <template v-else-if="ui_state == 'won'">
            <h2>You won!</h2>
            <p>
                Press <span class="key">space</span> to retry this cave or <span class="key">N</span> for a new cave.
            </p>
        </template>
        <template v-else-if="ui_state == 'lost'">
            <h2>You lost!</h2>
            <p>
                Press <span class="key">space</span> to retry this cave or <span class="key">N</span> for a new cave.
            </p>
        </template>
    </div>
</template>


<script lang="ts" setup>
defineProps<{
    ui_state: string;
}>();
</script>