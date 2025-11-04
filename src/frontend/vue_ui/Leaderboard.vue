<template>
  <div class="menu">
    <h2>Leaderboard</h2>
    <table v-if="highscores != null && highscores.length > 0">
      <tr v-for="([name, time], index) in highscores" :key="name">
        <td><b>{{ index + 1 }}</b></td>
        <td>{{ name }}</td>
        <td>{{ time .toFixed(2)}}</td>
      </tr>
    </table>
    <p v-else-if="highscores?.length == 0">No highscores yet</p>
    <p v-else>Loading...</p>
  </div>

</template>

<script lang="ts" setup>
import { onMounted, ref, type Ref } from "vue";
import type { HighscoresType } from "../../backend/api_types"

let highscores: Ref<[string, number][] | null> = ref(null)

async function fetchHighscores() {
  try {
    const response = await fetch('/api/highscores', { method: 'GET' })
    if (!response.ok)
      return

    const data = await response.json() as HighscoresType

    const mapped: [string, number][] = []
    for (const item of data) {
      mapped.push([item.name, item.time])
    }
    highscores.value = mapped
  } catch (_) {
    // ignore and keep highscores as null
  }
}

onMounted(fetchHighscores);

defineExpose({ fetchHighscores });

</script>
