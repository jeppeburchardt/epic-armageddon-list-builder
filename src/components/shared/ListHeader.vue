<script setup lang="ts">
import { inject } from 'vue'
import { listEditorKey } from '@/composables/useListEditor'

const injected = inject(listEditorKey)
if (!injected) throw new Error('listEditorKey not provided')
const { list, armyDef, totalPoints } = injected
</script>

<template>
  <div class="list-header header surface">
    <div class="sub-title-points">{{ totalPoints }}</div>
    <div class="title">{{ list?.name }}</div>
    <div class="sub-title">{{ armyDef?.name }}</div>
  </div>
  <div id="list-header-cta" class="button"><slot name="button"></slot></div>
</template>

<style lang="css" scoped>
.list-header {
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-color: var(--ea-tertiary);
  color: var(--ea-tertiary);
  border-width: 2px 0 2px 0;
  border-style: solid;
  text-align: center;
  /* background-color: var(--ea-primary); */
}

.title {
  font-size: 2rem;
}

.sub-title {
  text-transform: uppercase;
  font-size: 0.8rem;
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
</style>
