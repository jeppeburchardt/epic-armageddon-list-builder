<script setup lang="ts">
import { inject } from 'vue'
import { listEditorKey } from '@/composables/useListEditor'

const injected = inject(listEditorKey)
if (!injected) throw new Error('listEditorKey not provided')
const { list, armyDef, totalPoints } = injected
</script>

<template>
  <div class="list-header">
    <div class="lh-main">
      <h1 class="lh-title">{{ list?.name }}</h1>
      <div class="lh-meta">
        <span class="lh-sub">{{ armyDef?.name }}</span>
        <span class="lh-dot" aria-hidden="true">·</span>
        <span class="lh-points">{{ totalPoints }} / {{ list?.pointsLimit }} pts</span>
      </div>
    </div>
    <div id="list-header-cta" class="lh-cta"><slot name="button"></slot></div>
  </div>
</template>

<style lang="css" scoped>
.list-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--ea-surface-border);
}

.lh-main {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.lh-title {
  font-size: var(--ea-text-display);
  font-weight: 600;
  line-height: 1.2;
  color: var(--ea-text-color);
}

.lh-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ea-text-muted-color);
  font-size: var(--ea-text-sm);
}

.lh-dot {
  color: var(--ea-text-faint-color);
}

.lh-points {
  font-family: var(--ea-font-mono);
  font-size: 0.8125rem;
}

.lh-cta {
  flex-shrink: 0;
}
</style>
