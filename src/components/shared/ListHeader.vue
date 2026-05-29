<script setup lang="ts">
import { inject } from 'vue'
import { listEditorKey } from '@/composables/useListEditor'

const injected = inject(listEditorKey)
if (!injected) throw new Error('listEditorKey not provided')
const { list, armyDef, totalPoints } = injected
</script>

<template>
  <div class="list-header header surface">
    <div class="lh-points">{{ totalPoints }} / {{ list?.pointsLimit }} pts</div>
    <div class="lh-title">{{ list?.name }}</div>
    <div class="lh-sub">{{ armyDef?.name }}</div>
  </div>
  <div id="list-header-cta" class="button"><slot name="button"></slot></div>
</template>

<style lang="css" scoped>
.list-header {
  padding: 1rem 0;
  border-color: var(--ea-tertiary);
  color: var(--ea-tertiary);
  border-width: 2px 0;
  border-style: solid;
  text-align: center;
  background: transparent;
  margin-bottom: 1rem;
}

.lh-points {
  font-family: var(--ea-font-mono);
  font-size: 0.85rem;
  opacity: 0.85;
}

.lh-title {
  font-family: var(--ea-font-display);
  text-transform: uppercase;
  font-size: var(--ea-text-display);
  letter-spacing: 0.03em;
  line-height: 1.1;
}

.lh-sub {
  text-transform: uppercase;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
}
</style>
