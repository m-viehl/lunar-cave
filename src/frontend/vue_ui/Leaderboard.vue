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
import { scoresObj } from './server_data';
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