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
  <p class="validation-message surface" :class="`severity-${severity}`">
    <template v-if="results.length === 0"> List is valid </template>
    <template v-else>
      {{ results[0].message }}
    </template>
    <span v-if="results.length > 1" class="issue-count">{{ results.length - 1 }} more issues</span>
  </p>
</template>

<style scoped>
.validation-message {
  padding: 0.5rem 0.75rem;
}

.severity-success {
}

.severity-warn {
  background-color: var(--ea-primary);
}

.severity-error {
  background-color: var(--ea-primary);
}

.issue-count {
  color: var(--ea--text-muted-color);
  margin-left: 0.5rem;
}
</style>
