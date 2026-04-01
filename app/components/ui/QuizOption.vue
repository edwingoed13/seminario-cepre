<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
  modelValue: string | null
  disabled?: boolean
  correct?: boolean | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isSelected = computed(() => props.modelValue === props.value)

const borderClass = computed(() => {
  if (props.correct === true && isSelected.value) return 'border-green-500 bg-green-50'
  if (props.correct === false && isSelected.value) return 'border-error bg-error-container'
  if (isSelected.value) return 'border-primary/20 bg-surface-container-low'
  return 'border-transparent'
})
</script>

<template>
  <label
    class="group relative flex items-center gap-4 p-5 rounded-xl cursor-pointer hover:bg-surface-container-low transition-all duration-200 border-2 active:scale-[0.98]"
    :class="[borderClass, disabled ? 'pointer-events-none opacity-70' : '']"
    @click="!disabled && emit('update:modelValue', value)"
  >
    <div
      class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
      :class="isSelected ? 'border-primary bg-primary' : 'border-outline-variant'"
    >
      <div class="w-2.5 h-2.5 rounded-full bg-white" :class="isSelected ? 'opacity-100' : 'opacity-0'"></div>
    </div>
    <span
      class="font-body text-lg transition-all"
      :class="isSelected ? 'text-on-surface font-bold' : 'text-secondary group-hover:text-on-surface'"
    >{{ label }}</span>
  </label>
</template>
