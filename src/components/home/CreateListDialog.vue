<script setup lang="ts">
import { ref, computed } from 'vue'
import { useArmies } from '@/composables/useArmies'

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  (e: 'submit', name: string, pointsLimit: number, armySlug: string): void
}>()

const { armies } = useArmies()

const name = ref('')
const pointsLimit = ref(3000)
const selectedArmySlug = ref('')

const armyOptions = computed(() => armies.value.map((a) => ({ label: a.name, value: a.slug })))

const canCreate = computed(
  () => name.value.trim().length > 0 && pointsLimit.value > 0 && selectedArmySlug.value.length > 0,
)

function close() {
  visible.value = false
  name.value = ''
  pointsLimit.value = 3000
  selectedArmySlug.value = ''
}

function confirm() {
  if (!canCreate.value) return
  emit('submit', name.value.trim(), pointsLimit.value, selectedArmySlug.value)
  close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-backdrop" @click.self="close">
      <div class="dialog" role="dialog" aria-modal="true" aria-label="New Army List">
        <h2 class="dialog-title">New Army List</h2>

        <div class="form">
          <div class="field">
            <label for="list-name">List Name</label>
            <input id="list-name" v-model="name" type="text" placeholder="My army" class="w-full" />
          </div>

          <div class="field">
            <label for="list-points">Points Limit</label>
            <input id="list-points" v-model.number="pointsLimit" type="number" min="250" step="250" class="w-full" />
          </div>

          <div class="field">
            <label for="list-army">Army</label>
            <select id="list-army" v-model="selectedArmySlug" class="w-full">
              <option value="">Select army</option>
              <option v-for="army in armyOptions" :key="army.value" :value="army.value">{{ army.label }}</option>
            </select>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="secondary-button" @click="close">Cancel</button>
          <button type="button" class="primary-button" :disabled="!canCreate" @click="confirm">Create</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 45%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
  padding: 1rem;
}

.dialog {
  width: min(95vw, 480px);
  background: var(--p-surface-0);
  border-radius: 0.5rem;
  border: 1px solid var(--p-surface-border);
  padding: 1rem;
}

.dialog-title {
  margin: 0 0 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
}

.w-full {
  width: 100%;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.primary-button,
.secondary-button {
  border-radius: 0.375rem;
  padding: 0.45rem 0.75rem;
  font: inherit;
  cursor: pointer;
}

.primary-button {
  border: 1px solid var(--p-primary-color);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.primary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.secondary-button {
  border: 1px solid var(--p-surface-border);
  background: var(--p-surface-0);
  color: inherit;
}
</style>
