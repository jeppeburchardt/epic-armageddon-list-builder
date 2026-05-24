<script setup lang="ts">
import type { DetachmentDef, UnitCount } from '@/entities/army'

defineProps<{
  detachments: DetachmentDef[]
}>()

function describeUnits(det: DetachmentDef): string {
  return det.units
    .map((uc: UnitCount) => {
      if ('count' in uc) return `${uc.count}× ${uc.unitName}`
      return `${uc.min}–${uc.max}× ${uc.unitName}`
    })
    .join(', ')
}

function describeRestrictions(det: DetachmentDef): string {
  return det.restrictions.map((r) => `Max ${r.value} per list`).join('; ')
}
</script>

<template>
  <div class="army-reference-table">
    <table class="army-reference-table__native-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Group</th>
          <th>Units</th>
          <th>Upgrades</th>
          <th>Restrictions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="detachment in detachments" :key="detachment.name">
          <td>{{ detachment.name }}</td>
          <td>{{ detachment.group }}</td>
          <td>{{ describeUnits(detachment) }}</td>
          <td>{{ detachment.availableUpgrades.join(', ') }}</td>
          <td>{{ describeRestrictions(detachment) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
