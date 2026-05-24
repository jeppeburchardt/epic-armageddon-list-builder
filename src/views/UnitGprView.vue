<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { listEditorKey } from '@/composables/useListEditor'

const props = defineProps<{ id: string; unitName: string }>()
const router = useRouter()

const injected = inject(listEditorKey)
if (!injected) throw new Error('listEditorKey not provided')
const { armyDef } = injected

const MAX_DISPLAYED_NEIGHBOURS = 5
const POINT_STACK_SIZE = 5
const POINT_BASE_Y = 84
const POINT_VERTICAL_OFFSET = 6

const unit = computed(() => armyDef.value?.units.find((u) => u.name === props.unitName))
const gpr = computed(() => unit.value?.gprTrainingInfo)
const nearestNeighbours = computed(() =>
  gpr.value ? gpr.value.topNearestNeighbours.slice(0, MAX_DISPLAYED_NEIGHBOURS) : [],
)

const contributingAverage = computed(() => {
  if (!gpr.value || gpr.value.contributingPriceValues.length === 0) return null
  const total = gpr.value.contributingPriceValues.reduce((sum, value) => sum + value, 0)
  return total / gpr.value.contributingPriceValues.length
})

const chartWidth = 640
const chartHeight = 120
const chartPadding = 16
const chartMin = computed(() => {
  if (!gpr.value) return 0
  return Math.min(...gpr.value.contributingPriceValues, gpr.value.predictedMean, unit.value?.cost ?? 0)
})
const chartMax = computed(() => {
  if (!gpr.value) return 0
  return Math.max(...gpr.value.contributingPriceValues, gpr.value.predictedMean, unit.value?.cost ?? 0)
})
const chartSpan = computed(() => Math.max(chartMax.value - chartMin.value, 1))

function toChartX(value: number): number {
  const usableWidth = chartWidth - chartPadding * 2
  return chartPadding + ((value - chartMin.value) / chartSpan.value) * usableWidth
}

function formatNumber(value: number): string {
  return value.toFixed(2)
}
</script>

<template>
  <div v-if="!armyDef || !unit" class="not-found">
    <p>Unit not found.</p>
    <button type="button" class="secondary-button" @click="router.push({ name: 'list-reference', params: { id } })">
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
      <svg class="score-chart" :viewBox="`0 0 ${chartWidth} ${chartHeight}`" role="img" aria-label="Score chart">
        <line :x1="chartPadding" :x2="chartWidth - chartPadding" y1="96" y2="96" class="axis" />
        <circle
          v-for="(value, index) in gpr.contributingPriceValues"
          :key="`${value}-${index}`"
          :cx="toChartX(value)"
          :cy="POINT_BASE_Y - (index % POINT_STACK_SIZE) * POINT_VERTICAL_OFFSET"
          r="2.5"
          class="score-point"
        />
        <line :x1="toChartX(gpr.predictedMean)" :x2="toChartX(gpr.predictedMean)" y1="20" y2="96" class="mean-line" />
        <line
          v-if="contributingAverage !== null"
          :x1="toChartX(contributingAverage)"
          :x2="toChartX(contributingAverage)"
          y1="20"
          y2="96"
          class="average-line"
        />
      </svg>
      <div class="chart-legend">
        <span>Mean: {{ formatNumber(gpr.predictedMean) }}</span>
        <span v-if="contributingAverage !== null">
          Average (training): {{ formatNumber(contributingAverage) }}
        </span>
      </div>
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
  color: var(--p-text-muted-color);
}

.unit-name {
  margin: 0;
}

.unit-cost {
  margin: 0.2rem 0 0;
  color: var(--p-text-muted-color);
}

.gpr-section {
  margin-bottom: 2rem;
}

.section-heading {
  font-size: 1.1rem;
  margin: 0 0 0.75rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--p-surface-border);
}

.neighbour-list {
  margin: 0;
  padding-left: 1.2rem;
  line-height: 1.8;
}

.score-line {
  margin: 0 0 0.75rem;
}

.score-chart {
  width: 100%;
  height: auto;
  border: 1px solid var(--p-surface-border);
  border-radius: 0.375rem;
  background: var(--p-surface-0);
}

.axis {
  stroke: var(--p-surface-border);
  stroke-width: 1;
}

.score-point {
  fill: var(--p-primary-color);
}

.mean-line {
  stroke: var(--p-green-500, #10b981);
  stroke-width: 2;
}

.average-line {
  stroke: var(--p-orange-500, #f59e0b);
  stroke-width: 2;
  stroke-dasharray: 4 2;
}

.chart-legend {
  margin-top: 0.6rem;
  display: flex;
  gap: 1rem;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
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

.secondary-button {
  border-radius: 0.375rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--p-surface-border);
  background: var(--p-surface-0);
  color: inherit;
  cursor: pointer;
}

.empty-hint {
  color: var(--p-text-muted-color);
  margin: 0;
}
</style>
