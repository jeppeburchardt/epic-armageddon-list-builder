<script setup lang="ts">
import type { SpecialRuleDef } from '@/entities/army'

defineProps<{
  rules: SpecialRuleDef[]
}>()
</script>

<template>
  <div class="army-reference-table">
    <table class="army-reference-table__native-table">
      <thead>
        <tr>
          <th style="min-width: 160px">Rule</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rule in rules" :key="rule.title">
          <td>{{ rule.title }}</td>
          <td class="rule-description">
            <p v-for="(paragraph, index) in rule.paragraphs" :key="index">{{ paragraph }}</p>
            <template v-if="rule.paragraphs.length === 0">—</template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.army-reference-table .army-reference-table__native-table td.rule-description {
  white-space: normal;
}

.rule-description p:not(:last-child) {
  margin-bottom: 0.5rem;
}

.rule-description p {
  margin-top: 0;
}
</style>
