<script setup lang="ts">
defineProps<{
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

function parseAndEmitAmount(value: string) {
  const parsed = Number(value)
  if (Number.isFinite(parsed)) {
    emit('update:unit-amount', parsed)
  }
}
</script>

<template>
  <div class="unit">
    <div class="header">
      <input
        class="amount"
        type="number"
        :value="unitAmount"
        :min="min"
        :max="max"
        step="1"
        @input="parseAndEmitAmount(($event.target as HTMLInputElement).value)"
      />
      <div class="name">{{ name }}</div>
      <span v-if="cost !== undefined" class="cost-tag">
        {{ costSign && cost > 0 ? '+' : '' }}{{ cost }}pts
      </span>
      <label v-if="hasSameConfigOption" class="config-toggle">
        use same weapon options
        <input v-model="sameConfig" type="checkbox" />
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

.cost-tag {
  font-size: 0.75rem;
  flex-shrink: 0;
  border: 1px solid var(--p-surface-border);
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  background: var(--p-surface-100);
}

.config-toggle {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  gap: 0.25rem;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
</style>
