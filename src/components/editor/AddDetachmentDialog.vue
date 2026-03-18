<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Add Detachment"
    :style="{ width: '95vw', maxWidth: '520px' }"
    :draggable="false"
  >
    <div v-if="detachmentOptions.length === 0" class="empty">
      No detachments defined for this army.
    </div>

    <div v-else class="det-list">
      <div
        v-for="det in detachmentOptions"
        :key="det.name"
        class="det-option"
        :class="{ selected: selectedDetachment === det.name }"
        @click="selectedDetachment = det.name"
      >
        <div class="det-header">
          <span class="det-name">{{ det.name }}</span>
          <Tag :value="det.group" severity="secondary" class="group-tag" />
        </div>
        <p class="det-units">{{ describeUnits(det) }}</p>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" severity="secondary" @click="close" />
      <Button
        label="Add"
        :disabled="!selectedDetachment"
        @click="confirm"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { ArmyDef, DetachmentDef, UnitCount } from '@/entities/army'

const visible = defineModel<boolean>('visible', { default: false })

const props = defineProps<{
  armyDef: ArmyDef
}>()

const emit = defineEmits<{
  (e: 'add', detachmentName: string): void
}>()

const selectedDetachment = ref<string | null>(null)
const detachmentOptions = props.armyDef.detachments

function describeUnits(det: DetachmentDef): string {
  return det.units
    .map((uc: UnitCount) => {
      if ('count' in uc) return `${uc.count}× ${uc.unitName}`
      return `${uc.min}–${uc.max}× ${uc.unitName}`
    })
    .join(', ')
}

function close() {
  visible.value = false
  selectedDetachment.value = null
}

function confirm() {
  if (!selectedDetachment.value) return
  emit('add', selectedDetachment.value)
  close()
}
</script>

<style scoped>
.det-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.det-option {
  border: 1px solid var(--p-surface-border);
  border-radius: .5rem;
  padding: .75rem;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}

.det-option:hover {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.det-option.selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.det-header {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: .25rem;
}

.det-name {
  font-weight: 600;
  flex: 1;
}

.group-tag {
  font-size: .7rem;
}

.det-units {
  font-size: .85rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.empty {
  color: var(--p-text-muted-color);
  text-align: center;
  padding: 1rem;
}
</style>
