<template>
  <Card class="detachment-card">
    <template #header>
      <div class="card-header">
        <div class="card-header-left">
          <Tag :value="detachmentDef?.group ?? ''" severity="secondary" class="group-tag" />
          <span class="det-name">{{ entry.detachmentName }}</span>
        </div>
        <div class="card-header-right">
          <PointsBadge :used="entryPoints" />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            size="small"
            aria-label="Remove detachment"
            @click="emit('remove')"
          />
        </div>
      </div>
    </template>

    <template #content>
      <!-- Transport warning -->
      <Tag
        v-if="transportWarning"
        severity="warn"
        value="⚠ Transport capacity warning"
        class="transport-tag"
      />

      <!-- Collapsed: derived composition summary -->
      <div v-if="!expanded" class="composition-summary" @click="expanded = true">
        <span
          v-for="ute in derivedUnits"
          :key="ute.unitName"
          class="composition-chip"
        >
          {{ ute.instances.length }}× {{ ute.unitName }}
        </span>
        <span class="expand-hint">Tap to edit</span>
      </div>

      <!-- Expanded: full edit UI -->
      <div v-else class="edit-body">
        <div class="section">
          <h4 class="section-title">Base Units</h4>
          <BaseUnitsPanel
            :base-units="entry.baseUnits"
            :detachment-name="entry.detachmentName"
            :army-def="armyDef"
            @count-change="(unitName, count) => emit('base-count-change', unitName, count)"
            @weapon-change="(unitName, instIdx, slotIdx, weapon) => emit('weapon-change', 'base', unitName, instIdx, slotIdx, weapon)"
          />
        </div>

        <Divider v-if="entry.appliedUpgrades.length > 0" />

        <div v-if="entry.appliedUpgrades.length > 0" class="section">
          <h4 class="section-title">Upgrades</h4>
          <div class="upgrades-list">
            <AppliedUpgradePanel
              v-for="upgrade in entry.appliedUpgrades"
              :key="upgrade.upgradeName"
              :upgrade="upgrade"
              :army-def="armyDef"
              :transport-warning="isTransportUpgrade(upgrade.upgradeName) && !!transportWarning"
              @remove="emit('remove-upgrade', upgrade.upgradeName)"
              @replace-count-change="(count) => emit('replace-count-change', upgrade.upgradeName, count)"
              @add-count-change="(unitName, count) => emit('add-count-change', upgrade.upgradeName, unitName, count)"
              @weapon-change="(_upgName, unitName, instIdx, slotIdx, weapon) => emit('weapon-change', upgrade.upgradeName, unitName, instIdx, slotIdx, weapon)"
              @update-character="(charName) => emit('update-character', upgrade.upgradeName, charName)"
            />
          </div>
        </div>

        <div class="add-upgrade-row">
          <Button
            v-if="availableUpgradesCount > 0"
            label="Add Upgrade"
            icon="pi pi-plus"
            size="small"
            severity="secondary"
            @click="showUpgradePicker = true"
          />
          <Button
            label="Collapse"
            icon="pi pi-chevron-up"
            size="small"
            text
            @click="expanded = false"
          />
        </div>
      </div>
    </template>
  </Card>

  <UpgradePickerDialog
    v-model:visible="showUpgradePicker"
    :detachment-name="entry.detachmentName"
    :army-def="armyDef"
    :applied-upgrade-names="entry.appliedUpgrades.map((u) => u.upgradeName)"
    @add="(upgDef) => emit('add-upgrade', upgDef)"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import PointsBadge from '@/components/shared/PointsBadge.vue'
import BaseUnitsPanel from './BaseUnitsPanel.vue'
import AppliedUpgradePanel from './AppliedUpgradePanel.vue'
import UpgradePickerDialog from './UpgradePickerDialog.vue'
import type { ArmyDef, UpgradeDef } from '@/entities/army'
import type { Entry } from '@/entities/list'
import { calculateEntryPoints } from '@/entities/points'
import { deriveFormationUnits } from '@/entities/composition'
import { validateTransportCapacity } from '@/entities/validation'

const props = defineProps<{
  entry: Entry
  armyDef: ArmyDef
}>()

const emit = defineEmits<{
  (e: 'remove'): void
  (e: 'base-count-change', unitName: string, count: number): void
  (e: 'weapon-change', source: string, unitName: string, instanceIndex: number, slotIndex: number, weapon: string): void
  (e: 'add-upgrade', upgradeDef: UpgradeDef): void
  (e: 'remove-upgrade', upgradeName: string): void
  (e: 'replace-count-change', upgradeName: string, count: number): void
  (e: 'add-count-change', upgradeName: string, unitName: string, count: number): void
  (e: 'update-character', upgradeName: string, chosenCharacterName: string | null): void
}>()

const expanded = ref(false)
const showUpgradePicker = ref(false)

const detachmentDef = computed(() =>
  props.armyDef.detachments.find((d) => d.name === props.entry.detachmentName),
)

const entryPoints = computed(() => calculateEntryPoints(props.entry, props.armyDef))

const derivedUnits = computed(() => deriveFormationUnits(props.entry, props.armyDef))

const transportWarning = computed(() => {
  const result = validateTransportCapacity(props.entry, props.armyDef)
  return result?.message ?? null
})

const availableUpgradesCount = computed(() => {
  if (!detachmentDef.value) return 0
  const applied = new Set(props.entry.appliedUpgrades.map((u) => u.upgradeName))
  return detachmentDef.value.availableUpgrades.filter((n) => !applied.has(n)).length
})

function isTransportUpgrade(upgradeName: string): boolean {
  const def = props.armyDef.upgrades.find((u) => u.name === upgradeName)
  return def?.type === 'add' && (def.transportWarning ?? false)
}

</script>

<style scoped>
.detachment-card {
  margin-bottom: .75rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .5rem .75rem;
  gap: .5rem;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: .5rem;
  flex: 1;
  min-width: 0;
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: .25rem;
}

.det-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-tag {
  font-size: .7rem;
  flex-shrink: 0;
}

.transport-tag {
  font-size: .75rem;
  margin-bottom: .5rem;
}

.composition-summary {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
  cursor: pointer;
  align-items: center;
}

.composition-chip {
  background: var(--p-surface-100);
  border-radius: 1rem;
  padding: .15rem .6rem;
  font-size: .8rem;
}

.expand-hint {
  font-size: .75rem;
  color: var(--p-text-muted-color);
  margin-left: auto;
}

.edit-body {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

.section-title {
  margin: 0 0 .5rem;
  font-size: .85rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: .06em;
}

.section {
  display: flex;
  flex-direction: column;
}

.upgrades-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.add-upgrade-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .5rem;
  margin-top: .25rem;
}
</style>
