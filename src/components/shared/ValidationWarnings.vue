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
  <div class="validation-warnings">
    <p class="validation-message" :class="`severity-${severity}`">
      <template v-if="results.length === 0"> List is valid </template>
      <template v-else>
        {{ results[0].message }}
      </template>
      <span v-if="results.length > 1" class="issue-count">{{ results.length - 1 }} more issues</span>
    </p>
  </div>
</template>

<style scoped>
.validation-warnings {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.validation-message {
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid transparent;
}

.severity-success {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.severity-warn {
  background: #fff7ed;
  color: #9a3412;
  border-color: #fed7aa;
}

.severity-error {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.issue-count {
  color: var(--p-text-muted-color);
  margin-left: 0.5rem;
}
</style>
