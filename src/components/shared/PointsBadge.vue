<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  used: number
  limit?: number
}>()

const isOverBudget = computed(() => props.limit !== undefined && props.used > props.limit)
</script>

<template>
  <span class="points-badge" :class="{ 'points-badge--warn': isOverBudget }">
    {{ used }}{{ limit !== undefined ? ` / ${limit}` : '' }} pts
  </span>
</template>

<style scoped>
.points-badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--p-surface-border);
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
  background: var(--p-surface-100);
}

.points-badge--warn {
  color: #9a3412;
  border-color: #fdba74;
  background: #ffedd5;
}
</style>
