<script setup lang="ts">
import { computed, ref } from 'vue'
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

function getUniqueGroups(detachments: DetachmentDef[]): string[] {
  const seen = new Set<string>()
  const groups: string[] = []
  for (const det of detachments) {
    if (!seen.has(det.group)) {
      seen.add(det.group)
      groups.push(det.group)
    }
  }
  return groups
}

const uniqueGroups = computed(() => getUniqueGroups(props.armyDef.detachments))
const activeGroup = ref(getUniqueGroups(props.armyDef.detachments)[0] ?? '')

const filteredDetachments = computed(() => {
  if (!activeGroup.value) return detachmentOptions
  return detachmentOptions.filter((det) => det.group === activeGroup.value)
})

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

<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-backdrop" @click.self="close">
      <div class="dialog" role="dialog" aria-modal="true" aria-label="Add Detachment">
        <h2 class="dialog-title">Add Detachment</h2>

        <div v-if="detachmentOptions.length === 0" class="empty">
          No detachments defined for this army.
        </div>

        <div v-else>
          <div class="group-tabs">
            <button
              v-for="group in uniqueGroups"
              :key="group"
              type="button"
              class="group-tab"
              :class="{ active: activeGroup === group }"
              @click="activeGroup = group"
            >
              {{ group }}
            </button>
          </div>

          <div class="det-list">
            <button
              v-for="det in filteredDetachments"
              :key="det.name"
              type="button"
              class="det-option"
              :class="{ selected: selectedDetachment === det.name }"
              @click="selectedDetachment = det.name"
            >
              <div class="det-header">
                <span class="det-name">{{ det.name }}</span>
                <span class="group-tag">{{ det.group }}</span>
              </div>
              <p class="det-units">{{ describeUnits(det) }}</p>
            </button>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="secondary-button" @click="close">Cancel</button>
          <button
            type="button"
            class="primary-button"
            :disabled="!selectedDetachment"
            @click="confirm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 45%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
  padding: 1rem;
}

.dialog {
  width: min(95vw, 520px);
  background: var(--ea-surface-0);
  border-radius: 0.5rem;
  border: 1px solid var(--ea-surface-border);
  padding: 1rem;
}

.dialog-title {
  margin: 0 0 0.75rem;
}

.group-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.group-tab {
  border: 1px solid var(--ea-surface-border);
  border-radius: 999px;
  background: var(--ea-surface-0);
  padding: 0.25rem 0.6rem;
  cursor: pointer;
}

.group-tab.active {
  border-color: var(--ea-primary-color);
  color: var(--ea-primary-color);
}

.det-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.det-option {
  width: 100%;
  text-align: left;
  border: 1px solid var(--ea-surface-border);
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  background: var(--ea-surface-0);
}

.det-option:hover,
.det-option.selected {
  border-color: var(--ea-primary-color);
  background: var(--ea-primary-50);
}

.det-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.det-name {
  font-weight: 600;
  flex: 1;
}

.group-tag {
  font-size: 0.7rem;
  border: 1px solid var(--ea-surface-border);
  border-radius: 999px;
  padding: 0.05rem 0.35rem;
}

.det-units {
  font-size: 0.85rem;
  color: var(--ea-text-muted-color);
  margin: 0;
}

.empty {
  color: var(--ea-text-muted-color);
  text-align: center;
  padding: 1rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.primary-button,
.secondary-button {
  border-radius: 0.375rem;
  padding: 0.45rem 0.75rem;
  font: inherit;
  cursor: pointer;
}

.primary-button {
  border: 1px solid var(--ea-primary-color);
  background: var(--ea-primary-color);
  color: var(--ea-primary-contrast-color);
}

.primary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.secondary-button {
  border: 1px solid var(--ea-surface-border);
  background: var(--ea-surface-0);
  color: inherit;
}
</style>
