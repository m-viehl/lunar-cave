<script setup lang="ts">
import Leaderboard from './Leaderboard.vue';
import NameDialog from './NameDialog.vue';
import { is_dialog_open } from "./state";


let last_input = "";

function name_confirm(name_entered: string) {
    is_dialog_open.value = false;

    // TODO now upload last_input!
    console.log("uploading highscore")
    // TODO and re-fetch highscore list!
}

function name_cancel() {
    is_dialog_open.value = false;
}

/**
 * Call from outside when a challenge game is won.
 * The component will decide whether this is good enough for the highscore list
 * and then ask for a name, upload and reload the leaderboard.
 * 
 * @param time_s the time of the run in seconds
 * @param input_sequence the serialized input sequence for validation
 */
function won_game(time_s: number, input_sequence: string) {
    // TODO check time_s before doing anything!
    last_input = input_sequence;
    is_dialog_open.value = true;
    // logic continues in name_confirm!
}

defineExpose({
    won_game
})

</script>


<template>
    <div>
        <Leaderboard />
        <NameDialog @confirm="name_confirm" @cancel="name_cancel" />
    </div>
</template>
