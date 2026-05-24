<script setup lang="ts">
import { ref, computed } from 'vue'
import PointsBadge from '@/components/shared/PointsBadge.vue'
import BaseUnitsPanel from './BaseUnitsPanel.vue'
import AppliedUpgradePanel from './AppliedUpgradePanel.vue'
import UpgradePickerDialog from './UpgradePickerDialog.vue'
import type { ArmyDef, UpgradeDef } from '@/entities/army'
import type { Entry } from '@/entities/list'
import { calculateEntryPoints } from '@/entities/points'
import { deriveBaseUnits, deriveFormationUnits, deriveUpgradeUnits } from '@/entities/composition'
import { validateTransportCapacity } from '@/entities/validation'
import { toRomanNumeral } from '@/entities/romanNumerals'
import { useMediaQuery } from '@vueuse/core'

const props = defineProps<{
  entry: Entry
  armyDef: ArmyDef
  isFirst: boolean
  isLast: boolean
  detachmentNumber: number
}>()

const emit = defineEmits<{
  remove: []
  'move-up': []
  'move-down': []
  'base-count-change': [unitName: string, count: number]
  'weapon-change': [
    source: string,
    unitName: string,
    instanceIndex: number,
    slotIndex: number,
    weapon: string,
  ]
  'add-upgrade': [upgradeDef: UpgradeDef]
  'remove-upgrade': [upgradeName: string]
  'replace-count-change': [upgradeName: string, count: number]
  'add-count-change': [upgradeName: string, unitName: string, count: number]
  'update-character': [upgradeName: string, chosenCharacterName: string | null]
}>()

const isSmallScreen = useMediaQuery('(max-width: 600px)')

const showUpgradePicker = ref(false)
const activePanel = ref<string | undefined>(undefined)

function handleAddUpgrade(upgDef: UpgradeDef) {
  activePanel.value = upgDef.name
  emit('add-upgrade', upgDef)
}

const detachmentDef = computed(() =>
  props.armyDef.detachments.find((d) => d.name === props.entry.detachmentName),
)

const entryPoints = computed(() => calculateEntryPoints(props.entry, props.armyDef))
const transportResult = computed(() => validateTransportCapacity(props.entry, props.armyDef))
const transportWarning = computed(() => transportResult.value?.message ?? null)

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

<template>
  <article class="detachment-card" :class="{ 'warning-card': transportWarning }">
    <div class="entry">
      <div class="info">
        <div class="primary">
          <h3 class="name">
            <span class="detachment-number-badge">{{ toRomanNumeral(detachmentNumber) }}</span>
            <span>{{ entry.detachmentName }}</span>
          </h3>
          <PointsBadge :used="entryPoints" />
        </div>
        <div class="buttons">
          <button
            v-if="availableUpgradesCount > 0"
            type="button"
            class="primary-button"
            @click="showUpgradePicker = true"
          >
            {{ isSmallScreen ? 'Add' : 'Add Upgrade' }}
          </button>
          <button type="button" class="secondary-button" :disabled="isFirst" @click="emit('move-up')">Move up</button>
          <button type="button" class="secondary-button" :disabled="isLast" @click="emit('move-down')">Move down</button>
          <button type="button" class="danger-button" @click="emit('remove')">
            {{ isSmallScreen ? 'Remove' : 'Remove detachment' }}
          </button>
        </div>
        <div class="instances">
          <div v-for="unit in deriveFormationUnits(entry, armyDef)" :key="unit.unitName" class="instance">
            <span>{{ unit.instances.length }} {{ unit.unitName }}</span>
          </div>
        </div>
      </div>

      <div class="upgrades">
        <details open>
          <summary class="details-summary">
            Base units
            <span class="tag-list">
              <span v-for="unit in deriveBaseUnits(entry)" :key="unit.unitName" class="tag-chip">{{ unit.instances.length }}x{{ unit.unitName }}</span>
            </span>
          </summary>
          <BaseUnitsPanel
            :base-units="entry.baseUnits"
            :detachment-name="entry.detachmentName"
            :army-def="armyDef"
            @count-change="(unitName, count) => emit('base-count-change', unitName, count)"
            @weapon-change="(unitName, instIdx, slotIdx, weapon) => emit('weapon-change', 'base', unitName, instIdx, slotIdx, weapon)"
          />
        </details>

        <details
          v-for="upgrade in entry.appliedUpgrades"
          :key="upgrade.upgradeName"
          :open="activePanel === upgrade.upgradeName"
        >
          <summary class="details-summary">
            <span class="tag-list">
              <span :class="{ warning: isTransportUpgrade(upgrade.upgradeName) && !!transportWarning }">{{ upgrade.upgradeName }}</span>
              <span v-for="unit in deriveUpgradeUnits(upgrade)" :key="unit.unitName" class="tag-chip">{{ unit.instances.length }}x{{ unit.unitName }}</span>
            </span>
            <button
              type="button"
              class="remove-upgrade-button"
              @click.prevent="emit('remove-upgrade', upgrade.upgradeName)"
            >
              Remove
            </button>
          </summary>
          <AppliedUpgradePanel
            :upgrade="upgrade"
            :army-def="armyDef"
            @remove="emit('remove-upgrade', upgrade.upgradeName)"
            @replace-count-change="(count) => emit('replace-count-change', upgrade.upgradeName, count)"
            @add-count-change="(unitName, count) => emit('add-count-change', upgrade.upgradeName, unitName, count)"
            @weapon-change="(_upgName, unitName, instIdx, slotIdx, weapon) => emit('weapon-change', upgrade.upgradeName, unitName, instIdx, slotIdx, weapon)"
            @update-character="(charName) => emit('update-character', upgrade.upgradeName, charName)"
          />
        </details>

        <p v-if="transportResult" class="transport-warning" :class="transportResult.type">
          {{ transportResult.message }}
        </p>
      </div>
    </div>
  </article>

  <UpgradePickerDialog
    v-model:visible="showUpgradePicker"
    :detachment-name="entry.detachmentName"
    :army-def="armyDef"
    :applied-upgrade-names="entry.appliedUpgrades.map((u) => u.upgradeName)"
    @add="handleAddUpgrade"
  />
</template>

<style scoped>
.detachment-card {
  border: 1px solid var(--p-surface-border);
  border-radius: 0.5rem;
  background: var(--p-surface-0);
  padding: 0.9rem;
}

.entry {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
}

.warning {
  color: var(--p-message-warn-color);
}

.warning-card {
  outline: 1px solid var(--p-message-warn-outlined-color);
}

.info {
  width: 220px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 0.5rem;
}

.buttons {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

.instances {
  flex: 1 2 auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 600px) {
  .entry {
    flex-direction: column;
  }

  .info {
    width: auto;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .primary {
    flex: 1 2 auto;
  }

  .buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .instances {
    width: 100%;
    flex-direction: row;
  }
}

.name {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detachment-number-badge {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  background: #000;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Times New Roman', Times, serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  flex-shrink: 0;
}

.upgrades {
  flex: 1 2 auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.details-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.tag-list {
  gap: 0.5rem;
  display: flex;
  align-items: center;
  flex: 1 2 auto;
  flex-wrap: wrap;
}

.tag-chip {
  border: 1px solid var(--p-surface-border);
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
  font-size: 0.75rem;
  background: var(--p-surface-100);
}

.primary-button,
.secondary-button,
.danger-button,
.remove-upgrade-button {
  border-radius: 0.375rem;
  padding: 0.35rem 0.65rem;
  font: inherit;
  cursor: pointer;
}

.primary-button {
  border: 1px solid var(--p-primary-color);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.secondary-button {
  border: 1px solid var(--p-surface-border);
  background: var(--p-surface-0);
  color: inherit;
}

.danger-button,
.remove-upgrade-button {
  border: 1px solid #dc2626;
  background: #fff;
  color: #dc2626;
}

.secondary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.transport-warning {
  margin-top: 0.75rem;
  padding: 0.4rem 0.6rem;
  border-radius: 0.375rem;
}

.transport-warning.warn {
  background: #fff7ed;
  color: #9a3412;
}

.transport-warning.error {
  background: #fef2f2;
  color: #991b1b;
}
</style>
