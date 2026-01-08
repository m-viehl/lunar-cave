<template>
  <div class="menu">
    <h2>Leaderboard</h2>
    <table v-if="scoresObj != null && scoresObj.highscores.length > 0">
      <tr v-for="(score, index) in scoresObj.highscores">
        <td class="tright"><b>{{ index + 1 }}</b></td>
        <td>{{ score.name }}</td>
        <td>{{ score.time.toFixed(2) }}</td>
      </tr>
    </table>
    <p v-else-if="scoresObj?.highscores.length == 0">No highscores yet</p>
    <p v-else>Loading...</p>
  </div>

</template>

<script lang="ts" setup>
import { onMounted, ref, type Ref } from "vue";
import type { HighscoresType } from "../../backend/api_types"
import { best_challenge_input_sequence } from "./state";

let scoresObj: Ref<HighscoresType | null> = ref(null)

async function fetchHighscores() {
  try {
    const response = await fetch('/api/highscores', { method: 'GET' })
    if (!response.ok)
      return

    const data = await response.json() as HighscoresType

    // write result to refs
    scoresObj.value = data
    best_challenge_input_sequence.value = get_best_input_sequence();
  } catch (_) {
    // ignore and keep highscores as null
  }
}

function is_qualified_for_highscore(time: number): boolean {
  if (scoresObj.value == null)
    return false;

  let len_scores = scoresObj.value.highscores.length;
  if (len_scores == scoresObj.value.max_length) {
    let worst_time = scoresObj.value.highscores[len_scores - 1]!.time;
    if (time > worst_time) {
      return false;
    }
  }
  return true;
}

/**
 * Return the input sequence of the currently best score in the leaderboard, if present,
 * or null otherwise.
 */
function get_best_input_sequence() {
  if (scoresObj.value == null)
    return null
  if (scoresObj.value.highscores.length == 0)
    return null
  let best = scoresObj.value.highscores[0]
  if (best?.input_sequence) {
    // this check is for the version transition, where scoresObj might not include
    // input_sequence yet.
    return best.input_sequence
  }
  return null
}

onMounted(fetchHighscores);

defineExpose({ fetchHighscores, is_qualified_for_highscore });

</script>

<style lang="css" scoped>
table {
  border-collapse: separate;
  border-spacing: 20px 0;
}

td.tright {
  text-align: right;
}
</style>