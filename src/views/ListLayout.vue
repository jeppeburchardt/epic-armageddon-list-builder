<template>
  <ListTabBar :list-id="id" />
  <RouterView />
</template>

<script setup lang="ts">
import ListTabBar from '@/components/shared/ListTabBar.vue'

defineProps<{ id: string }>()
</script>
