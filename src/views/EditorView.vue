<template>
  <div v-if="!list || !armyDef" class="not-found">
    <p>List not found.</p>
    <Button label="Back to lists" @click="router.push('/')" />
  </div>

  <div v-else>
    <Teleport to="#list-header-cta">
      <Button
          label="Add Detachment"
          icon="pi pi-plus"
          @click="showAddDetachment = true"
          severity="primary"
          fluid
        />
    </Teleport>

    <!-- Validation warnings -->
    <ValidationWarnings :results="validationResults" />

    <!-- Detachment list -->
    <div v-if="list.entries.length === 0" class="empty-state">
      <p>No detachments yet. Add your first detachment!</p>
    </div>

    <div v-else class="entries-list">
      <DetachmentCard
        v-for="entry in list.entries"
        :key="entry.id"
        :entry="entry"
        :army-def="armyDef"
        @remove="removeEntry(entry.id)"
        @base-count-change="(unitName, count) => updateBaseUnitCount(entry.id, unitName, count)"
        @weapon-change="(source, unitName, instIdx, slotIdx, weapon) => updateWeaponSelection(entry.id, source, unitName, instIdx, slotIdx, weapon)"
        @add-upgrade="(upgDef) => applyUpgrade(entry.id, upgDef)"
        @remove-upgrade="(upgName) => removeUpgrade(entry.id, upgName)"
        @replace-count-change="(upgName, count) => updateReplaceUpgradeCount(entry.id, upgName, count)"
        @add-count-change="(upgName, unitName, count) => updateAddUpgradeUnitCount(entry.id, upgName, unitName, count)"
        @update-character="(upgName, charName) => updateCharacterUpgrade(entry.id, upgName, charName)"
      />
    </div>

    <!-- FAB: add detachment -->
    <div class="fab-area no-print">
      
    </div>

    <AddDetachmentDialog
      v-model:visible="showAddDetachment"
      :army-def="armyDef"
      @add="(name) => { addEntry(name); showAddDetachment = false }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, Teleport, inject } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import ValidationWarnings from '@/components/shared/ValidationWarnings.vue'
import DetachmentCard from '@/components/editor/DetachmentCard.vue'
import AddDetachmentDialog from '@/components/editor/AddDetachmentDialog.vue'
import { listEditorKey } from '@/composables/useListEditor'

defineProps<{ id: string }>()
const router = useRouter()

const {
  list,
  armyDef,
  validationResults,
  addEntry,
  removeEntry,
  updateBaseUnitCount,
  applyUpgrade,
  removeUpgrade,
  updateReplaceUpgradeCount,
  updateAddUpgradeUnitCount,
  updateWeaponSelection,
  updateCharacterUpgrade,
} = inject(listEditorKey)!

const showAddDetachment = ref(false)
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--p-text-muted-color);
}

.editor-header {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.header-name {
  flex: 1;
  min-width: 120px;
}

.name-display {
  font-size: 1.1rem;
  font-weight: 600;
}

.name-input {
  width: 100%;
  font-size: 1.1rem;
  font-weight: 600;
}

.limit-display {
  font-size: .85rem;
}

.header-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .25rem;
}

.limit-row {
  display: flex;
  align-items: center;
  gap: .4rem;
}

.limit-label {
  font-size: .8rem;
  color: var(--p-text-muted-color);
}

.limit-input {
  width: 6.5rem;
  font-size: .85rem;
}

.army-ref {
  margin-bottom: .75rem;
}

.army-ref-link {
  font-size: .85rem;
  color: var(--p-primary-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: .3rem;
}

.army-ref-link:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--p-text-muted-color);
}

.entries-list {
  display: flex;
  flex-direction: column;
}

.fab-area {
  position: fixed;
  bottom: calc(4rem + .75rem);
  right: 1rem;
  z-index: 50;
}

@media (min-width: 768px) {
  .fab-area {
    bottom: 1.5rem;
  }
}
</style>
