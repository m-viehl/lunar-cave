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
    />

    <SelBtn
      v-model="state.customSettings.length_select"
      :options="{
        '100': 'Short',
        '350': 'Medium',
        '600': 'Long'
      }"
      label="Select cave length"
    />

    <SelBtn
      v-model="state.customSettings.speed_select"
      :options="{
        '0.5': 'Slow',
        '1.0': 'Fast'
      }"
      label="Select physics speed"
    />
  </div>
  
</template>

<script setup>
import SelBtn from "./SelBtn.vue";
import { state } from "./state";
</script>



