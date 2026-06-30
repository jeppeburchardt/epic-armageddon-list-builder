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
  <div class="unit-instance-editor surface">
    <span v-if="name" class="instance-name">{{ name }}</span>
    <div class="weapon-choices">
      <label v-for="(slot, slotIdx) in choiceSlots" :key="slotIdx" class="weapon-choice">
        <span class="slot-name">{{ slot.name ?? `Weapon ${slotIdx + 1}` }}</span>
        <select
          :value="currentChoice(slotIdx)"
          @change="
            (event) =>
              emit('weapon-change', slot.realIndex, (event.target as HTMLSelectElement).value)
          "
        >
          <option
            v-for="choice in slot.choices"
            :key="choice.weaponName"
            :value="choice.weaponName"
          >
            {{ choice.label }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>

<style scoped>
.unit-instance-editor {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--ea-surface-border);
  border-radius: var(--ea-radius-md);
}

.instance-name {
  flex: 1 1 8rem;
  min-width: 0;
  font-weight: 500;
}

.weapon-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  flex: 2 1 12rem;
}

.weapon-choice {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1 1 12rem;
  min-width: 0;
}

.slot-name {
  font-size: 0.8rem;
  color: var(--ea-text-muted-color);
  white-space: nowrap;
}

.weapon-choice select {
  flex: 1 1 auto;
  min-width: 0;
}
</style>
