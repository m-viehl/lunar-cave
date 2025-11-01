<template>
  <div class="menu">
    <h2>Leaderboard</h2>
    <table v-if="highscores != null">
      <tr v-for="([name, time], index) in highscores" :key="name">
        <td>{{ index + 1 }}</td>
        <td>{{ name }}</td>
        <td>{{ time }}</td>
      </tr>
    </table>
    <p v-else>Loading...</p>
  </div>

</template>

<script lang="ts" setup>
import { onMounted, ref, type Ref } from "vue";

let highscores: Ref<[string, number][] | null> = ref(null)

function fetchHighscores() {
  // TODO fetch highscores outside and pass as property
  setTimeout(() => {
    highscores.value = [["Heinz", 33.2], ["Bert", 23.84]]
  }, 300);
}

onMounted(fetchHighscores);

</script>
