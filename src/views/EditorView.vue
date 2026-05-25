<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import ValidationWarnings from '@/components/shared/ValidationWarnings.vue'
import DetachmentCard from '@/components/editor/DetachmentCard.vue'
import AddDetachmentDialog from '@/components/editor/AddDetachmentDialog.vue'
import { listEditorKey } from '@/composables/useListEditor'

defineProps<{ id: string }>()
const router = useRouter()

const injected = inject(listEditorKey)
if (!injected) throw new Error('listEditorKey not provided')
const {
  list,
  armyDef,
  validationResults,
  addEntry,
  removeEntry,
  moveEntry,
  updateBaseUnitCount,
  applyUpgrade,
  removeUpgrade,
  updateReplaceUpgradeCount,
  updateAddUpgradeUnitCount,
  updateWeaponSelection,
  updateCharacterUpgrade,
} = injected

const showAddDetachment = ref(false)
</script>

<template>
  <div v-if="!list || !armyDef" class="not-found">
    <p>List not found.</p>
    <button type="button" class="text-button" @click="router.push('/')">Back to lists</button>
  </div>

  <div v-else>
    <Teleport to="#list-header-cta">
      <button type="button" class="primary-button" @click="showAddDetachment = true">
        Add Detachment
      </button>
    </Teleport>

    <!-- Validation warnings -->
    <ValidationWarnings :results="validationResults" />

    <!-- Detachment list -->
    <div v-if="list.entries.length === 0" class="empty-state">
      <p>No detachments yet. Add your first detachment!</p>
    </div>

    <div v-else class="entries-list">
      <DetachmentCard
        v-for="(entry, index) in list.entries"
        :key="entry.id"
        :entry="entry"
        :army-def="armyDef"
        :is-first="index === 0"
        :is-last="index === list.entries.length - 1"
        :detachment-number="index + 1"
        @remove="removeEntry(entry.id)"
        @move-up="moveEntry(entry.id, 'up')"
        @move-down="moveEntry(entry.id, 'down')"
        @base-count-change="(unitName, count) => updateBaseUnitCount(entry.id, unitName, count)"
        @weapon-change="
          (source, unitName, instIdx, slotIdx, weapon) =>
            updateWeaponSelection(entry.id, source, unitName, instIdx, slotIdx, weapon)
        "
        @add-upgrade="(upgDef) => applyUpgrade(entry.id, upgDef)"
        @remove-upgrade="(upgName) => removeUpgrade(entry.id, upgName)"
        @replace-count-change="
          (upgName, count) => updateReplaceUpgradeCount(entry.id, upgName, count)
        "
        @add-count-change="
          (upgName, unitName, count) =>
            updateAddUpgradeUnitCount(entry.id, upgName, unitName, count)
        "
        @update-character="
          (upgName, charName) => updateCharacterUpgrade(entry.id, upgName, charName)
        "
      />
    </div>

    <!-- FAB: add detachment -->
    <div class="fab-area no-print"></div>

    <AddDetachmentDialog
      v-model:visible="showAddDetachment"
      :army-def="armyDef"
      @add="
        (name) => {
          addEntry(name)
          showAddDetachment = false
        }
      "
    />
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--ea-text-muted-color);
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  font-size: 0.85rem;
}

.header-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.limit-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.limit-label {
  font-size: 0.8rem;
  color: var(--ea-text-muted-color);
}

.limit-input {
  width: 6.5rem;
  font-size: 0.85rem;
}

.army-ref {
  margin-bottom: 0.75rem;
}

.army-ref-link {
  font-size: 0.85rem;
  color: var(--ea-primary-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.army-ref-link:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--ea-text-muted-color);
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fab-area {
  position: fixed;
  bottom: calc(4rem + 0.75rem);
  right: 1rem;
  z-index: 50;
}

.primary-button,
.text-button {
  border-radius: 0.375rem;
  padding: 0.45rem 0.75rem;
  font: inherit;
  cursor: pointer;
}

.primary-button {
  border: 1px solid var(--ea-primary-color);
  background: var(--ea-primary-color);
  color: var(--ea-primary-contrast-color);
}

.text-button {
  border: 1px solid var(--ea-surface-border);
  background: var(--ea-surface-0);
  color: inherit;
}

@media (min-width: 768px) {
  .fab-area {
    bottom: 1.5rem;
  }
}
</style>
