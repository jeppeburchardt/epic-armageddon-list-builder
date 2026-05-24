<script setup lang="ts">
import { computed, inject } from 'vue'
import { listEditorKey } from '@/composables/useListEditor'

const injected = inject(listEditorKey)
if (!injected) throw new Error('listEditorKey not provided')
const { list, armyDef, totalPoints, updatePointsLimit } = injected

const value = computed(() => {
  const limit = list.value?.pointsLimit ?? 0
  return limit > 0 ? Math.ceil((totalPoints.value / limit) * 100) : 0
})
</script>

<template>
  <div class="header">
    <div class="title">{{ list?.name }}</div>
    <div class="meta">
      <progress class="progress" :value="Math.min(100, value)" max="100" />
      <div class="limit-row">
        <span class="limit-display">{{ totalPoints }} / {{ list?.pointsLimit }} pts</span>
        <input
          class="limit-input"
          type="number"
          :value="list?.pointsLimit"
          min="250"
          step="250"
          @change="(event) => {
            const nextValue = Number((event.target as HTMLInputElement).value)
            if (Number.isFinite(nextValue) && nextValue > 0) {
              updatePointsLimit(nextValue)
            }
          }"
        />
      </div>
    </div>
    <div class="sub-title">{{ armyDef?.name }}</div>
    <div id="list-header-cta" class="button"><slot name="button"></slot></div>
  </div>
</template>

<style lang="css" scoped>
.header {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 0.5rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.5rem;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.progress {
  width: 100%;
}

.limit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.limit-input {
  width: 6rem;
}

.sub-title {
  text-transform: uppercase;
  font-size: 0.8rem;
}
</style>
