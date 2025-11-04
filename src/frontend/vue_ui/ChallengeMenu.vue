<script setup lang="ts">
import Leaderboard from './Leaderboard.vue';
import NameDialog from './NameDialog.vue';
import { is_dialog_open } from "./state";
import { useTemplateRef } from "vue";


let last_input = "";
const leaderboardRef = useTemplateRef("leaderboardRef")

async function name_confirm(name_entered: string) {
    // close dialog
    is_dialog_open.value = false;

    // upload last_input and re-fetch highscore list
    try {
        const response = await fetch('/api/new-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name_entered, input_sequence: last_input })
        })
        if (!response.ok) {
            console.log("error while uploading score")
        }
    } catch (_) {
        console.log("network error while uploading score")
    }
    last_input = "";
    // refresh leaderboard regardless of upload result
    leaderboardRef.value!.fetchHighscores()
}

function name_cancel() {
    is_dialog_open.value = false;
    last_input = "";
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
    if (!leaderboardRef.value?.is_qualified_for_highscore(time_s))
        return;

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
        <Leaderboard ref="leaderboardRef" />
        <NameDialog @confirm="name_confirm" @cancel="name_cancel" />
    </div>
</template>
