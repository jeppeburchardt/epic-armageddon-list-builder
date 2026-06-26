<script setup lang="ts">
import type { ValidationResult } from '@/entities/validation'
import { computed } from 'vue'

const props = defineProps<{
  results: ValidationResult[]
}>()

const severity = computed(() => {
  if (props.results.length === 0) return 'success'
  if (props.results[0].type === 'error') return 'error'
  return 'warn'
})
</script>

<template>
  <div class="validation-message" :class="`severity-${severity}`">
    <span class="dot" aria-hidden="true"></span>
    <template v-if="results.length === 0">List is valid</template>
    <template v-else>{{ results[0].message }}</template>
    <span v-if="results.length > 1" class="issue-count">{{ results.length - 1 }} more issue{{ results.length - 1 !== 1 ? 's' : '' }}</span>
  </div>
</template>

<style scoped>
.validation-message {
  padding: 0.5rem 0.85rem;
  border-radius: var(--ea-radius-md);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  border: 1px solid var(--ea-surface-border);
  background: var(--ea-surface-0);
  color: var(--ea-text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.severity-success {
  border-color: rgb(74 194 107 / 40%);
  background: var(--ea-success-subtle);
}

.severity-success .dot {
  background: var(--ea-success-emphasis);
}

.severity-warn {
  border-color: var(--ea-attention-border);
  background: var(--ea-attention-subtle);
}

.severity-warn .dot {
  background: var(--ea-attention-fg);
}

.severity-error {
  border-color: rgb(255 129 130 / 60%);
  background: var(--ea-danger-subtle);
}

.severity-error .dot {
  background: var(--ea-danger-emphasis);
}

.issue-count {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--ea-text-muted-color);
}
</style>
