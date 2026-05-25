<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLists } from '@/composables/useLists'
import { useArmies } from '@/composables/useArmies'
import ListCard from '@/components/home/ListCard.vue'
import CreateListDialog from '@/components/home/CreateListDialog.vue'

const router = useRouter()
const { lists, createList, deleteList } = useLists()
const { getArmy } = useArmies()
const showCreateDialog = ref(false)

function getArmyDef(slug: string) {
  return getArmy(slug)
}

function handleCreate(name: string, pointsLimit: number, armySlug: string): void {
  const list = createList({ name, pointsLimit, armySlug })
  void router.push({ name: 'list-edit', params: { id: list.id } })
}

function confirmDelete(id: string) {
  if (window.confirm('Delete this army list? This cannot be undone.')) {
    deleteList(id)
  }
}
</script>

<template>
  <div class="home-view">
    <div class="page-header">
      <h1 class="page-title">My Army Lists</h1>
      <button type="button" class="action-button" @click="showCreateDialog = true">New List</button>
    </div>

    <div v-if="lists.length === 0" class="empty-state">
      <p>No army lists yet. Create your first list to get started!</p>
      <button type="button" class="action-button" @click="showCreateDialog = true">
        Create List
      </button>
    </div>

    <div v-else class="lists-grid">
      <ListCard
        v-for="list in lists"
        :key="list.id"
        :list="list"
        :army-def="getArmyDef(list.armySlug)"
        @edit="router.push({ name: 'list-edit', params: { id: $event } })"
        @view="router.push({ name: 'list-view', params: { id: $event } })"
        @delete="confirmDelete($event)"
      />
    </div>

    <CreateListDialog v-model:visible="showCreateDialog" @submit="handleCreate" />
  </div>
</template>

<style scoped>
.home-view {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.4rem;
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--ea-text-muted-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.action-button {
  border: 1px solid var(--ea-primary-color);
  background: var(--ea-primary-color);
  color: var(--ea-primary-contrast-color);
  border-radius: 0.375rem;
  padding: 0.45rem 0.75rem;
  font: inherit;
  cursor: pointer;
}
</style>
