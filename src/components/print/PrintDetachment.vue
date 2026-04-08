<script setup lang="ts">
import { computed } from 'vue'
import Panel from 'primevue/panel'
import Tag from 'primevue/tag'
import Tooltip from 'primevue/tooltip'
import type { ArmyDef, SpecialRuleDef, UnitDef } from '@/entities/army'
import type { Entry, UnitInstance, UnitTypeEntry } from '@/entities/list'

const vTooltip = Tooltip
import { calculateEntryPoints } from '@/entities/points'
import { deriveFormationUnits } from '@/entities/composition'

const props = defineProps<{
  entry: Entry
  armyDef: ArmyDef
}>()

const entryPoints = computed(() => calculateEntryPoints(props.entry, props.armyDef))
const derivedUnits = computed(() => deriveFormationUnits(props.entry, props.armyDef))

function getUnitDef(unitName: string): UnitDef | undefined {
  return props.armyDef.units.find((u) => u.name === unitName)
}

/**
 * Returns a display UnitDef for the given unit.
 */
function displayUnitDef(unitName: string): UnitDef | undefined {
  const def = getUnitDef(unitName)
  return def
}

function unitSpecialRules(unitName: string): SpecialRuleDef[] {
  const names = displayUnitDef(unitName)?.specialRuleNames ?? []
  return props.armyDef.unitSpecialRules.filter((r) => names.includes(r.title))
}

function hasChoices(unitName: string): boolean {
  return displayUnitDef(unitName)?.weaponSlots.some((s) => s.kind === 'choice') ?? false
}

interface WeaponRow {
  label: string
  range: string
  firepower: string
}

function fixedWeaponRows(unitName: string): WeaponRow[] {
  const def = displayUnitDef(unitName)
  if (!def || def.weaponSlots.length === 0) return [{ label: '—', range: '—', firepower: '—' }]
  return def.weaponSlots.map((slot) => {
    if (slot.kind === 'fixed') {
      const label =
        slot.count && slot.count > 1 ? `${slot.count}× ${slot.weaponName}` : slot.weaponName
      return { label, range: slot.range, firepower: slot.firepower }
    }
    // Should not be reached for non-choice units, but handle gracefully
    return {
      label: slot.choices[0]?.weaponName ?? '—',
      range: slot.choices[0]?.range ?? '—',
      firepower: slot.choices[0]?.firepower ?? '—',
    }
  })
}

function instanceWeaponRows(unitName: string, instance: UnitInstance): WeaponRow[] {
  const def = displayUnitDef(unitName)
  if (!def || def.weaponSlots.length === 0) return [{ label: '—', range: '—', firepower: '—' }]
  return def.weaponSlots.map((slot, idx) => {
    if (slot.kind === 'fixed') {
      const label =
        slot.count && slot.count > 1 ? `${slot.count}× ${slot.weaponName}` : slot.weaponName
      return { label, range: slot.range, firepower: slot.firepower }
    }
    const sel = instance.weaponSelections.find((s) => s.slotIndex === idx)
    const chosen =
      slot.choices.find((c) => c.weaponName === sel?.chosenWeaponName) ?? slot.choices[0]
    return { label: chosen.weaponName, range: chosen.range, firepower: chosen.firepower }
  })
}

function groupedChoiceUnits(ute: UnitTypeEntry): { qty: number; instance: UnitInstance }[] {
  const map = new Map<string, UnitInstance[]>()
  for (const inst of ute.instances) {
    const key = JSON.stringify(inst.weaponSelections.sort((a, b) => a.slotIndex - b.slotIndex))
    let arr = map.get(key)
    if (!arr) {
      arr = []
      map.set(key, arr)
    }
    arr.push(inst)
  }
  return Array.from(map.values()).map((insts) => ({ qty: insts.length, instance: insts[0] }))
}
</script>

<template>
  <Panel class="print-detachment">
    <template #header>
      <span>
        {{ entry.detachmentName }}
      </span>
      <span class="det-points">{{ entryPoints }}pts</span>
    </template>
    <table class="units-table">
      <thead>
        <tr>
          <th>Qty</th>
          <th>Unit</th>
          <th>Type</th>
          <th>Speed</th>
          <th>Armour</th>
          <th>CC</th>
          <th>FF</th>
          <th>Weapon</th>
          <th>Range</th>
          <th>Firepower</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="ute in derivedUnits" :key="ute.unitName">
          <!-- Units with no choice slots: group by quantity, rowspan over weapon rows -->
          <template v-if="!hasChoices(ute.unitName)">
            <tr v-for="(wrow, wi) in fixedWeaponRows(ute.unitName)" :key="wi">
              <template v-if="wi === 0">
                <td :rowspan="fixedWeaponRows(ute.unitName).length">
                  {{ ute.instances.length }}
                </td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length" class="unit-name-cell">
                  <div class="unit-name-content">
                    {{ ute.unitName }}
                    <Tag
                      v-for="rule in unitSpecialRules(ute.unitName)"
                      :key="rule.title"
                      v-tooltip="rule.paragraphs.join(' ') || undefined"
                      :value="rule.title"
                      severity="secondary"
                      class="unit-rule-tag"
                    />
                  </div>
                </td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length">
                  {{ displayUnitDef(ute.unitName)?.type ?? '' }}
                </td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length">
                  {{ displayUnitDef(ute.unitName)?.speed ?? '—' }}
                </td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length">
                  {{ displayUnitDef(ute.unitName)?.armour ?? '—' }}
                </td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length">
                  {{ displayUnitDef(ute.unitName)?.cc ?? '—' }}
                </td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length">
                  {{ displayUnitDef(ute.unitName)?.ff ?? '—' }}
                </td>
              </template>
              <td>{{ wrow.label }}</td>
              <td>{{ wrow.range }}</td>
              <td>{{ wrow.firepower }}</td>
            </tr>
          </template>
          <!-- Units with choice slots: list individually, each instance spans its weapon rows -->
          <template v-else>
            <template v-for="(group, gidx) in groupedChoiceUnits(ute)" :key="gidx">
              <tr v-for="(wrow, wi) in instanceWeaponRows(ute.unitName, group.instance)" :key="wi">
                <template v-if="wi === 0">
                  <td :rowspan="instanceWeaponRows(ute.unitName, group.instance).length">
                    {{ group.qty }}
                  </td>
                  <td
                    :rowspan="instanceWeaponRows(ute.unitName, group.instance).length"
                    class="unit-name-cell"
                  >
                    <div class="unit-name-content">
                      {{ ute.unitName }}
                      <Tag
                        v-for="rule in unitSpecialRules(ute.unitName)"
                        :key="rule.title"
                        v-tooltip="rule.paragraphs.join(' ') || undefined"
                        :value="rule.title"
                        severity="secondary"
                        class="unit-rule-tag"
                      />
                    </div>
                  </td>
                  <td :rowspan="instanceWeaponRows(ute.unitName, group.instance).length">
                    {{ displayUnitDef(ute.unitName)?.type ?? '' }}
                  </td>
                  <td :rowspan="instanceWeaponRows(ute.unitName, group.instance).length">
                    {{ displayUnitDef(ute.unitName)?.speed ?? '—' }}
                  </td>
                  <td :rowspan="instanceWeaponRows(ute.unitName, group.instance).length">
                    {{ displayUnitDef(ute.unitName)?.armour ?? '—' }}
                  </td>
                  <td :rowspan="instanceWeaponRows(ute.unitName, group.instance).length">
                    {{ displayUnitDef(ute.unitName)?.cc ?? '—' }}
                  </td>
                  <td :rowspan="instanceWeaponRows(ute.unitName, group.instance).length">
                    {{ displayUnitDef(ute.unitName)?.ff ?? '—' }}
                  </td>
                </template>
                <td>{{ wrow.label }}</td>
                <td>{{ wrow.range }}</td>
                <td>{{ wrow.firepower }}</td>
              </tr>
            </template>
          </template>
        </template>
      </tbody>
    </table>
  </Panel>
</template>

<style scoped>
.print-detachment {
  page-break-inside: avoid;
}

.det-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
}

.det-group {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  font-weight: 400;
}

.det-points {
  margin-left: auto;
  font-size: 0.875rem;
  font-weight: 600;
}

.units-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.units-table th,
.units-table td {
  border: 1px solid var(--p-surface-200);
  padding: 0.25rem 0.5rem;
  text-align: left;
  white-space: nowrap;
  vertical-align: middle;
}

.units-table th {
  background: var(--p-surface-100);
  font-weight: 600;
}

.unit-name-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
}

.unit-rule-tag {
  font-size: 0.65rem;
  padding: 0 0.3rem;
  line-height: 1.4;
}
</style>
