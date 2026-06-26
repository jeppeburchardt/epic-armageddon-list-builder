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
    <p class="card-subtitle">
      {{ list.entries.length }} detachment{{ list.entries.length !== 1 ? 's' : '' }}
    </p>
    <div class="card-actions">
      <button type="button" class="action-button" @click="$emit('edit', list.id)">Edit</button>
      <button type="button" class="secondary-button" @click="$emit('view', list.id)">View</button>
      <button
        type="button"
        class="danger-button"
        aria-label="Delete list"
        @click="$emit('delete', list.id)"
      >
        Delete
      </button>
    </div>
  </article>
</template>

<style scoped>
.list-card {
  border: 1px solid var(--ea-surface-border);
  border-radius: var(--ea-radius-md);
  background: var(--ea-surface-0);
  padding: 0.85rem 1rem;
  box-shadow: var(--ea-shadow-card);
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
  color: var(--ea-text-muted-color);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.card-title {
  margin: 0;
}

.card-subtitle {
  margin: 0.25rem 0 0.75rem;
  color: var(--ea-text-muted-color);
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
  border: 1px solid rgb(31 35 40 / 15%);
  background: var(--ea-primary-color);
  color: var(--ea-primary-contrast-color);
}

.action-button:hover {
  background: var(--ea-primary-hover);
}

.secondary-button {
  border: 1px solid var(--ea-surface-border);
  background: var(--ea-surface-50);
  color: var(--ea-text-color);
}

.secondary-button:hover {
  background: #eef1f3;
  border-color: rgb(31 35 40 / 15%);
}

.danger-button {
  border: 1px solid var(--ea-surface-border);
  background: var(--ea-surface-50);
  color: var(--ea-danger-fg);
}

.danger-button:hover {
  background: var(--ea-danger-emphasis);
  border-color: var(--ea-danger-emphasis);
  color: #ffffff;
}
</style>
