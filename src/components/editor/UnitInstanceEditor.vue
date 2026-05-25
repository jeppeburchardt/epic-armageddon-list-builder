<script setup lang="ts">
import { computed } from 'vue'
import type { WeaponSlot } from '@/entities/army'
import type { UnitInstance } from '@/entities/list'

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

function currentChoice(choiceSlotIdx: number): string {
  const realIdx = choiceSlots.value[choiceSlotIdx].realIndex
  return (
    props.instance.weaponSelections.find((s) => s.slotIndex === realIdx)?.chosenWeaponName ??
    choiceSlots.value[choiceSlotIdx].choices[0].weaponName
  )
}
</script>

<template>
  <div class="unit-instance-editor surface p-large stack-large">
    <div class="header">{{ name }}</div>
    <label v-for="(slot, slotIdx) in choiceSlots" :key="slotIdx" class="stack-small">
      <span>{{ slot.name ?? `Weapon ${slotIdx + 1}` }}</span>
      <select
        :value="currentChoice(slotIdx)"
        @change="
          (event) =>
            emit('weapon-change', slot.realIndex, (event.target as HTMLSelectElement).value)
        "
      >
        <option v-for="choice in slot.choices" :key="choice.weaponName" :value="choice.weaponName">
          {{ choice.label }}
        </option>
      </select>
    </label>
  </div>
</template>

<style scoped>
.weapon-choice {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
