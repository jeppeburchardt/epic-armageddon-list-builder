<template>
  <div v-if="!list || !armyDef" class="not-found">
    <p>List not found.</p>
    <Button label="Back" @click="router.push('/')" class="no-print" />
  </div>

  <div v-else>
    <!-- Header -->
    <ListHeader :id>
      <template #button>
       <Button label="Print" icon="pi pi-print" @click="window.print()" fluid />
      </template>
    </ListHeader>

    <!-- Print header (visible on print) -->
    <div class="print-only-header">
      <h1>{{ list.name }}</h1>
      <div class="print-meta">
        <span>{{ armyDef.name }}</span>
        <span>Strategy Rating: {{ armyDef.strategyRating }}</span>
        <span>{{ totalPoints }} / {{ list.pointsLimit }} pts</span>
      </div>
    </div>

    <!-- Validation warnings (no-print) -->
    <div class="no-print">
      <ValidationWarnings :results="validationResults" />
    </div>

    <!-- Restrictions summary -->
    <div v-if="armyDef.restrictions.length > 0" class="restrictions-summary">
      <p v-for="r in armyDef.restrictions" :key="r.type + r.group" class="restriction-line">
        Max {{ r.maxPercentage }}% of points on {{ r.group }} detachments
      </p>
    </div>

    <!-- Detachments -->
    <div class="detachments-list">
      <PrintDetachment
        v-for="entry in list.entries"
        :key="entry.id"
        :entry="entry"
        :army-def="armyDef"
      />
    </div>

    <!-- Totals -->
    <div class="totals-row">
      <strong>Total: {{ totalPoints }} / {{ list.pointsLimit }} pts</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import ValidationWarnings from '@/components/shared/ValidationWarnings.vue'
import PrintDetachment from '@/components/print/PrintDetachment.vue'
import { useListEditor } from '@/composables/useListEditor'
import ListHeader from '@/components/shared/ListHeader.vue'

const props = defineProps<{ id: string }>()
const router = useRouter()
const window = globalThis.window

const { list, armyDef, totalPoints, validationResults } = useListEditor(props.id)
</script>

<style scoped>
.print-view {
  max-width: 900px;
  margin: 0 auto;
}

.not-found {
  text-align: center;
  padding: 3rem;
  color: var(--p-text-muted-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.print-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.print-title {
  flex: 1;
  margin: 0;
  font-size: 1.4rem;
}

/* Print-only elements hidden on screen */
.print-only-header {
  display: none;
}

@media print {
  .print-only-header {
    display: block;
    margin-bottom: 1rem;
  }

  .print-only-header h1 {
    margin: 0 0 .25rem;
    font-size: 1.2rem;
  }

  .print-meta {
    font-size: .85rem;
    color: #555;
    display: flex;
    gap: 1.5rem;
  }
}

.restrictions-summary {
  margin-bottom: .75rem;
  font-size: .85rem;
  color: var(--p-text-muted-color);
}

.restriction-line {
  margin: .1rem 0;
}

.totals-row {
  border-top: 2px solid var(--p-surface-border);
  padding-top: .5rem;
  margin-top: .5rem;
  font-size: .95rem;
  text-align: right;
}
</style>
