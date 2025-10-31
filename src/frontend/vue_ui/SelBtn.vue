<template>
  <div>
    <p>{{ label }}</p>
    <div class="radio-group">
      <template v-for="(optionLabel, optionValue) in options" :key="optionValue">
        <input
          type="radio"
          :id="`option-${optionValue}`"
          :value="optionValue"
          v-model="value"
        />
        <label :for="`option-${optionValue}`">{{ optionLabel }}</label>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  options: Record<string | number, string>;
}>();

const value = defineModel<string | number>();
</script>