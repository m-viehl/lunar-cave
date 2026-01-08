<template>
  <div>
    <p>{{ label }}</p>
    <div class="radio-group">
      <template v-for="(optionLabel, optionValue) in options" :key="optionValue">
        <input
          type="radio"
          :id="`option-${optionValue}-${group_id}`"
          :value="optionValue"
          @change="onChange"
          :checked="value == optionValue"
        />
        <label :for="`option-${optionValue}-${group_id}`">{{ optionLabel }}</label>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  group_id: string; // needs to be unique per app and HTMLable
  options: Record<string | number, string>;
}>();

function onChange(e: Event) {
  let target = e.target as HTMLInputElement
  value.value = target.value;
}

const value = defineModel<string>();
</script>