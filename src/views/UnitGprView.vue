<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { listEditorKey } from '@/composables/useListEditor'
import GprChart from '@/components/army/GprChart.vue'

const props = defineProps<{ id: string; unitName: string }>()
const router = useRouter()

const injected = inject(listEditorKey)
if (!injected) throw new Error('listEditorKey not provided')
const { armyDef } = injected

const MAX_DISPLAYED_NEIGHBOURS = 5

const unit = computed(() => armyDef.value?.units.find((u) => u.name === props.unitName))
const gpr = computed(() => unit.value?.gprTrainingInfo)
const nearestNeighbours = computed(() =>
  gpr.value ? gpr.value.topNearestNeighbours.slice(0, MAX_DISPLAYED_NEIGHBOURS) : [],
)

function formatNumber(value: number): string {
  return value.toFixed(2)
}
</script>

<template>
  <div v-if="!armyDef || !unit" class="not-found">
    <p>Unit not found.</p>
    <button
      type="button"
      class="secondary-button"
      @click="router.push({ name: 'list-reference', params: { id } })"
    >
      Back to reference
    </button>
  </div>

  <div v-else class="gpr-view">
    <div class="gpr-header">
      <button
        type="button"
        class="back-button no-print"
        aria-label="Back to reference"
        @click="router.push({ name: 'list-reference', params: { id } })"
      >
        ←
      </button>
      <div>
        <h1 class="unit-name">{{ unit.name }}</h1>
        <p class="unit-cost">Cost: {{ unit.cost }} pts</p>
      </div>
    </div>

    <section class="gpr-section">
      <h2 class="section-heading">Nearest neighbours</h2>
      <p v-if="nearestNeighbours.length === 0" class="empty-hint">No neighbour data available.</p>
      <ol v-else class="neighbour-list">
        <li v-for="(neighbour, index) in nearestNeighbours" :key="neighbour.name + index">
          {{ neighbour.name }} — {{ formatNumber(neighbour.price) }} pts (distance:
          {{ formatNumber(neighbour.distance) }})
        </li>
      </ol>
    </section>

    <section v-if="gpr" class="gpr-section">
      <h2 class="section-heading">Score distribution</h2>
      <p class="score-line">Model score: {{ gpr.score }} · Quality: {{ gpr.quality }}</p>
      <GprChart :gpr="gpr" :unit-cost="unit.cost" />
    </section>

    <section v-else class="gpr-section">
      <h2 class="section-heading">Score distribution</h2>
      <p class="empty-hint">No GPR data available for this unit.</p>
    </section>
  </div>
</template>

<style scoped>
.gpr-view {
  max-width: 1000px;
  margin: 0 auto;
}

.gpr-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.back-button {
  border: none;
  background: transparent;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  color: var(--ea-text-muted-color);
}

.unit-name {
  margin: 0;
}

.unit-cost {
  margin: 0.2rem 0 0;
  color: var(--ea-text-muted-color);
}

.gpr-section {
  margin-bottom: 2rem;
}

.section-heading {
  font-size: 1.1rem;
  margin: 0 0 0.75rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--ea-surface-border);
}

.neighbour-list {
  margin: 0;
  padding-left: 1.2rem;
  line-height: 1.8;
}

.score-line {
  margin: 0 0 0.75rem;
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

.secondary-button {
  border-radius: 0.375rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--ea-surface-border);
  background: var(--ea-surface-0);
  color: inherit;
  cursor: pointer;
}

.empty-hint {
  color: var(--ea-text-muted-color);
  margin: 0;
}
</style>
