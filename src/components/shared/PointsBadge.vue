<script setup lang="ts">
import Tag from 'primevue/tag';
import { computed } from 'vue'

const props = defineProps<{
  used: number
  limit?: number
}>()

const isOverBudget = computed(
  () => props.limit !== undefined && props.used > props.limit,
)
</script>

<template>
  <Tag
    :severity="isOverBudget ? 'warn' : 'secondary'"
  >
    {{ used }}{{ limit !== undefined ? ` / ${limit}` : '' }} pts
  </Tag>
</template>
