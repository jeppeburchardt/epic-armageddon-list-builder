<script setup lang="ts">
import { computed } from 'vue'
import Select from 'primevue/select'
import type { WeaponSlot } from '@/entities/army'
import type { UnitInstance } from '@/entities/list'
import { FloatLabel, Panel } from 'primevue'

const props = defineProps<{
  name?: string
  weaponSlots: WeaponSlot[]
  instance: UnitInstance
}>()

const emit = defineEmits<{
  (e: 'weapon-change', slotIndex: number, weaponName: string): void
}>()

interface ChoiceSlotEntry {
  realIndex: number
  name?: string
  choices: { weaponName: string; label: string; additionalCost: number }[]
}

const choiceSlots = computed<ChoiceSlotEntry[]>(() =>
  props.weaponSlots
    .map((slot, idx) => ({ slot, idx }))
    .filter(({ slot }) => slot.kind === 'choice')
    .map(({ slot, idx }) => ({
      realIndex: idx,
      name: slot.kind === 'choice' ? slot.name : undefined,
      choices:
        slot.kind === 'choice'
          ? slot.choices.map((c) => ({
              weaponName: c.weaponName,
              label:
                c.additionalCost > 0 ? `${c.weaponName} (+${c.additionalCost}pts)` : c.weaponName,
              additionalCost: c.additionalCost,
            }))
          : [],
    })),
)

function realSlotIndex(choiceSlotIdx: number): number {
  return choiceSlots.value[choiceSlotIdx].realIndex
}

function slotLabel(slot: ChoiceSlotEntry, slotIdx: number): string {
  return slot.name ?? `Weapon ${slotIdx + 1}`
}

function currentChoice(choiceSlotIdx: number): string {
  const realIdx = choiceSlots.value[choiceSlotIdx].realIndex
  return (
    props.instance.weaponSelections.find((s) => s.slotIndex === realIdx)?.chosenWeaponName ??
    choiceSlots.value[choiceSlotIdx].choices[0].weaponName
  )
}
</script>

<template>
  <Panel>
    <template #header>
      <div><span class="pi pi-wrench"></span> {{ name }}</div>
    </template>
    <div class="unit-instance-editor">
      <FloatLabel v-for="(slot, slotIdx) in choiceSlots" :key="slotIdx" variant="on">
        <Select
          :placeholder="slotLabel(slot, slotIdx)"
          :model-value="currentChoice(slotIdx)"
          :options="slot.choices"
          :input-id="`${slot.realIndex}-${slotIdx}`"
          option-label="label"
          option-value="weaponName"
          size="small"
          fluid
          @update:model-value="(val: string) => emit('weapon-change', realSlotIndex(slotIdx), val)"
        />
        <label :for="`${slot.realIndex}-${slotIdx}`">{{ slot.name ?? '' }}</label>
      </FloatLabel>
    </div>
  </Panel>
</template>

<style scoped>
.unit-instance-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: var(--);
}
</style>
