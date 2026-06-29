<script setup lang="ts">
import { computed } from 'vue'
import type { ArmyDef } from '@/entities/army'
import type { Entry } from '@/entities/list'
import { calculateGroupPoints } from '@/entities/points'
import { getGroupColor } from '@/entities/groupColors'

const props = defineProps<{
  entries: Entry[]
  pointsLimit: number
  armyDef: ArmyDef
  totalPoints: number
}>()

const segments = computed(() => {
  const seen = new Set<string>()
  const groups: string[] = []
  for (const d of props.armyDef.detachments) {
    if (!seen.has(d.group)) {
      seen.add(d.group)
      groups.push(d.group)
    }
  }
  return groups.map((group) => {
    const points = calculateGroupPoints(props.entries, group, props.armyDef)
    const pct = props.pointsLimit > 0 ? (points / props.pointsLimit) * 100 : 0
    return { group, points, pct, color: getGroupColor(group, props.armyDef) }
  })
})

const overBudget = computed(() => props.totalPoints > props.pointsLimit)
</script>

<template>
  <div class="points-bar-wrapper">
    <div class="bar-track" :class="{ 'over-budget': overBudget }">
      <div
        v-for="seg in segments"
        :key="seg.group"
        class="bar-segment"
        :style="{ width: seg.pct + '%', background: seg.color }"
      />
    </div>
    <div class="legend">
      <div v-for="seg in segments" :key="seg.group" class="legend-item">
        <span class="legend-swatch" :style="{ background: seg.color }" />
        <span class="legend-label">{{ seg.group }}</span>
        <span class="legend-pts">{{ seg.points }}pts</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.points-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.bar-track {
  height: 8px;
  border-radius: 4px;
  background: var(--ea-surface-200);
  overflow: hidden;
  display: flex;
}

.bar-track.over-budget {
  outline: 2px solid var(--ea-danger-fg);
  outline-offset: 1px;
}

.bar-segment {
  height: 100%;
  transition: width 0.2s ease;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--ea-text-xs);
  color: var(--ea-text-muted-color);
}

.legend-swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  font-weight: 500;
}

.legend-pts {
  font-family: var(--ea-font-mono);
}
</style>
