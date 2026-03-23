<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { SpecialRuleDef } from '@/entities/army'

defineProps<{
  rules: SpecialRuleDef[]
}>()
</script>

<template>
  <DataTable :value="rules" striped-rows size="small">
    <Column field="title" header="Rule" style="min-width: 160px" />
    <Column header="Description">
      <template #body="{ data }">
        {{ data.paragraphs.length > 0 ? data.paragraphs.join(' ') : '—' }}
      </template>
    </Column>
  </DataTable>
</template>
