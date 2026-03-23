<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { useArmies } from '@/composables/useArmies'

const visible = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  (e: 'submit', name: string, pointsLimit: number, armySlug: string): void
}>()

const { armies } = useArmies()

const name = ref('')
const pointsLimit = ref(3000)
const selectedArmySlug = ref<string | null>(null)

const armyOptions = computed(() =>
  armies.value.map((a) => ({ label: a.name, value: a.slug })),
)

const canCreate = computed(
  () => name.value.trim().length > 0 && pointsLimit.value > 0 && selectedArmySlug.value !== null,
)

function close() {
  visible.value = false
  name.value = ''
  pointsLimit.value = 3000
  selectedArmySlug.value = null
}

function confirm() {
  if (!canCreate.value || !selectedArmySlug.value) return
  emit('submit', name.value.trim(), pointsLimit.value, selectedArmySlug.value)
  close()
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="New Army List"
    :style="{ width: '95vw', maxWidth: '480px' }"
    :draggable="false"
  >
    <div class="form">
      <div class="field">
        <label for="list-name">List Name</label>
        <InputText
          id="list-name"
          v-model="name"
          placeholder="My army"
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="list-points">Points Limit</label>
        <InputNumber
          id="list-points"
          v-model="pointsLimit"
          :min="250"
          :step="250"
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="list-army">Army</label>
        <Select
          id="list-army"
          v-model="selectedArmySlug"
          :options="armyOptions"
          option-label="label"
          option-value="value"
          placeholder="Select army"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" severity="secondary" @click="close" />
      <Button label="Create" :disabled="!canCreate" @click="confirm" />
    </template>
  </Dialog>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: .4rem;
}

.field label {
  font-size: .875rem;
  font-weight: 500;
}

.w-full {
  width: 100%;
}
</style>
