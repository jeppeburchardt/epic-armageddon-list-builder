<script setup lang="ts">
import type { UnitDef } from '@/entities/army'

defineProps<{
  units: UnitDef[]
}>()

interface WeaponRow {
  label: string
  range: string
  firepower: string
  isAlternative: boolean
}

function weaponRows(unit: UnitDef): WeaponRow[] {
  const rows: WeaponRow[] = []
  for (const slot of unit.weaponSlots) {
    if (slot.kind === 'fixed') {
      const label =
        slot.count && slot.count > 1 ? `${slot.count}× ${slot.weaponName}` : slot.weaponName
      rows.push({ label, range: slot.range, firepower: slot.firepower, isAlternative: false })
    } else {
      slot.choices.forEach((c, i) => {
        const costSuffix = c.additionalCost > 0 ? ` +${c.additionalCost}pts` : ''
        rows.push({
          label: `${c.weaponName}${costSuffix}`,
          range: c.range,
          firepower: c.firepower,
          isAlternative: i > 0,
        })
      })
    }
  }
  return rows.length > 0 ? rows : [{ label: '—', range: '—', firepower: '—', isAlternative: false }]
}

function describeTransportType(unit: UnitDef): string {
  if (!unit.transportation?.type) return '—'
  const cost = unit.transportation.cost ?? 0
  return `${unit.transportation.type} (${cost})`
}

function describeCapacity(unit: UnitDef): string {
  if (!unit.transportation?.capacity || !unit.transportation.capabilities) return '—'
  const capabilities = unit.transportation.capabilities.join(', ')
  return `${unit.transportation.capacity} (${capabilities})`
}
</script>

<template>
  <div class="units-table-wrapper">
    <table class="units-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Pts</th>
          <th>Type</th>
          <th>Speed</th>
          <th>Armour</th>
          <th>CC</th>
          <th>FF</th>
          <th>Weapon</th>
          <th>Range</th>
          <th>Firepower</th>
          <th>Special Rules</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(unit, ui) in units" :key="ui">
          <tr v-for="(wrow, wi) in weaponRows(unit)" :key="wi">
            <!-- Unit stat cells only on the first weapon row -->
            <template v-if="wi === 0">
              <td :rowspan="weaponRows(unit).length" class="unit-name-cell">{{ unit.name }}</td>
              <td :rowspan="weaponRows(unit).length">{{ unit.cost }}</td>
              <td :rowspan="weaponRows(unit).length">{{ unit.type }}</td>
              <td :rowspan="weaponRows(unit).length">{{ unit.speed }}</td>
              <td :rowspan="weaponRows(unit).length">{{ unit.armour }}</td>
              <td :rowspan="weaponRows(unit).length">{{ unit.cc }}</td>
              <td :rowspan="weaponRows(unit).length">{{ unit.ff }}</td>
            </template>
            <!-- Weapon columns — always rendered -->
            <td :class="{ 'weapon-alt': wrow.isAlternative }">
              <span v-if="wrow.isAlternative" class="alt-prefix">or </span>{{ wrow.label }}
            </td>
            <td>{{ wrow.range }}</td>
            <td>{{ wrow.firepower }}</td>
            <!-- Transport/capacity/special rules only on first weapon row -->
            <template v-if="wi === 0">
              <td :rowspan="weaponRows(unit).length">
                {{ unit.specialRuleNames?.join(', ') ?? '—' }}
              </td>
            </template>
          </tr>
          <!-- Spacer row between units -->
          <tr v-if="ui < units.length - 1" class="unit-spacer" aria-hidden="true">
            <td colspan="13"></td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.units-table-wrapper {
  overflow-x: auto;
}

.units-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.units-table th,
.units-table td {
  border: 1px solid var(--p-surface-border);
  padding: 0.3rem 0.5rem;
  white-space: nowrap;
  vertical-align: middle;
}

.units-table th {
  background: var(--p-surface-100);
  font-weight: 600;
  text-align: left;
}

.unit-name-cell {
  font-weight: 500;
}

.weapon-alt {
  color: var(--p-text-muted-color);
  font-style: italic;
}

.alt-prefix {
  font-style: normal;
  font-weight: 600;
}

.unit-spacer td {
  border: none;
  padding: 0.15rem 0;
  background: transparent;
}
</style>
