<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import DetachmentsTable from '@/components/army/DetachmentsTable.vue'
import UpgradesTable from '@/components/army/UpgradesTable.vue'
import UnitsTable from '@/components/army/UnitsTable.vue'
import SpecialRulesTable from '@/components/army/SpecialRulesTable.vue'
import { useArmies } from '@/composables/useArmies'
import { groupUnitsForReference } from '@/entities/army'

const props = defineProps<{ slug: string }>()
const router = useRouter()
const { getArmy } = useArmies()

const army = computed(() => getArmy(props.slug))
const unitGroups = computed(() => (army.value ? groupUnitsForReference(army.value.units) : []))
</script>

<template>
  <div v-if="!army" class="not-found">
    <p>Army not found: "{{ slug }}"</p>
    <Button label="Back" @click="router.push('/')" />
  </div>

  <div v-else class="army-view">
    <div class="army-header">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        size="small"
        aria-label="Back"
        class="no-print"
        @click="router.back()"
      />
      <div class="army-title-block">
        <h1 class="army-name">{{ army.name }}</h1>
        <span class="army-meta">Strategy Rating: {{ army.strategyRating }}</span>
      </div>
    </div>

    <!-- Restrictions -->
    <section v-if="army.restrictions.length > 0" class="army-section">
      <h2 class="section-heading">Restrictions</h2>
      <ul class="restrictions-list">
        <li v-for="r in army.restrictions" :key="r.type + r.group">
          <template v-if="r.type === 'max_group_percentage'">
            Max {{ r.maxPercentage }}% of points on <strong>{{ r.group }}</strong> detachments
          </template>
        </li>
      </ul>
    </section>

    <!-- Special rules -->
    <section v-if="army.specialRules.length > 0" class="army-section">
      <h2 class="section-heading">Special Rules</h2>
      <div v-for="rule in army.specialRules" :key="rule.title" class="special-rule">
        <h3 class="rule-title">{{ rule.title }}</h3>
        <p class="rule-text">{{ rule.text }}</p>
      </div>
    </section>

    <!-- Detachments -->
    <section class="army-section">
      <h2 class="section-heading">Detachments</h2>
      <DetachmentsTable :detachments="army.detachments" />
    </section>

    <!-- Upgrades -->
    <section class="army-section">
      <h2 class="section-heading">Upgrades</h2>
      <UpgradesTable :upgrades="army.upgrades" />
    </section>

    <!-- Units -->
    <section class="army-section">
      <h2 class="section-heading">Units</h2>
      <div v-for="group in unitGroups" :key="group.key" class="unit-group">
        <h3 class="unit-group-heading">{{ group.title }}</h3>
        <UnitsTable :units="group.units" />
      </div>
    </section>

    <!-- Unit Special Rules -->
    <section v-if="army.unitSpecialRules.length > 0" class="army-section">
      <h2 class="section-heading">Unit Special Rules</h2>
      <SpecialRulesTable :rules="army.unitSpecialRules" />
    </section>
  </div>
</template>

<style scoped>
.army-view {
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

.army-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.army-title-block {
  flex: 1;
}

.army-name {
  margin: 0 0 0.2rem;
  font-size: 1.5rem;
}

.army-meta {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.army-section {
  margin-bottom: 2rem;
}

.section-heading {
  font-size: 1.1rem;
  margin: 0 0 0.75rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--p-surface-border);
}

.restrictions-list {
  margin: 0;
  padding-left: 1.25rem;
  line-height: 1.8;
}

.special-rule {
  margin-bottom: 1rem;
}

.rule-title {
  margin: 0 0 0.3rem;
  font-size: 0.95rem;
}

.rule-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
}

.unit-group + .unit-group {
  margin-top: 1.25rem;
}

.unit-group-heading {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}
</style>
