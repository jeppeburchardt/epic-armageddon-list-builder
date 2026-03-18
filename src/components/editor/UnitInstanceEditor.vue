<template>
  <div class="unit-instance-editor">
    <div
      v-for="(slot, slotIdx) in choiceSlots"
      :key="slotIdx"
      class="weapon-slot"
    >
      <label class="slot-label">{{ slotLabel(slot, slotIdx) }}</label>
      <Select
        :model-value="currentChoice(slotIdx)"
        :options="slot.choices"
        option-label="label"
        option-value="weaponName"
        class="weapon-select"
        @update:model-value="(val: string) => emit('weapon-change', realSlotIndex(slotIdx), val)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Select from 'primevue/select'
import type { WeaponSlot } from '@/entities/army'
import type { UnitInstance } from '@/entities/list'

const props = defineProps<{
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
              label: c.additionalCost > 0 ? `${c.weaponName} (+${c.additionalCost}pts)` : c.weaponName,
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
    choiceSlots.value[choiceSlotIdx].choices[0]?.weaponName ??
    ''
  )
}
</script>

<style scoped>
.unit-instance-editor {
  display: flex;
  flex-direction: column;
  gap: .4rem;
}

.weapon-slot {
  display: flex;
  flex-direction: column;
  gap: .2rem;
}

.slot-label {
  font-size: .75rem;
  color: var(--p-text-muted-color);
}

.weapon-select {
  width: 100%;
  font-size: .85rem;
}
</style>
