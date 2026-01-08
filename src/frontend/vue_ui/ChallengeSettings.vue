<template>
  <div class="menu">
    <h2>Settings</h2>
    <SelBtn
      v-model="state.challengeSettings.show_best_shadow"
      :options="{
        'true': 'On',
        'false': 'Off'
      }"
      label="Show shadow of best score"
      group_id="size-sel"
    />
  </div>
</template>

<script lang="ts" setup>
import SelBtn from "./SelBtn.vue";
import { state } from "./state";
</script>



