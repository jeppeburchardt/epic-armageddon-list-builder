<script setup lang="ts">
import type { SpecialRuleDef } from '@/entities/army'

defineProps<{
  rules: SpecialRuleDef[]
}>()
</script>

<template>
  <div class="special-rules-list">
    <article v-for="rule in rules" :key="rule.title" class="special-rule">
      <h3 class="special-rule__title">{{ rule.title }}</h3>
      <p v-for="(paragraph, index) in rule.paragraphs" :key="index" class="special-rule__text">
        {{ paragraph }}
      </p>
      <p v-if="rule.paragraphs.length === 0" class="special-rule__text special-rule__text--empty">
        —
      </p>
    </article>
  </div>
</template>

<style scoped>
.special-rules-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.special-rule {
  border: 1px solid var(--ea-surface-border);
  border-radius: var(--ea-border-radius);
  padding: 0.75rem 1rem;
  background: var(--ea-surface-card);
}

.special-rule__title {
  margin: 0 0 0.4rem;
  font-size: 1rem;
  font-weight: 600;
}

.special-rule__text {
  margin: 0;
  color: var(--ea-text-muted-color);
  line-height: 1.5;
}

.special-rule__text + .special-rule__text {
  margin-top: 0.5rem;
}

.special-rule__text--empty {
  color: var(--ea-text-faint-color);
}
</style>
