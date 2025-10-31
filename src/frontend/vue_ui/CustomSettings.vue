<template>
  <div class="menu">
    <h2>Settings</h2>
    <SelBtn
      v-model="state.customSettings.size_select"
      :options="{
        '2.0': 'Wide',
        '1.0': 'Narrow'
      }"
      label="Select cave size"
      group_id="size-sel"
    />

    <SelBtn
      v-model="state.customSettings.length_select"
      :options="{
        '100': 'Short',
        '350': 'Medium',
        '600': 'Long'
      }"
      label="Select cave length"
      group_id="len-sel"
    />

    <SelBtn
      v-model="state.customSettings.speed_select"
      :options="{
        '0.5': 'Slow',
        '1.0': 'Fast'
      }"
      label="Select physics speed"
      group_id="speed-sel"
    />
  </div>
  
</template>

<script lang="ts" setup>
import SelBtn from "./SelBtn.vue";
import { state } from "./state";
</script>



