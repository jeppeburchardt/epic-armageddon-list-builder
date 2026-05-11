<script setup lang="ts">
import Message from 'primevue/message'
import type { ValidationResult } from '@/entities/validation'
import { computed } from 'vue'

const props = defineProps<{
  results: ValidationResult[]
}>()

const severity = computed(() => {
  if (props.results.length === 0) {
    return 'success'
  }
  if (props.results[0].type === 'error') {
    return 'error'
  }
  return 'warn'
})
</script>

<template>
  <div class="validation-warnings">
    <Message :severity class="validation-message">
      <template v-if="results.length === 0"> List is valid </template>
      <template v-else>
        {{ results[0].message }}
      </template>
      <span v-if="results.length > 1" class="issue-count">
        {{ results.length - 1 }} more issues
      </span>
    </Message>
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
}

.issue-count {
  color: var(--p-text-muted-color);
  margin-left: 0.5rem;
}
</style>
