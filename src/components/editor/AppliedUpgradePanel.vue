<script setup lang="ts">
import { computed, reactive } from 'vue'
import UnitInstanceEditor from './UnitInstanceEditor.vue'
import UnitPanel from './UnitPanel.vue'
import type { ArmyDef } from '@/entities/army'
import type { AppliedUpgrade, UnitInstance } from '@/entities/list'
import { hasSameWeaponConfiguration } from '@/entities/composition'

const props = defineProps<{
  upgrade: AppliedUpgrade
  armyDef: ArmyDef
}>()

const emit = defineEmits<{
  (e: 'remove'): void
  (e: 'replace-count-change', count: number): void
  (e: 'add-count-change', unitName: string, count: number): void
  (
    e: 'weapon-change',
    upgradeName: string,
    unitName: string,
    instanceIndex: number,
    slotIndex: number,
    weapon: string,
  ): void
  (e: 'update-character', chosenCharacterName: string | null): void
}>()

const replaceUpgrade = computed(() => (props.upgrade.type === 'replace' ? props.upgrade : null))
const characterUpgrade = computed(() => (props.upgrade.type === 'character' ? props.upgrade : null))

const characterUpgradeDef = computed(() => {
  const def = upgradeDef.value
  return def?.type === 'character' ? def : null
})

const upgradeDef = computed(() => props.armyDef.upgrades.find((u) => u.name === props.upgrade.upgradeName))

const fromUnitName = computed(() => {
  const def = upgradeDef.value
  if (!def || def.type !== 'replace') return ''
  return def.replaces.fromUnitName
})

const replaceMax = computed(() => {
  const def = upgradeDef.value
  if (!def || def.type !== 'replace') return 0
  return def.replaces.max
})

function getAddMax(unitName: string): number | undefined {
  const def = upgradeDef.value
  if (!def || def.type !== 'add' || def.maxTotal === undefined) return undefined
  const upgrade = props.upgrade
  if (upgrade.type !== 'add') return undefined
  const otherUnitsTotal = upgrade.addedUnits
    .filter((u) => u.unitName !== unitName)
    .reduce((sum, u) => sum + u.instances.length, 0)
  return Math.max(0, def.maxTotal - otherUnitsTotal)
}

function getWeaponSlots(unitName: string) {
  return props.armyDef.units.find((u) => u.name === unitName)?.weaponSlots ?? []
}

function hasChoices(unitName: string): boolean {
  return getWeaponSlots(unitName).some((s) => s.kind === 'choice')
}

const replaceCostPerUnit = computed<number | undefined>(() => {
  const def = upgradeDef.value
  if (!def || def.type !== 'replace') return undefined
  const fromDef = props.armyDef.units.find((u) => u.name === def.replaces.fromUnitName)
  const toDef = props.armyDef.units.find((u) => u.name === def.replaces.toUnitName)
  if (!fromDef || !toDef) return undefined
  return toDef.cost - fromDef.cost
})

function addUnitCost(unitName: string): number | undefined {
  return props.armyDef.units.find((u) => u.name === unitName)?.cost
}

const characterOptions = computed(() =>
  (characterUpgradeDef.value?.characterNames ?? []).map((name) => {
    const cost = props.armyDef.units.find((u) => u.name === name)?.cost
    return {
      name,
      label: cost !== undefined ? `${name} (${cost}pts)` : name,
    }
  }),
)

const sameConfig = reactive<Record<string, boolean>>({})

function getInstances(unitName: string): UnitInstance[] {
  if (props.upgrade.type === 'replace' && props.upgrade.replacingUnits.unitName === unitName) {
    return props.upgrade.replacingUnits.instances
  }

  if (props.upgrade.type === 'add') {
    return props.upgrade.addedUnits.find((unit) => unit.unitName === unitName)?.instances ?? []
  }

  return []
}

function getSameConfig(unitName: string): boolean {
  if (!(unitName in sameConfig)) {
    sameConfig[unitName] = hasSameWeaponConfiguration(getInstances(unitName))
  }
  return sameConfig[unitName]
}

function setSameConfig(unitName: string, value: boolean, instances: UnitInstance[]): void {
  sameConfig[unitName] = value
  if (value && instances.length > 1) {
    const first = instances[0]
    for (let i = 1; i < instances.length; i++) {
      for (const sel of first.weaponSelections) {
        emit('weapon-change', props.upgrade.upgradeName, unitName, i, sel.slotIndex, sel.chosenWeaponName)
      }
    }
  }
}
</script>

<template>
  <div class="applied-upgrade-content">
    <UnitPanel
      v-if="upgrade.type === 'replace' && replaceUpgrade"
      :name="`${fromUnitName} → ${replaceUpgrade.replacingUnits.unitName}`"
      :min="0"
      :max="replaceMax"
      :has-same-config-option="replaceUpgrade.replacingUnits.instances.length > 1 && hasChoices(replaceUpgrade.replacingUnits.unitName)"
      :unit-amount="replaceUpgrade.replacedCount"
      :same-config="getSameConfig(replaceUpgrade.replacingUnits.unitName)"
      :cost="replaceCostPerUnit"
      :cost-sign="true"
      @update:unit-amount="(val) => emit('replace-count-change', val)"
      @update:same-config="(val) => setSameConfig(replaceUpgrade!.replacingUnits.unitName, val, replaceUpgrade!.replacingUnits.instances)"
    >
      <template v-if="replaceUpgrade.replacedCount > 0 && hasChoices(replaceUpgrade.replacingUnits.unitName)">
        <template v-if="getSameConfig(replaceUpgrade.replacingUnits.unitName) && replaceUpgrade.replacingUnits.instances.length > 0">
          <UnitInstanceEditor
            :name="replaceUpgrade.replacingUnits.unitName"
            :weapon-slots="getWeaponSlots(replaceUpgrade.replacingUnits.unitName)"
            :instance="replaceUpgrade.replacingUnits.instances[0]"
            @weapon-change="(slotIdx, weapon) => {
              for (let i = 0; i < replaceUpgrade!.replacingUnits.instances.length; i++) {
                emit('weapon-change', upgrade.upgradeName, replaceUpgrade!.replacingUnits.unitName, i, slotIdx, weapon)
              }
            }"
          />
        </template>
        <template v-else>
          <template v-for="(inst, instIdx) in replaceUpgrade.replacingUnits.instances" :key="instIdx">
            <UnitInstanceEditor
              :name="`${replaceUpgrade.replacingUnits.unitName} ${instIdx + 1}`"
              :weapon-slots="getWeaponSlots(replaceUpgrade.replacingUnits.unitName)"
              :instance="inst"
              @weapon-change="(slotIdx, weapon) => emit('weapon-change', upgrade.upgradeName, replaceUpgrade!.replacingUnits.unitName, instIdx, slotIdx, weapon)"
            />
          </template>
        </template>
      </template>
    </UnitPanel>

    <div v-else-if="upgrade.type === 'character' && characterUpgrade">
      <select
        :value="characterUpgrade.chosenCharacterName ?? ''"
        @change="(event) => {
          const value = (event.target as HTMLSelectElement).value
          emit('update-character', value || null)
        }"
      >
        <option value="">Select character</option>
        <option v-for="option in characterOptions" :key="option.name" :value="option.name">{{ option.label }}</option>
      </select>
    </div>

    <div v-else-if="upgrade.type === 'add'" class="add-section">
      <UnitPanel
        v-for="ute in upgrade.addedUnits"
        :key="ute.unitName"
        :name="ute.unitName"
        :min="0"
        :max="getAddMax(ute.unitName)"
        :has-same-config-option="ute.instances.length > 1 && hasChoices(ute.unitName)"
        :unit-amount="ute.instances.length"
        :same-config="getSameConfig(ute.unitName)"
        :cost="addUnitCost(ute.unitName)"
        @update:unit-amount="(val) => emit('add-count-change', ute.unitName, val)"
        @update:same-config="(val) => setSameConfig(ute.unitName, val, ute.instances)"
      >
        <template v-if="hasChoices(ute.unitName) && ute.instances.length > 0">
          <template v-if="getSameConfig(ute.unitName)">
            <UnitInstanceEditor
              :name="ute.unitName"
              :weapon-slots="getWeaponSlots(ute.unitName)"
              :instance="ute.instances[0]"
              @weapon-change="(slotIdx, weapon) => {
                for (let i = 0; i < ute.instances.length; i++) {
                  emit('weapon-change', upgrade.upgradeName, ute.unitName, i, slotIdx, weapon)
                }
              }"
            />
          </template>
          <template v-else>
            <template v-for="(inst, instIdx) in ute.instances" :key="instIdx">
              <UnitInstanceEditor
                :name="`${ute.unitName} ${instIdx + 1}`"
                :weapon-slots="getWeaponSlots(ute.unitName)"
                :instance="inst"
                @weapon-change="(slotIdx, weapon) => emit('weapon-change', upgrade.upgradeName, ute.unitName, instIdx, slotIdx, weapon)"
              />
            </template>
          </template>
        </template>
      </UnitPanel>
    </div>
  </div>
</template>

<style scoped>
.applied-upgrade-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.add-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
