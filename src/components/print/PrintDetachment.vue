<template>
  <div class="print-detachment">
    <h3 class="det-title">
      {{ entry.detachmentName }}
      <span class="det-group">({{ detGroup }})</span>
      <span class="det-points">{{ entryPoints }}pts</span>
    </h3>

    <table class="units-table">
      <thead>
        <tr>
          <th>Unit</th>
          <th>Qty</th>
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
                <td :rowspan="fixedWeaponRows(ute.unitName).length" class="unit-name-cell">
                  <div class="unit-name-content">
                    {{ ute.unitName }}
                    <Tag
                      v-for="rule in unitSpecialRules(ute.unitName)"
                      :key="rule.title"
                      :value="rule.title"
                      severity="secondary"
                      class="unit-rule-tag"
                      v-tooltip="rule.paragraphs.join(' ') || undefined"
                    />
                  </div>
                </td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length">{{ ute.instances.length }}</td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length">{{ displayUnitDef(ute.unitName)?.type ?? '' }}</td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length">{{ displayUnitDef(ute.unitName)?.speed ?? '—' }}</td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length">{{ displayUnitDef(ute.unitName)?.armour ?? '—' }}</td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length">{{ displayUnitDef(ute.unitName)?.cc ?? '—' }}</td>
                <td :rowspan="fixedWeaponRows(ute.unitName).length">{{ displayUnitDef(ute.unitName)?.ff ?? '—' }}</td>
              </template>
              <td>{{ wrow.label }}</td>
              <td>{{ wrow.range }}</td>
              <td>{{ wrow.firepower }}</td>
            </tr>
          </template>
          <!-- Units with choice slots: list individually, each instance spans its weapon rows -->
          <template v-else>
            <template v-for="(inst, idx) in ute.instances" :key="idx">
              <tr v-for="(wrow, wi) in instanceWeaponRows(ute.unitName, inst)" :key="wi">
                <template v-if="wi === 0">
                  <td :rowspan="instanceWeaponRows(ute.unitName, inst).length" class="unit-name-cell">
                    <div class="unit-name-content">
                      {{ ute.unitName }} {{ idx + 1 }}
                      <Tag
                        v-for="rule in unitSpecialRules(ute.unitName)"
                        :key="rule.title"
                        :value="rule.title"
                        severity="secondary"
                        class="unit-rule-tag"
                        v-tooltip="rule.paragraphs.join(' ') || undefined"
                      />
                    </div>
                  </td>
                  <td :rowspan="instanceWeaponRows(ute.unitName, inst).length">1</td>
                  <td :rowspan="instanceWeaponRows(ute.unitName, inst).length">{{ displayUnitDef(ute.unitName)?.type ?? '' }}</td>
                  <td :rowspan="instanceWeaponRows(ute.unitName, inst).length">{{ displayUnitDef(ute.unitName)?.speed ?? '—' }}</td>
                  <td :rowspan="instanceWeaponRows(ute.unitName, inst).length">{{ displayUnitDef(ute.unitName)?.armour ?? '—' }}</td>
                  <td :rowspan="instanceWeaponRows(ute.unitName, inst).length">{{ displayUnitDef(ute.unitName)?.cc ?? '—' }}</td>
                  <td :rowspan="instanceWeaponRows(ute.unitName, inst).length">{{ displayUnitDef(ute.unitName)?.ff ?? '—' }}</td>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'
import Tooltip from 'primevue/tooltip'
import type { ArmyDef, SpecialRuleDef, UnitDef } from '@/entities/army'
import type { Entry, UnitInstance } from '@/entities/list'

const vTooltip = Tooltip
import { calculateEntryPoints } from '@/entities/points'
import { deriveFormationUnits } from '@/entities/composition'

const props = defineProps<{
  entry: Entry
  armyDef: ArmyDef
}>()

const entryPoints = computed(() => calculateEntryPoints(props.entry, props.armyDef))
const derivedUnits = computed(() => deriveFormationUnits(props.entry, props.armyDef))

const detGroup = computed(
  () => props.armyDef.detachments.find((d) => d.name === props.entry.detachmentName)?.group ?? '',
)

function getUnitDef(unitName: string): UnitDef | undefined {
  return props.armyDef.units.find((u) => u.name === unitName)
}

/**
 * Returns a display UnitDef for the given unit.
 * For CH units, merges the character profile on top of the attached base unit:
 *   - stats: character value if non-null, else base unit value
 *   - weaponSlots: base unit slots + character slots
 *   - specialRuleNames: base + character (deduplicated)
 */
function displayUnitDef(unitName: string): UnitDef | undefined {
  const def = getUnitDef(unitName)
  if (!def || def.type !== 'CH') return def

  // Find the character upgrade that placed this character
  const charUpgrade = props.entry.appliedUpgrades.find(
    (u) => u.type === 'character' && u.chosenCharacterName === unitName,
  )
  if (!charUpgrade || charUpgrade.type !== 'character' || !charUpgrade.attachedToUnitName) return def

  const baseDef = getUnitDef(charUpgrade.attachedToUnitName)
  if (!baseDef) return def

  return {
    ...baseDef,
    name: def.name,
    cost: def.cost,
    type: def.type,
    speed: def.speed ?? baseDef.speed,
    armour: def.armour ?? baseDef.armour,
    cc: def.cc ?? baseDef.cc,
    ff: def.ff ?? baseDef.ff,
    weaponSlots: [...baseDef.weaponSlots, ...def.weaponSlots],
    specialRuleNames: [
      ...new Set([
        ...(baseDef.specialRuleNames ?? []),
        ...(def.specialRuleNames ?? []),
      ]),
    ],
    transportType: baseDef.transportType,
    transportCapacity: baseDef.transportCapacity,
  }
}

function unitSpecialRules(unitName: string): SpecialRuleDef[] {
  const names = displayUnitDef(unitName)?.specialRuleNames ?? []
  return props.armyDef.unitSpecialRules.filter((r) => names.includes(r.title))
}

function hasChoices(unitName: string): boolean {
  return displayUnitDef(unitName)?.weaponSlots.some((s) => s.kind === 'choice') ?? false
}

interface WeaponRow { label: string; range: string; firepower: string }

function fixedWeaponRows(unitName: string): WeaponRow[] {
  const def = displayUnitDef(unitName)
  if (!def || def.weaponSlots.length === 0) return [{ label: '—', range: '—', firepower: '—' }]
  return def.weaponSlots.map((slot) => {
    if (slot.kind === 'fixed') {
      const label = slot.count && slot.count > 1 ? `${slot.count}× ${slot.weaponName}` : slot.weaponName
      return { label, range: slot.range, firepower: slot.firepower }
    }
    // Should not be reached for non-choice units, but handle gracefully
    return { label: slot.choices[0]?.weaponName ?? '—', range: slot.choices[0]?.range ?? '—', firepower: slot.choices[0]?.firepower ?? '—' }
  })
}

function instanceWeaponRows(unitName: string, instance: UnitInstance): WeaponRow[] {
  const def = displayUnitDef(unitName)
  if (!def || def.weaponSlots.length === 0) return [{ label: '—', range: '—', firepower: '—' }]
  return def.weaponSlots.map((slot, idx) => {
    if (slot.kind === 'fixed') {
      const label = slot.count && slot.count > 1 ? `${slot.count}× ${slot.weaponName}` : slot.weaponName
      return { label, range: slot.range, firepower: slot.firepower }
    }
    const sel = instance.weaponSelections.find((s) => s.slotIndex === idx)
    const chosen = slot.choices.find((c) => c.weaponName === sel?.chosenWeaponName) ?? slot.choices[0]
    return { label: chosen?.weaponName ?? '—', range: chosen?.range ?? '—', firepower: chosen?.firepower ?? '—' }
  })
}
</script>

<style scoped>
.print-detachment {
  margin-bottom: 1.5rem;
  page-break-inside: avoid;
}

.det-title {
  margin: 0 0 .5rem;
  font-size: 1rem;
  display: flex;
  gap: .75rem;
  align-items: baseline;
}

.det-group {
  font-size: .8rem;
  color: var(--p-text-muted-color);
  font-weight: 400;
}

.det-points {
  margin-left: auto;
  font-size: .875rem;
  font-weight: 600;
}

.units-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .8rem;
  margin-bottom: .5rem;
}

.units-table th,
.units-table td {
  border: 1px solid var(--p-surface-border);
  padding: .25rem .5rem;
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
  gap: .25rem;
}

.unit-rule-tag {
  font-size: .65rem;
  padding: 0 .3rem;
  line-height: 1.4;
}
</style>
