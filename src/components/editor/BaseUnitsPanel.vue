<script setup lang="ts">
import { reactive } from 'vue'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import UnitInstanceEditor from './UnitInstanceEditor.vue'
import type { ArmyDef } from '@/entities/army'
import type { UnitTypeEntry, UnitInstance } from '@/entities/list'

const props = defineProps<{
  baseUnits: UnitTypeEntry[]
  detachmentName: string
  armyDef: ArmyDef
}>()

const emit = defineEmits<{
  (e: 'count-change', unitName: string, count: number): void
  (
    e: 'weapon-change',
    unitName: string,
    instanceIndex: number,
    slotIndex: number,
    weapon: string,
  ): void
}>()

function getDetachmentUnit(unitName: string) {
  const det = props.armyDef.detachments.find((d) => d.name === props.detachmentName)
  return det?.units.find((u) => u.unitName === unitName)
}

function isVariable(unitName: string): boolean {
  const uc = getDetachmentUnit(unitName)
  return !!uc && 'min' in uc
}

function getMin(unitName: string): number {
  const uc = getDetachmentUnit(unitName)
  return uc && 'min' in uc ? uc.min : 0
}

function getMax(unitName: string): number {
  const uc = getDetachmentUnit(unitName)
  return uc && 'max' in uc ? uc.max : 99
}

function getUnitDef(unitName: string) {
  return props.armyDef.units.find((u) => u.name === unitName)
}

function hasChoices(unitName: string): boolean {
  return getUnitDef(unitName)?.weaponSlots.some((s) => s.kind === 'choice') ?? false
}

// ─── Same-config toggle ───────────────────────────────────────────────────────

const sameConfig = reactive<Record<string, boolean>>({})

function getSameConfig(unitName: string): boolean {
  if (!(unitName in sameConfig)) sameConfig[unitName] = true
  return sameConfig[unitName]
}

function setSameConfig(unitName: string, value: boolean, instances: UnitInstance[]): void {
  sameConfig[unitName] = value
  if (value && instances.length > 1) {
    const first = instances[0]
    for (let i = 1; i < instances.length; i++) {
      for (const sel of first.weaponSelections) {
        emit('weapon-change', unitName, i, sel.slotIndex, sel.chosenWeaponName)
      }
    }
  }
}
</script>

<template>
  <div class="base-units-panel">
    <div v-for="ute in baseUnits" :key="ute.unitName" class="unit-type-row">
      <div class="unit-header">
        <InputNumber
          v-if="isVariable(ute.unitName)"
          :model-value="ute.instances.length"
          :min="getMin(ute.unitName)"
          :max="getMax(ute.unitName)"
          show-buttons
          button-layout="horizontal"
          :step="1"
          @update:model-value="
            (val: number | null) => val !== null && emit('count-change', ute.unitName, val)
          "
        >
          <template #decrementbuttonicon><span class="pi pi-minus" /></template>
          <template #incrementbuttonicon><span class="pi pi-plus" /></template>
        </InputNumber>
        <span v-else>
          {{ ute.instances.length }}
        </span>
        <span class="unit-name">{{ ute.unitName }}</span>
        <div v-if="ute.instances.length > 1 && hasChoices(ute.unitName)" class="sync-toggle">
          <ToggleSwitch
            :model-value="getSameConfig(ute.unitName)"
            @update:model-value="(val: boolean) => setSameConfig(ute.unitName, val, ute.instances)"
          />
          <label>use same configuration for all {{ ute.unitName }} units</label>
        </div>
      </div>

      <!-- Per-instance weapon editors (only for units with choice slots) -->
      <div v-if="hasChoices(ute.unitName)" class="instances-list">
        <template v-if="getSameConfig(ute.unitName) && ute.instances.length > 0">
          <UnitInstanceEditor
            :weapon-slots="getUnitDef(ute.unitName)?.weaponSlots ?? []"
            :instance="ute.instances[0]"
            @weapon-change="
              (slotIdx, weapon) => {
                for (let i = 0; i < ute.instances.length; i++) {
                  emit('weapon-change', ute.unitName, i, slotIdx, weapon)
                }
              }
            "
          />
        </template>
        <template v-else>
          <div v-for="(inst, instIdx) in ute.instances" :key="instIdx" class="instance-item">
            <span class="instance-label">Unit {{ instIdx + 1 }}</span>
            <UnitInstanceEditor
              :weapon-slots="getUnitDef(ute.unitName)?.weaponSlots ?? []"
              :instance="inst"
              @weapon-change="
                (slotIdx, weapon) => emit('weapon-change', ute.unitName, instIdx, slotIdx, weapon)
              "
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-units-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sync-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.4rem;
}

.unit-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.unit-name {
  font-weight: 500;
  flex: 1;
}

.unit-fixed-count {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  min-width: 2rem;
  text-align: right;
}

.count-input {
  width: 7rem;
}

.instances-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;

  padding-top: 1rem;
  border-left: 2px solid var(--p-surface-border);
}

.instance-item {
  flex-basis: 32%;
  flex-shrink: 1;

  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.instance-label {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}
</style>
