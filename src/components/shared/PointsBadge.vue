<template>
  <span
    class="points-badge"
    :class="{
      'over-budget': isOverBudget,
      'at-limit': isAtLimit,
    }"
  >
    {{ used }}{{ limit !== undefined ? ` / ${limit}` : '' }} pts
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  used: number
  limit?: number
}>()

const isOverBudget = computed(
  () => props.limit !== undefined && props.used > props.limit,
)
const isAtLimit = computed(
  () => props.limit !== undefined && props.used === props.limit,
)
</script>

<style scoped>
.points-badge {
  display: inline-block;
  padding: .15rem .5rem;
  border-radius: 1rem;
  font-size: .85rem;
  font-weight: 600;
  background: var(--p-surface-100);
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.over-budget {
  background: var(--p-red-100);
  color: var(--p-red-700);
}

.at-limit {
  background: var(--p-green-100);
  color: var(--p-green-700);
}
</style>
