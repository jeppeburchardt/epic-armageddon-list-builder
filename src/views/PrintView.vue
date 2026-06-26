<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import ValidationWarnings from '@/components/shared/ValidationWarnings.vue'
import PrintDetachment from '@/components/print/PrintDetachment.vue'
import SpecialRulesTable from '@/components/army/SpecialRulesTable.vue'
import { listEditorKey } from '@/composables/useListEditor'
import { deriveFormationUnits } from '@/entities/composition'
import type { Entry } from '@/entities/list'
import type { SpecialRuleDef } from '@/entities/army'

defineProps<{ id: string }>()
const router = useRouter()
const window = globalThis.window

const injected = inject(listEditorKey)
if (!injected) throw new Error('listEditorKey not provided')
const { list, armyDef, totalPoints, validationResults } = injected

const detachmentGroups = computed<string[]>(() => {
  const seen = new Set<string>()
  const groups: string[] = []

  armyDef.value?.detachments.forEach((detachment) => {
    if (!seen.has(detachment.group)) {
      seen.add(detachment.group)
      groups.push(detachment.group)
    }
  })

  return groups
})

const groupedEntries = computed(() => {
  const groups: Partial<Record<string, Entry[]>> = {}
  const extraGroupOrder: string[] = []

  ;(list.value?.entries ?? []).forEach((entry) => {
    const detachment = armyDef.value?.detachments.find((d) => d.name === entry.detachmentName)
    const group = detachment?.group ?? 'Other'

    if (!groups[group]) {
      groups[group] = []
      if (!detachmentGroups.value.includes(group)) {
        extraGroupOrder.push(group)
      }
    }

    const groupEntries = groups[group] ?? []
    groupEntries.push(entry)
    groups[group] = groupEntries
  })

  return [...detachmentGroups.value, ...extraGroupOrder]
    .map((group) => ({ group, entries: groups[group] ?? [] }))
    .filter((section) => section.entries.length > 0)
})

function getDetachmentNumber(entryId: string): number {
  const detachmentIndex = (list.value?.entries ?? []).findIndex((entry) => entry.id === entryId)
  if (detachmentIndex >= 0) return detachmentIndex + 1

  console.warn(`Missing detachment number for entry ${entryId} in print view`)
  return 0
}

const relevantSpecialRules = computed<SpecialRuleDef[]>(() => {
  if (!armyDef.value) return []

  const usedUnitNames = new Set<string>()
  for (const entry of list.value?.entries ?? []) {
    for (const ute of deriveFormationUnits(entry, armyDef.value)) {
      usedUnitNames.add(ute.unitName)
    }
  }

  const usedRuleNames = new Set<string>()
  for (const unit of armyDef.value.units) {
    if (!usedUnitNames.has(unit.name)) continue
    for (const name of unit.specialRuleNames ?? unit.traits ?? []) {
      usedRuleNames.add(name)
    }
  }

  return armyDef.value.unitSpecialRules.filter((rule) => usedRuleNames.has(rule.title))
})
</script>

<template>
  <div v-if="!list || !armyDef" class="not-found">
    <p>List not found.</p>
    <button type="button" class="secondary-button no-print" @click="router.push('/')">Back</button>
  </div>

  <div v-else>
    <Teleport to="#list-header-cta">
      <button type="button" class="primary-button" @click="window.print()">Print</button>
    </Teleport>

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
      <template v-for="section in groupedEntries" :key="section.group">
        <h4>{{ section.group }} detachments</h4>
        <PrintDetachment
          v-for="entry in section.entries"
          :key="entry.id"
          :entry="entry"
          :army-def="armyDef"
          :detachment-number="getDetachmentNumber(entry.id)"
        />
      </template>
    </div>

    <!-- Special rules relevant to units in this list -->
    <div v-if="relevantSpecialRules.length > 0" class="special-rules-section">
      <h4>Special Rules</h4>
      <SpecialRulesTable :rules="relevantSpecialRules" />
    </div>

    <!-- Totals -->
    <div class="totals-row">
      <strong>Total: {{ totalPoints }} / {{ list.pointsLimit }} pts</strong>
    </div>
  </div>
</template>

<style scoped>
.print-view {
  max-width: 900px;
  margin: 0 auto;
}

.not-found {
  text-align: center;
  padding: 3rem;
  color: var(--ea-text-muted-color);
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
    margin: 0 0 0.25rem;
    font-size: 1.2rem;
  }

  .print-meta {
    font-size: 0.85rem;
    color: #555;
    display: flex;
    gap: 1.5rem;
  }
}

.restrictions-summary {
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: var(--ea-text-muted-color);
}

.restriction-line {
  margin: 0.1rem 0;
}

.detachment-group-heading h2 {
  margin: 0;
  font-size: 1rem;
}

.special-rules-section {
  margin-top: 1rem;
}

.special-rules-section h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.detachments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.totals-row {
  border-top: 2px solid var(--ea-surface-border);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.95rem;
  text-align: right;
}

.primary-button,
.secondary-button {
  border-radius: 0.375rem;
  padding: 0.45rem 0.75rem;
  font: inherit;
  cursor: pointer;
}

.primary-button {
  border: 1px solid var(--ea-primary-color);
  background: var(--ea-primary-color);
  color: var(--ea-primary-contrast-color);
}

.secondary-button {
  border: 1px solid var(--ea-surface-border);
  background: var(--ea-surface-0);
  color: inherit;
}
</style>
