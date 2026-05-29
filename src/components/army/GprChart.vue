<script setup lang="ts">
import { computed } from 'vue'
import type { GprTrainingInfo } from '@/entities/army'

const props = defineProps<{
  gpr: GprTrainingInfo
  unitCost: number
}>()

const POINT_STACK_SIZE = 5
const POINT_BASE_Y = 84
const POINT_VERTICAL_OFFSET = 6

const chartWidth = 640
const chartHeight = 120
const chartPadding = 16

const contributingAverage = computed(() => {
  if (props.gpr.contributingPriceValues.length === 0) return null
  const total = props.gpr.contributingPriceValues.reduce((sum, value) => sum + value, 0)
  return total / props.gpr.contributingPriceValues.length
})

const chartMin = computed(() =>
  Math.min(
    ...props.gpr.contributingPriceValues,
    props.gpr.predictedMean - 2 * props.gpr.uncertainty,
    props.unitCost,
  ),
)

const chartMax = computed(() =>
  Math.max(
    ...props.gpr.contributingPriceValues,
    props.gpr.predictedMean + 2 * props.gpr.uncertainty,
    props.unitCost,
  ),
)

const chartSpan = computed(() => Math.max(chartMax.value - chartMin.value, 1))

function toChartX(value: number): number {
  const usableWidth = chartWidth - chartPadding * 2
  return chartPadding + ((value - chartMin.value) / chartSpan.value) * usableWidth
}

function formatNumber(value: number): string {
  return value.toFixed(2)
}

const sigma1Left = computed(() => toChartX(props.gpr.predictedMean - props.gpr.uncertainty))
const sigma1Right = computed(() => toChartX(props.gpr.predictedMean + props.gpr.uncertainty))
const sigma2Left = computed(() => toChartX(props.gpr.predictedMean - 2 * props.gpr.uncertainty))
const sigma2Right = computed(() => toChartX(props.gpr.predictedMean + 2 * props.gpr.uncertainty))
</script>

<template>
  <svg
    class="score-chart"
    :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
    role="img"
    aria-label="GPR score chart"
  >
    <rect
      :x="sigma2Left"
      :width="sigma2Right - sigma2Left"
      y="20"
      height="76"
      class="sigma2-band"
    />
    <rect
      :x="sigma1Left"
      :width="sigma1Right - sigma1Left"
      y="20"
      height="76"
      class="sigma1-band"
    />
    <line :x1="chartPadding" :x2="chartWidth - chartPadding" y1="96" y2="96" class="axis" />
    <circle
      v-for="(value, index) in gpr.contributingPriceValues"
      :key="`${value}-${index}`"
      :cx="toChartX(value)"
      :cy="POINT_BASE_Y - (index % POINT_STACK_SIZE) * POINT_VERTICAL_OFFSET"
      r="2.5"
      class="score-point"
    />
    <line
      v-if="contributingAverage !== null"
      :x1="toChartX(contributingAverage)"
      :x2="toChartX(contributingAverage)"
      y1="20"
      y2="96"
      class="average-line"
    />
    <line
      :x1="toChartX(gpr.predictedMean)"
      :x2="toChartX(gpr.predictedMean)"
      y1="20"
      y2="96"
      class="mean-line"
    />
  </svg>

  <div class="chart-legend">
    <span>Mean: {{ formatNumber(gpr.predictedMean) }}</span>
    <span v-if="contributingAverage !== null">
      Average (training): {{ formatNumber(contributingAverage) }}
    </span>
    <span>Uncertainty (1σ): {{ formatNumber(gpr.uncertainty) }}</span>
  </div>

  <details class="chart-explainer">
    <summary>How to read this chart</summary>
    <p>
      This chart shows a <strong>Gaussian Process Regression (GPR)</strong> price prediction for
      this unit. GPR is a probabilistic model: rather than producing a single price estimate, it
      outputs a full distribution — a most-likely value and a measure of how certain it is.
    </p>
    <ul>
      <li><strong>Dots</strong> — the training data points (prices of similar units) that influenced this prediction.</li>
      <li><strong>Green solid line</strong> — the GPR predicted mean: the model's best estimate of the unit's fair price.</li>
      <li><strong>Dark green band (±1σ)</strong> — 68% confidence interval. There is a ~68% probability the true fair price falls in this range.</li>
      <li><strong>Light green band (±2σ)</strong> — 95% confidence interval. A wide band means the model is uncertain; a narrow band means it is confident.</li>
      <li><strong>Orange dashed line</strong> — the simple arithmetic average of the training data, shown for comparison.</li>
    </ul>
  </details>
</template>

<style scoped>
.score-chart {
  width: 100%;
  height: auto;
  border: 1px solid var(--ea-surface-border);
  border-radius: 0.375rem;
  background: var(--ea-surface-0);
}

.sigma2-band {
  fill: var(--ea-green-500, #10b981);
  opacity: 0.1;
}

.sigma1-band {
  fill: var(--ea-green-500, #10b981);
  opacity: 0.22;
}

.axis {
  stroke: var(--ea-surface-border);
  stroke-width: 1;
}

.score-point {
  fill: var(--ea-primary-color);
}

.mean-line {
  stroke: var(--ea-green-500, #10b981);
  stroke-width: 2;
}

.average-line {
  stroke: var(--ea-orange-500, #f59e0b);
  stroke-width: 2;
  stroke-dasharray: 4 2;
}

.chart-legend {
  margin-top: 0.6rem;
  display: flex;
  gap: 1rem;
  color: var(--ea-text-muted-color);
  font-size: 0.9rem;
}

.chart-explainer {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--ea-text-muted-color);
}

.chart-explainer summary {
  cursor: pointer;
  color: var(--ea-text-color);
}

.chart-explainer p,
.chart-explainer ul {
  margin: 0.5rem 0 0;
  line-height: 1.6;
}

.chart-explainer ul {
  padding-left: 1.2rem;
}
</style>
