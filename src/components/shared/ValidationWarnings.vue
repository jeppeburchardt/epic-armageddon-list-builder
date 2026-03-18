<template>
  <div v-if="results.length > 0" class="validation-warnings">
    <Message
      v-for="(result, i) in results"
      :key="i"
      :severity="result.type === 'error' ? 'error' : 'warn'"
      class="validation-message"
    >
      {{ result.message }}
    </Message>
  </div>
</template>

<script setup lang="ts">
import Message from 'primevue/message'
import type { ValidationResult } from '@/entities/validation'

defineProps<{
  results: ValidationResult[]
}>()
</script>

<style scoped>
.validation-warnings {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  margin-bottom: 1rem;
}

.validation-message {
  margin: 0;
}
</style>
