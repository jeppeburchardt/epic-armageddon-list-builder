<template>
  <ListHeader />
  <ListTabBar :list-id="id" />
  <RouterView />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import ListHeader from '@/components/shared/ListHeader.vue'
import ListTabBar from '@/components/shared/ListTabBar.vue'
import { useListEditor, listEditorKey } from '@/composables/useListEditor'

const props = defineProps<{ id: string }>()
provide(listEditorKey, useListEditor(props.id))
</script>
