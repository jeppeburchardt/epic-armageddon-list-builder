<script setup lang="ts">
import PointsBadge from '@/components/shared/PointsBadge.vue'
import type { ArmyList } from '@/entities/list'
import type { ArmyDef } from '@/entities/army'
import { calculateListPoints } from '@/entities/points'
import { computed } from 'vue'

const props = defineProps<{
  list: ArmyList
  armyDef: ArmyDef | undefined
}>()

defineEmits<{
  edit: [id: string]
  view: [id: string]
  delete: [id: string]
}>()

const usedPoints = computed(() => {
  if (!props.armyDef) return 0
  return calculateListPoints(props.list, props.armyDef)
})
</script>

<template>
  <article class="list-card">
    <div class="card-header">
      <span class="army-name">{{ list.armySlug.replace(/-/g, ' ') }}</span>
      <PointsBadge :used="usedPoints" :limit="list.pointsLimit" />
    </div>
    <h3 class="card-title">{{ list.name }}</h3>
    <p class="card-subtitle">{{ list.entries.length }} detachment{{ list.entries.length !== 1 ? 's' : '' }}</p>
    <div class="card-actions">
      <button type="button" class="action-button" @click="$emit('edit', list.id)">Edit</button>
      <button type="button" class="secondary-button" @click="$emit('view', list.id)">View</button>
      <button type="button" class="danger-button" aria-label="Delete list" @click="$emit('delete', list.id)">Delete</button>
    </div>
  </article>
</template>

<style scoped>
.list-card {
  border: 1px solid var(--p-surface-border);
  border-radius: 0.5rem;
  background: var(--p-surface-0);
  padding: 0.75rem 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.army-name {
  font-size: 0.75rem;
  text-transform: capitalize;
  color: var(--p-text-muted-color);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.card-title {
  margin: 0;
}

.card-subtitle {
  margin: 0.25rem 0 0.75rem;
  color: var(--p-text-muted-color);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-button,
.secondary-button,
.danger-button {
  border-radius: 0.375rem;
  padding: 0.35rem 0.65rem;
  font: inherit;
  cursor: pointer;
}

.action-button {
  border: 1px solid var(--p-primary-color);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.secondary-button {
  border: 1px solid var(--p-surface-border);
  background: var(--p-surface-0);
  color: inherit;
}

.danger-button {
  border: 1px solid #dc2626;
  background: #fff;
  color: #dc2626;
}
</style>
