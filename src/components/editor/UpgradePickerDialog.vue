<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Add Upgrade"
    :style="{ width: '95vw', maxWidth: '480px' }"
    :draggable="false"
  >
    <div v-if="availableUpgrades.length === 0" class="empty">
      No upgrades available for this detachment.
    </div>

    <div v-else class="upgrade-list">
      <div
        v-for="upgDef in availableUpgrades"
        :key="upgDef.name"
        class="upgrade-option"
        :class="{ selected: selectedUpgrade?.name === upgDef.name }"
        @click="selectUpgrade(upgDef)"
      >
        <div class="option-header">
          <span class="option-name">{{ upgDef.name }}</span>
          <span class="option-type">{{ upgDef.type }}</span>
        </div>
        <p class="option-description">{{ describeUpgrade(upgDef) }}</p>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" severity="secondary" @click="close" />
      <Button
        label="Add"
        :disabled="!selectedUpgrade"
        @click="confirm"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
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
  return upgDef.adds
    .map((a) => `Add ${a.min}–${a.max} ${a.unitName}`)
    .join(', ')
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

<style scoped>
.upgrade-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.upgrade-option {
  border: 1px solid var(--p-surface-border);
  border-radius: .5rem;
  padding: .75rem;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}

.upgrade-option:hover {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.upgrade-option.selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.option-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: .25rem;
}

.option-name {
  font-weight: 600;
}

.option-type {
  font-size: .75rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
}

.option-description {
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
