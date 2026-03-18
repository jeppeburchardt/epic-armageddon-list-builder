<template>
  <DataTable :value="upgrades" striped-rows size="small">
    <Column field="name" header="Name" />
    <Column header="Type">
      <template #body="{ data }">
        {{ data.type === 'replace' ? 'Replace' : data.type === 'character' ? 'Character' : 'Add' }}
      </template>
    </Column>
    <Column header="Details">
      <template #body="{ data }">
        {{ describeUpgrade(data) }}
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { UpgradeDef } from '@/entities/army'

defineProps<{
  upgrades: UpgradeDef[]
}>()

function describeUpgrade(u: UpgradeDef): string {
  if (u.type === 'replace') {
    return `Replace up to ${u.replaces.max} ${u.replaces.fromUnitName} with ${u.replaces.toUnitName}`
  }
  if (u.type === 'character') {
    return `Choose one of: ${u.characterNames.join(', ')}`
  }
  return u.adds.map((a) => `Add ${a.min}–${a.max}× ${a.unitName}`).join(', ')
}
</script>
