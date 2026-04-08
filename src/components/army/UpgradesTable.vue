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
  const names = u.adds.map((a) => a.unitName).join(', ')
  if (u.maxTotal !== undefined) {
    return `Add up to ${u.maxTotal} from: ${names}`
  }
  return `Add any of: ${names}`
}
</script>

<template>
  <div class="army-reference-table">
    <DataTable :value="upgrades" striped-rows size="small">
      <Column field="name" header="Name" />
      <Column header="Type">
        <template #body="{ data }">
          {{
            data.type === 'replace' ? 'Replace' : data.type === 'character' ? 'Character' : 'Add'
          }}
        </template>
      </Column>
      <Column header="Details">
        <template #body="{ data }">
          {{ describeUpgrade(data) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
