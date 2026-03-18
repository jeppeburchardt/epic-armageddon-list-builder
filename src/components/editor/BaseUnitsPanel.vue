<template>
  <div class="base-units-panel">
    <div v-for="ute in baseUnits" :key="ute.unitName" class="unit-type-row">
      <div class="unit-type-header">
        <span class="unit-name">{{ ute.unitName }}</span>
        <div class="unit-count-control" v-if="isVariable(ute.unitName)">
          <InputNumber
            :model-value="ute.instances.length"
            :min="getMin(ute.unitName)"
            :max="getMax(ute.unitName)"
            show-buttons
            button-layout="horizontal"
            :step="1"
            class="count-input"
            @update:model-value="(val: number | null) => val !== null && emit('count-change', ute.unitName, val)"
          >
            <template #decrementbuttonicon>
              <span class="pi pi-minus" />
            </template>
            <template #incrementbuttonicon>
              <span class="pi pi-plus" />
            </template>
          </InputNumber>
        </div>
        <span v-else class="unit-fixed-count">{{ ute.instances.length }}×</span>
      </div>

      <!-- Per-instance weapon editors (only for units with choice slots) -->
      <div
        v-if="hasChoices(ute.unitName)"
        class="instances-list"
      >
        <div
          v-for="(inst, instIdx) in ute.instances"
          :key="instIdx"
          class="instance-row"
        >
          <span class="instance-label">Unit {{ instIdx + 1 }}</span>
          <UnitInstanceEditor
            :weapon-slots="getUnitDef(ute.unitName)?.weaponSlots ?? []"
            :instance="inst"
            @weapon-change="(slotIdx, weapon) => emit('weapon-change', ute.unitName, instIdx, slotIdx, weapon)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputNumber from 'primevue/inputnumber'
import UnitInstanceEditor from './UnitInstanceEditor.vue'
import type { ArmyDef } from '@/entities/army'
import type { UnitTypeEntry } from '@/entities/list'

const props = defineProps<{
  baseUnits: UnitTypeEntry[]
  detachmentName: string
  armyDef: ArmyDef
}>()

const emit = defineEmits<{
  (e: 'count-change', unitName: string, count: number): void
  (e: 'weapon-change', unitName: string, instanceIndex: number, slotIndex: number, weapon: string): void
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
</script>

<style scoped>
.base-units-panel {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

.unit-type-header {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-bottom: .3rem;
}

.unit-name {
  font-weight: 500;
  flex: 1;
}

.unit-fixed-count {
  font-size: .85rem;
  color: var(--p-text-muted-color);
  min-width: 2rem;
  text-align: right;
}

.count-input {
  width: 7rem;
}

.instances-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  padding-left: .75rem;
  border-left: 2px solid var(--p-surface-border);
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
</style>
