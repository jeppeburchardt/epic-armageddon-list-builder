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
  padding: 0.5rem 0.75rem;
  border-radius: var(--ea-radius-sm);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  background: var(--ea--surface-2);
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

.severity-success .dot {
  background: var(--ea-tertiary);
}

.severity-warn,
.severity-error {
  background: var(--ea-primary);
  color: var(--ea-primary-contrast-color);
}

.severity-warn .dot,
.severity-error .dot {
  background: var(--ea-primary-contrast-color);
}

.issue-count {
  margin-left: auto;
  font-size: 0.75rem;
  opacity: 0.8;
}
</style>
