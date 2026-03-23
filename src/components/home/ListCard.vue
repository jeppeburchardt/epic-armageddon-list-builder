<template>
  <Card class="list-card">
    <template #header>
      <div class="card-header">
        <span class="army-name">{{ list.armySlug.replace(/-/g, ' ') }}</span>
        <PointsBadge :used="usedPoints" :limit="list.pointsLimit" />
      </div>
    </template>
    <template #title>{{ list.name }}</template>
    <template #subtitle>
      {{ list.entries.length }} detachment{{ list.entries.length !== 1 ? 's' : '' }}
    </template>
    <template #footer>
      <div class="card-actions">
        <Button
          label="Edit"
          icon="pi pi-pencil"
          size="small"
          @click="$emit('edit', list.id)"
        />
        <Button
          label="View"
          icon="pi pi-print"
          size="small"
          severity="secondary"
          @click="$emit('view', list.id)"
        />
        <Button
          icon="pi pi-trash"
          size="small"
          severity="danger"
          outlined
          aria-label="Delete list"
          @click="$emit('delete', list.id)"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
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
  'edit': [id: string]
  'view': [id: string]
  'delete': [id: string]
}>()

const usedPoints = computed(() => {
  if (!props.armyDef) return 0
  return calculateListPoints(props.list, props.armyDef)
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .75rem 1rem .25rem;
}

.army-name {
  font-size: .75rem;
  text-transform: capitalize;
  color: var(--p-text-muted-color);
  font-weight: 500;
  letter-spacing: .04em;
}

.card-actions {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
}
</style>
