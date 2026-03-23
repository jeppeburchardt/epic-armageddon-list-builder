<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{ listId: string }>()

const route = useRoute()
</script>

<template>
  <nav class="list-tab-bar no-print">
    <RouterLink
      :to="{ name: 'list-view', params: { id: listId } }"
      class="tab-item"
      :class="{ active: route.name === 'list-view' }"
    >
      <span class="pi pi-eye" />
      <span class="tab-label">View</span>
    </RouterLink>
    <RouterLink
      :to="{ name: 'list-edit', params: { id: listId } }"
      class="tab-item"
      :class="{ active: route.name === 'list-edit' }"
    >
      <span class="pi pi-pencil" />
      <span class="tab-label">Edit</span>
    </RouterLink>
    <RouterLink
      :to="{ name: 'list-reference', params: { id: listId } }"
      class="tab-item"
      :class="{ active: route.name === 'list-reference' }"
    >
      <span class="pi pi-book" />
      <span class="tab-label">Reference</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.list-tab-bar {
  display: flex;
  border-bottom: 1px solid var(--p-surface-border);
  margin-bottom: 1rem;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  text-decoration: none;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition:
    color 0.15s,
    border-color 0.15s;
  white-space: nowrap;
}

.tab-item:hover {
  color: var(--p-text-color);
}

.tab-item.active {
  color: var(--p-primary-color);
  border-bottom-color: var(--p-primary-color);
  font-weight: 500;
}

.tab-item .pi {
  font-size: 0.9rem;
}
</style>
