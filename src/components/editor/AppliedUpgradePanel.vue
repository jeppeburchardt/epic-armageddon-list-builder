<template>
  <div class="applied-upgrade-panel">
    <div class="upgrade-header">
      <span class="upgrade-name">{{ upgrade.upgradeName }}</span>
      <Button
        icon="pi pi-times"
        severity="danger"
        text
        size="small"
        rounded
        aria-label="Remove upgrade"
        @click="emit('remove')"
      />
    </div>

    <!-- Transport warning badge -->
    <Tag
      v-if="transportWarning"
      severity="warn"
      value="⚠ Transport capacity warning"
      class="transport-tag"
    />

    <!-- Replace upgrade -->
    <div v-if="upgrade.type === 'replace' && replaceUpgrade" class="replace-section">
      <div class="replace-control">
        <InputNumber
          size="small"
          :model-value="replaceUpgrade.replacedCount"
          :min="0"
          :max="replaceMax"
          show-buttons
          button-layout="horizontal"
          :step="1"
          class="count-input"
          @update:model-value="(val: number | null) => val !== null && emit('replace-count-change', val)"
          fluid
        >
          <template #decrementbuttonicon><span class="pi pi-minus" /></template>
          <template #incrementbuttonicon><span class="pi pi-plus" /></template>
        </InputNumber>
        <span class="replace-label">{{ fromUnitName }}</span>
        <span class="replace-arrow">→ {{ replaceUpgrade.replacingUnits.unitName }}</span>
      </div>

      <!-- Per-instance weapon editors for replacing units -->
      <div
        v-if="replaceUpgrade.replacedCount > 0 && hasChoices(replaceUpgrade.replacingUnits.unitName)"
        class="instances-list"
      >
        <div
          v-for="(inst, instIdx) in replaceUpgrade.replacingUnits.instances"
          :key="instIdx"
          class="instance-row"
        >
          <span class="instance-label">{{ replaceUpgrade.replacingUnits.unitName }} {{ instIdx + 1 }}</span>
          <UnitInstanceEditor
            :weapon-slots="getWeaponSlots(replaceUpgrade.replacingUnits.unitName)"
            :instance="inst"
            @weapon-change="(slotIdx, weapon) => emit('weapon-change', upgrade.upgradeName, replaceUpgrade!.replacingUnits.unitName, instIdx, slotIdx, weapon)"
          />
        </div>
      </div>
    </div>

    <!-- Character upgrade -->
    <div v-else-if="upgrade.type === 'character' && characterUpgrade" class="character-section">
      <div class="character-picker">
        <button
          v-for="charName in characterUpgradeDef?.characterNames ?? []"
          :key="charName"
          class="char-btn"
          :class="{ 'char-btn--active': characterUpgrade.chosenCharacterName === charName }"
          type="button"
          @click="onCharacterClick(charName)"
        >
          {{ charName }}
        </button>
      </div>
    </div>

    <!-- Add upgrade -->
    <div v-else-if="upgrade.type === 'add'" class="add-section">
      <div
        v-for="ute in upgrade.addedUnits"
        :key="ute.unitName"
        class="add-unit-row"
      >
        <div class="add-unit-header">
          <InputNumber
          size="small"
          :model-value="ute.instances.length"
          :min="getAddMin(ute.unitName)"
          :max="getAddMax(ute.unitName)"
          show-buttons
          button-layout="horizontal"
          :step="1"
          class="count-input"
          @update:model-value="(val: number | null) => val !== null && emit('add-count-change', ute.unitName, val)"
          fluid
          >
            <template #decrementbuttonicon><span class="pi pi-minus" /></template>
            <template #incrementbuttonicon><span class="pi pi-plus" /></template>
          </InputNumber>
          <span class="unit-name">{{ ute.unitName }}</span>
        </div>

        <!-- Per-instance weapon editors for added units -->
        <div v-if="hasChoices(ute.unitName) && ute.instances.length > 0" class="instances-list">
          <div v-for="(inst, instIdx) in ute.instances" :key="instIdx" class="instance-row">
            <span class="instance-label">{{ ute.unitName }} {{ instIdx + 1 }}</span>
            <UnitInstanceEditor
              :weapon-slots="getWeaponSlots(ute.unitName)"
              :instance="inst"
              @weapon-change="(slotIdx, weapon) => emit('weapon-change', upgrade.upgradeName, ute.unitName, instIdx, slotIdx, weapon)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import UnitInstanceEditor from './UnitInstanceEditor.vue'
import type { ArmyDef } from '@/entities/army'
import type { AppliedUpgrade } from '@/entities/list'

const props = defineProps<{
  upgrade: AppliedUpgrade
  armyDef: ArmyDef
  transportWarning?: boolean
}>();

const emit = defineEmits<{
  (e: 'remove'): void
  (e: 'replace-count-change', count: number): void
  (e: 'add-count-change', unitName: string, count: number): void
  (e: 'weapon-change', upgradeName: string, unitName: string, instanceIndex: number, slotIndex: number, weapon: string): void
  (e: 'update-character', chosenCharacterName: string | null): void
}>()

/** Narrows the prop to the replace variant for use in templates */
const replaceUpgrade = computed(() =>
  props.upgrade.type === 'replace' ? props.upgrade : null,
)

/** Narrows the prop to the character variant for use in templates */
const characterUpgrade = computed(() =>
  props.upgrade.type === 'character' ? props.upgrade : null,
)

/** Narrows the upgradeDef to the character variant */
const characterUpgradeDef = computed(() => {
  const def = upgradeDef.value
  return def?.type === 'character' ? def : null
})

function onCharacterClick(charName: string) {
  const cu = characterUpgrade.value
  if (!cu) return
  if (cu.chosenCharacterName === charName) {
    // Deselect
    emit('update-character', null)
  } else {
    emit('update-character', charName)
  }
}

const upgradeDef = computed(() =>
  props.armyDef.upgrades.find((u) => u.name === props.upgrade.upgradeName),
)

const fromUnitName = computed(() => {
  const def = upgradeDef.value
  if (!def || def.type !== 'replace') return ''
  return def.replaces.fromUnitName
})

const replaceMax = computed(() => {
  const def = upgradeDef.value
  if (!def || def.type !== 'replace') return 0
  return def.replaces.max
})

function getAddMin(unitName: string): number {
  const def = upgradeDef.value
  if (!def || def.type !== 'add') return 0
  return def.adds.find((a) => a.unitName === unitName)?.min ?? 0
}

function getAddMax(unitName: string): number {
  const def = upgradeDef.value
  if (!def || def.type !== 'add') return 10
  return def.adds.find((a) => a.unitName === unitName)?.max ?? 10
}

function getWeaponSlots(unitName: string) {
  return props.armyDef.units.find((u) => u.name === unitName)?.weaponSlots ?? []
}

function hasChoices(unitName: string): boolean {
  return getWeaponSlots(unitName).some((s) => s.kind === 'choice')
}
</script>

<style scoped>
.applied-upgrade-panel {
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-border);
  border-radius: .5rem;
  padding: .75rem;
  display: flex;
  flex-direction: column;
  gap: .6rem;
}

.upgrade-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upgrade-name {
  font-weight: 600;
  font-size: .9rem;
}

.transport-tag {
  align-self: flex-start;
  font-size: .75rem;
}

.replace-control {
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
}

.replace-label {
  font-size: .875rem;
}

.replace-arrow {
  font-size: .875rem;
  color: var(--p-text-muted-color);
}

.count-input {
  flex-basis: 30%;
}

.add-unit-header {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-bottom: .3rem;
}

.unit-name {
  flex: 1;
  font-size: .875rem;
  font-weight: 500;
}

.instances-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  padding-left: .75rem;
  border-left: 2px solid var(--p-surface-border);
  margin-top: .3rem;
}

.instance-row {
  display: flex;
  flex-direction: column;
  gap: .2rem;
}

.instance-label {
  font-size: .75rem;
  color: var(--p-text-muted-color);
}

.add-unit-row {
  display: flex;
  flex-direction: column;
}

.character-section {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.character-picker {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}

.char-btn {
  border: 1px solid var(--p-surface-border);
  border-radius: .375rem;
  padding: .3rem .7rem;
  background: var(--p-surface-0);
  cursor: pointer;
  font-size: .875rem;
  transition: border-color .15s, background .15s, color .15s;
  color: var(--p-text-color);
}

.char-btn:hover {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.char-btn--active {
  border-color: var(--p-primary-color);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.attach-row {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.attach-label {
  font-size: .875rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.attach-select {
  flex: 1;
}
</style>
