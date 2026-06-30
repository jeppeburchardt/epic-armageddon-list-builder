<script setup lang="ts">
import { computed } from 'vue'
import type { ArmyDef, SpecialRuleDef, UnitDef } from '@/entities/army'
import type { Entry, UnitInstance, UnitTypeEntry } from '@/entities/list'
import { toRomanNumeral } from '@/entities/romanNumerals'
import { calculateEntryPoints } from '@/entities/points'
import { deriveFormationUnits } from '@/entities/composition'
import { getGroupColor } from '@/entities/groupColors'

const props = defineProps<{
  entry: Entry
  armyDef: ArmyDef
  detachmentNumber: number
}>()

const entryPoints = computed(() => calculateEntryPoints(props.entry, props.armyDef))
const detachmentDef = computed(() =>
  props.armyDef.detachments.find((d) => d.name === props.entry.detachmentName),
)
const groupColor = computed(() =>
  detachmentDef.value ? getGroupColor(detachmentDef.value.group, props.armyDef) : undefined,
)
const derivedUnits = computed(() => deriveFormationUnits(props.entry, props.armyDef))
const detachmentNumberLabel = computed(() =>
  props.detachmentNumber > 0 ? toRomanNumeral(props.detachmentNumber) : '',
)

function getUnitDef(unitName: string): UnitDef | undefined {
  return props.armyDef.units.find((u) => u.name === unitName)
}

function ruleNames(unitName: string): string[] {
  const def = getUnitDef(unitName)
  return def?.specialRuleNames ?? def?.traits ?? []
}

function unitSpecialRules(unitName: string): SpecialRuleDef[] {
  const names = ruleNames(unitName)
  return props.armyDef.unitSpecialRules.filter((r) => names.includes(r.title))
}

function hasChoices(unitName: string): boolean {
  return getUnitDef(unitName)?.weaponSlots.some((s) => s.kind === 'choice') ?? false
}

interface WeaponRow {
  label: string
  range: string
  firepower: string
}

interface DisplayUnitGroup {
  key: string
  unitName: string
  qty: number
  rows: WeaponRow[]
  unitDef?: UnitDef
  specialRules: SpecialRuleDef[]
  shaded: boolean
}

function fixedWeaponRows(unitName: string): WeaponRow[] {
  const def = getUnitDef(unitName)
  if (!def || def.weaponSlots.length === 0) return [{ label: '—', range: '—', firepower: '—' }]
  return def.weaponSlots.map((slot) => {
    if (slot.kind === 'fixed') {
      const label =
        slot.count && slot.count > 1 ? `${slot.count}× ${slot.weaponName}` : slot.weaponName
      return { label, range: slot.range, firepower: slot.firepower }
    }
    return {
      label: slot.choices[0]?.weaponName ?? '—',
      range: slot.choices[0]?.range ?? '—',
      firepower: slot.choices[0]?.firepower ?? '—',
    }
  })
}

function instanceWeaponRows(unitName: string, instance: UnitInstance): WeaponRow[] {
  const def = getUnitDef(unitName)
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

const displayGroups = computed<DisplayUnitGroup[]>(() => {
  let displayIndex = 0

  return derivedUnits.value.flatMap((ute, uteIndex) => {
    const unitDef = getUnitDef(ute.unitName)
    const specialRules = unitSpecialRules(ute.unitName)

    if (!hasChoices(ute.unitName)) {
      const shaded = (displayIndex + 1) % 2 === 0
      displayIndex += 1

      return [
        {
          key: `${ute.unitName}-${uteIndex}`,
          unitName: ute.unitName,
          qty: ute.instances.length,
          rows: fixedWeaponRows(ute.unitName),
          unitDef,
          specialRules,
          shaded,
        },
      ]
    }

    return groupedChoiceUnits(ute).map((group, groupIndex) => {
      const shaded = (displayIndex + 1) % 2 === 0
      displayIndex += 1

      return {
        key: `${ute.unitName}-${uteIndex}-${groupIndex}`,
        unitName: ute.unitName,
        qty: group.qty,
        rows: instanceWeaponRows(ute.unitName, group.instance),
        unitDef,
        specialRules,
        shaded,
      }
    })
  })
})
</script>

<template>
  <section class="print-detachment">
    <header class="det-header">
      <span>
        <span
          v-if="detachmentNumberLabel"
          class="detachment-number-badge"
          :style="groupColor ? { background: groupColor } : {}"
        >{{ detachmentNumberLabel }}</span>
        {{ entry.detachmentName }}
      </span>
      <span class="det-points">{{ entryPoints }}pts</span>
    </header>
    <div class="units-table-scroll">
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
        <template v-for="group in displayGroups" :key="group.key">
          <tr v-for="(wrow, wi) in group.rows" :key="wi" :class="{ 'unit-row-even': group.shaded }">
            <template v-if="wi === 0">
              <td :rowspan="group.rows.length">{{ group.qty }}</td>
              <td :rowspan="group.rows.length" class="unit-name-cell">
                <div class="unit-name-content">
                  {{ group.unitName }}
                  <span
                    v-for="rule in group.specialRules"
                    :key="rule.title"
                    class="unit-rule-tag"
                    :title="rule.paragraphs.join(' ') || undefined"
                  >
                    {{ rule.title }}
                  </span>
                </div>
              </td>
              <td :rowspan="group.rows.length">{{ group.unitDef?.type ?? '' }}</td>
              <td :rowspan="group.rows.length">{{ group.unitDef?.speed ?? '—' }}</td>
              <td :rowspan="group.rows.length">{{ group.unitDef?.armour ?? '—' }}</td>
              <td :rowspan="group.rows.length">{{ group.unitDef?.cc ?? '—' }}</td>
              <td :rowspan="group.rows.length">{{ group.unitDef?.ff ?? '—' }}</td>
            </template>
            <td>{{ wrow.label }}</td>
            <td>{{ wrow.range }}</td>
            <td>{{ wrow.firepower }}</td>
          </tr>
        </template>
      </tbody>
    </table>
    </div>
  </section>
</template>

<style scoped>
.print-detachment {
  page-break-inside: avoid;
  border: 1px solid var(--ea-surface-border);
  border-radius: 0.5rem;
  padding: 0.5rem;
}

.det-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.detachment-number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  margin-right: 0.35rem;
  border-radius: var(--ea-radius-sm);
  background: var(--ea-accent);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
}

@media print {
  .detachment-number-badge {
    background: #000;
    color: #fff;
  }
}

.det-points {
  margin-left: auto;
  font-size: 0.875rem;
  font-weight: 600;
}

.units-table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 0.5rem;
}

.units-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

@media print {
  .units-table-scroll {
    overflow-x: visible;
  }
}

.units-table th,
.units-table td {
  border: 1px solid var(--ea-surface-200);
  padding: 0.25rem 0.5rem;
  text-align: left;
  white-space: nowrap;
  vertical-align: middle;
}

.unit-row-even td {
  background: var(--ea-surface-100);
}

.units-table th {
  background: var(--ea-surface-200);
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
  border: 1px solid var(--ea-surface-border);
  border-radius: 999px;
  background: var(--ea-surface-100);
}
</style>
