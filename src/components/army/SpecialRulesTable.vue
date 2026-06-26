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
            {{ rule.paragraphs.length > 0 ? rule.paragraphs.join(' ') : '—' }}
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
</style>
