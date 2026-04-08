<script setup lang="ts">
import { InputNumber, ToggleSwitch } from 'primevue'

defineProps<{
  hasSameConfigOption: boolean
  name: string
  min?: number
  max?: number
  unitAmount: number
}>()

const sameConfig = defineModel<boolean>('same-config', { required: true })

const emit = defineEmits<{
  (e: 'update:unit-amount', val: number): void
}>()
// const unitAmount = defineModel<number | null>('unit-amount', { required: true })
</script>

<template>
  <div class="unit">
    <div class="header">
      <InputNumber
        size="small"
        :model-value="unitAmount"
        :min
        :max
        show-buttons
        button-layout="horizontal"
        :step="1"
        fluid
        class="amount"
        @update:model-value="(val) => emit('update:unit-amount', val)"
      >
        <template #decrementicon><span class="pi pi-minus" /></template>
        <template #incrementicon><span class="pi pi-plus" /></template>
      </InputNumber>
      <div class="name">{{ name }}</div>
      <label v-if="hasSameConfigOption" class="config-toggle">
        use same weapon options
        <ToggleSwitch v-model="sameConfig" fluid />
      </label>
    </div>
    <div class="options"><slot></slot></div>
  </div>
</template>

<style scoped>
.unit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.amount {
  width: 130px;
}
.name {
  flex: 1 2 auto;
  font-size: 1.2rem;
}
.config-toggle {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  gap: 0.25rem;
}
.options {
  /* display: flex;
  flex-direction: column;
  gap: 0.75rem; */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
</style>
