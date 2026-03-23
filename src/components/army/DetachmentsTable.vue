<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
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
  return det.restrictions
    .map((r) => `Max ${r.value} per list`)
    .join('; ')
}
</script>

<template>
  <div class="army-table-section">
    <DataTable :value="detachments" striped-rows size="small">
      <Column field="name" header="Name" />
      <Column field="group" header="Group" />
      <Column header="Units">
        <template #body="{ data }">
          {{ describeUnits(data) }}
        </template>
      </Column>
      <Column header="Upgrades">
        <template #body="{ data }">
          {{ data.availableUpgrades.join(', ') }}
        </template>
      </Column>
      <Column header="Restrictions">
        <template #body="{ data }">
          {{ describeRestrictions(data) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
