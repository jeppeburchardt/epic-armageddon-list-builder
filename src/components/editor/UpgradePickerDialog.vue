<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ArmyDef, UpgradeDef } from '@/entities/army'

const visible = defineModel<boolean>('visible', { default: false })

const props = defineProps<{
  detachmentName: string
  armyDef: ArmyDef
  appliedUpgradeNames: string[]
}>()

const emit = defineEmits<{
  (e: 'add', upgradeDef: UpgradeDef): void
}>()

const selectedUpgrade = ref<UpgradeDef | null>(null)

const detachmentDef = computed(() =>
  props.armyDef.detachments.find((d) => d.name === props.detachmentName),
)

const availableUpgrades = computed<UpgradeDef[]>(() => {
  if (!detachmentDef.value) return []
  return detachmentDef.value.availableUpgrades
    .filter((name) => !props.appliedUpgradeNames.includes(name))
    .map((name) => props.armyDef.upgrades.find((u) => u.name === name))
    .filter(Boolean) as UpgradeDef[]
})

function selectUpgrade(upgDef: UpgradeDef) {
  selectedUpgrade.value = upgDef
}

function describeUpgrade(upgDef: UpgradeDef): string {
  if (upgDef.type === 'replace') {
    return `Replace up to ${upgDef.replaces.max} ${upgDef.replaces.fromUnitName} with ${upgDef.replaces.toUnitName}`
  }
  if (upgDef.type === 'character') {
    return `Choose one of: ${upgDef.characterNames.join(', ')}`
  }
  const names = upgDef.adds.map((a) => a.unitName).join(', ')
  if (upgDef.maxTotal !== undefined) {
    return `Add up to ${upgDef.maxTotal} from: ${names}`
  }
  return `Add any of: ${names}`
}

function close() {
  visible.value = false
  selectedUpgrade.value = null
}

function confirm() {
  if (!selectedUpgrade.value) return
  emit('add', selectedUpgrade.value)
  close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-backdrop" @click.self="close">
      <div class="dialog" role="dialog" aria-modal="true" aria-label="Add Upgrade">
        <h2 class="dialog-title">Add Upgrade</h2>

        <div v-if="availableUpgrades.length === 0" class="empty">
          No upgrades available for this detachment.
        </div>

        <div v-else class="upgrade-list">
          <button
            v-for="upgDef in availableUpgrades"
            :key="upgDef.name"
            type="button"
            class="upgrade-option"
            :class="{ selected: selectedUpgrade?.name === upgDef.name }"
            @click="selectUpgrade(upgDef)"
          >
            <div class="option-header">
              <span class="option-name">{{ upgDef.name }}</span>
              <span class="option-type">{{ upgDef.type }}</span>
            </div>
            <p class="option-description">{{ describeUpgrade(upgDef) }}</p>
          </button>
        </div>

        <div class="actions">
          <button type="button" class="secondary-button" @click="close">Cancel</button>
          <button
            type="button"
            class="primary-button"
            :disabled="!selectedUpgrade"
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
  width: min(95vw, 480px);
  background: var(--ea-surface-0);
  border-radius: 0.5rem;
  border: 1px solid var(--ea-surface-border);
  padding: 1rem;
}

.dialog-title {
  margin: 0 0 0.75rem;
}

.upgrade-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upgrade-option {
  width: 100%;
  text-align: left;
  border: 1px solid var(--ea-surface-border);
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  background: var(--ea-surface-0);
}

.upgrade-option:hover,
.upgrade-option.selected {
  border-color: var(--ea-primary-color);
  background: var(--ea-primary-50);
}

.option-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.option-name {
  font-weight: 600;
}

.option-type {
  font-size: 0.75rem;
  color: var(--ea-text-muted-color);
  text-transform: uppercase;
}

.option-description {
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
