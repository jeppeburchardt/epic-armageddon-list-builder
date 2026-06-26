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
  border: 1px solid var(--ea-surface-border);
  border-radius: var(--ea-radius-pill);
  padding: 0.05rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--ea-text-muted-color);
  background: var(--ea-surface-0);
}

.points-badge--warn {
  color: var(--ea-attention-fg);
  border-color: var(--ea-attention-border);
  background: var(--ea-attention-subtle);
}
</style>
