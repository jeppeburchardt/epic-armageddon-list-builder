<script setup lang="ts">
import { computed, useSlots } from 'vue'

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

const minAmount = computed(() => props.min ?? -Infinity)
const maxAmount = computed(() => props.max ?? Infinity)
const canDecrement = computed(() => props.unitAmount > minAmount.value)
const canIncrement = computed(() => props.unitAmount < maxAmount.value)

function emitClampedAmount(nextAmount: number) {
  const clamped = Math.max(minAmount.value, Math.min(maxAmount.value, nextAmount))
  emit('update:unit-amount', clamped)
}

function decrementAmount() {
  emitClampedAmount(props.unitAmount - 1)
}

function incrementAmount() {
  emitClampedAmount(props.unitAmount + 1)
}
</script>

<template>
  <div class="unit surface p-small stack-small">
    <div class="header">
      <div class="amount-control">
        <button
          type="button"
          class="amount-button"
          :aria-label="`Decrease ${name} count`"
          :disabled="!canDecrement"
          @click="decrementAmount"
        >
          -
        </button>
        <span class="amount-value">{{ unitAmount }}</span>
        <button
          type="button"
          class="amount-button"
          :aria-label="`Increase ${name} count`"
          :disabled="!canIncrement"
          @click="incrementAmount"
        >
          +
        </button>
      </div>
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

.amount-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--ea-surface-border);
  border-radius: var(--ea-radius-md);
  background: var(--ea-surface-0);
  overflow: hidden;
}

.amount-button {
  appearance: none;
  border: 0;
  background: var(--ea-surface-50);
  color: var(--ea-text-color);
  min-width: 2.25rem;
  min-height: 2.25rem;
  font: inherit;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease;
}

.amount-button:first-child {
  border-right: 1px solid var(--ea-surface-border);
}

.amount-button:last-child {
  border-left: 1px solid var(--ea-surface-border);
}

.amount-button:hover:not(:disabled) {
  background: #eef1f3;
  color: var(--ea-accent);
}

.amount-button:disabled {
  cursor: not-allowed;
  color: var(--ea-text-faint-color);
  opacity: 0.6;
}

.amount-value {
  min-width: 2.5rem;
  padding: 0.35rem 0.75rem;
  text-align: center;
  color: var(--ea-text-color);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.name {
  flex: 1 2 auto;
  font-size: 1.05rem;
  font-weight: 500;
}

.cost-tag {
  font-size: 0.75rem;
  flex-shrink: 0;
  color: var(--ea-text-muted-color);
  border: 1px solid var(--ea-surface-border);
  border-radius: var(--ea-radius-pill);
  padding: 0.1rem 0.5rem;
  background: var(--ea-surface-0);
}

.config-toggle {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--ea-text-muted-color);
  gap: 0.25rem;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
