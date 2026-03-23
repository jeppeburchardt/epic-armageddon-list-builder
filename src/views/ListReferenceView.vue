<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import DetachmentsTable from '@/components/army/DetachmentsTable.vue'
import UpgradesTable from '@/components/army/UpgradesTable.vue'
import UnitsTable from '@/components/army/UnitsTable.vue'
import SpecialRulesTable from '@/components/army/SpecialRulesTable.vue'
import { listEditorKey } from '@/composables/useListEditor'

defineProps<{ id: string }>()
const router = useRouter()

const injected = inject(listEditorKey)
if (!injected) throw new Error('listEditorKey not provided')
const { armyDef } = injected
</script>

<template>
  <div v-if="!armyDef" class="not-found">
    <p>Army reference not found.</p>
    <Button label="Back to lists" @click="router.push('/')" />
  </div>

  <div v-else>
    <div class="reference-header">
      <h1 class="army-name">{{ armyDef.name }}</h1>
      <span class="army-meta">Strategy Rating: {{ armyDef.strategyRating }}</span>
    </div>

    <!-- Restrictions -->
    <section v-if="armyDef.restrictions.length > 0" class="army-section">
      <h2 class="section-heading">Restrictions</h2>
      <ul class="restrictions-list">
        <li v-for="r in armyDef.restrictions" :key="r.type + r.group">
          <template v-if="r.type === 'max_group_percentage'">
            Max {{ r.maxPercentage }}% of points on <strong>{{ r.group }}</strong> detachments
          </template>
        </li>
      </ul>
    </section>

    <!-- Special rules -->
    <section v-if="armyDef.specialRules.length > 0" class="army-section">
      <h2 class="section-heading">Special Rules</h2>
      <div v-for="rule in armyDef.specialRules" :key="rule.title" class="special-rule">
        <h3 class="rule-title">{{ rule.title }}</h3>
        <p class="rule-text">{{ rule.text }}</p>
      </div>
    </section>

    <!-- Detachments -->
    <section class="army-section">
      <h2 class="section-heading">Detachments</h2>
      <DetachmentsTable :detachments="armyDef.detachments" />
    </section>

    <!-- Upgrades -->
    <section class="army-section">
      <h2 class="section-heading">Upgrades</h2>
      <UpgradesTable :upgrades="armyDef.upgrades" />
    </section>

    <!-- Units -->
    <section class="army-section">
      <h2 class="section-heading">Units</h2>
      <UnitsTable :units="armyDef.units" />
    </section>

    <!-- Unit Special Rules -->
    <section v-if="armyDef.unitSpecialRules.length > 0" class="army-section">
      <h2 class="section-heading">Unit Special Rules</h2>
      <SpecialRulesTable :rules="armyDef.unitSpecialRules" />
    </section>
  </div>
</template>

<style scoped>
.reference-view {
  max-width: 1000px;
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

.reference-header {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.army-name {
  margin: 0;
  font-size: 1.5rem;
}

.army-meta {
  color: var(--p-text-muted-color);
  font-size: .9rem;
}

.army-section {
  margin-bottom: 2rem;
}

.section-heading {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 .75rem;
  padding-bottom: .4rem;
  border-bottom: 1px solid var(--p-surface-border);
}

.restrictions-list {
  padding-left: 1.25rem;
  margin: 0;
  line-height: 1.6;
}

.special-rule {
  margin-bottom: 1rem;
}

.rule-title {
  margin: 0 0 .25rem;
  font-size: 1rem;
}

.rule-text {
  margin: 0;
  color: var(--p-text-muted-color);
  line-height: 1.5;
}
</style>
