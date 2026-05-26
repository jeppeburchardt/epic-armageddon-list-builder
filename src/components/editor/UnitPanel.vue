<script setup lang="ts">
import { useSlots } from 'vue'

const props = defineProps<{
  hasSameConfigOption: boolean
  name: string
  min?: number
  max?: number
  unitAmount: number
  cost?: number
  costSign?: boolean
}>()

const sameConfig = defineModel<boolean>('same-config', { required: true })

const emit = defineEmits<{
  (e: 'update:unit-amount', val: number): void
}>()

const slots = useSlots()

function parseAndEmitAmount(event: Event) {
  const input = event.target as HTMLInputElement
  const parsed = input.valueAsNumber
  if (Number.isFinite(parsed)) {
    const clamped = Math.max(props.min ?? -Infinity, Math.min(props.max ?? Infinity, parsed))
    emit('update:unit-amount', clamped)
    return
  }
  input.value = String(props.unitAmount)
}
</script>

<template>
  <div class="unit surface p-small stack-small">
    <div class="header">
      <input
        class="amount"
        type="number"
        :value="unitAmount"
        :min="min"
        :max="max"
        step="1"
        @input="parseAndEmitAmount"
      />
      <div class="name">{{ name }}</div>
      <span v-if="cost !== undefined" class="cost-tag">
        {{ costSign && cost > 0 ? '+' : '' }}{{ cost }}pts
      </span>
    </div>
    <div v-if="slots.options" class="options"><slot name="options"></slot></div>
    <label v-if="hasSameConfigOption" class="config-toggle">
      use same weapon options
      <input v-model="sameConfig" type="checkbox" />
    </label>
  </div>
</template>

<style scoped>
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

.cost-tag {
  font-size: 0.75rem;
  flex-shrink: 0;
  border: 1px solid var(--ea-surface-border);
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  background: var(--ea-surface-100);
}

.config-toggle {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--ea-text-muted-color);
  gap: 0.25rem;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
</style>
