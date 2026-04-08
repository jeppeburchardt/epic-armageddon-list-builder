<script setup lang="ts">
import { computed, reactive } from 'vue'
import Select from 'primevue/select'
import UnitInstanceEditor from './UnitInstanceEditor.vue'
import UnitPanel from './UnitPanel.vue'
import type { ArmyDef } from '@/entities/army'
import type { AppliedUpgrade, UnitInstance } from '@/entities/list'

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

/** Narrows the prop to the replace variant for use in templates */
const replaceUpgrade = computed(() => (props.upgrade.type === 'replace' ? props.upgrade : null))

/** Narrows the prop to the character variant for use in templates */
const characterUpgrade = computed(() => (props.upgrade.type === 'character' ? props.upgrade : null))

/** Narrows the upgradeDef to the character variant */
const characterUpgradeDef = computed(() => {
  const def = upgradeDef.value
  return def?.type === 'character' ? def : null
})

const upgradeDef = computed(() =>
  props.armyDef.upgrades.find((u) => u.name === props.upgrade.upgradeName),
)

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAddMin(_unitName: string): number {
  return 0
}

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

// ─── Same-config toggle ───────────────────────────────────────────────────────

const sameConfig = reactive<Record<string, boolean>>({})

function getSameConfig(unitName: string): boolean {
  if (!(unitName in sameConfig)) sameConfig[unitName] = true
  return sameConfig[unitName]
}

function setSameConfig(
  unitName: string,
  value: boolean,
  instances: UnitInstance[],
  upgradeName: string,
): void {
  sameConfig[unitName] = value
  if (value && instances.length > 1) {
    const first = instances[0]
    for (let i = 1; i < instances.length; i++) {
      for (const sel of first.weaponSelections) {
        emit('weapon-change', upgradeName, unitName, i, sel.slotIndex, sel.chosenWeaponName)
      }
    }
  }
}
</script>

<template>
  <!-- Replace upgrade -->
  <UnitPanel
    v-if="upgrade.type === 'replace' && replaceUpgrade"
    :name="`${fromUnitName} → ${replaceUpgrade.replacingUnits.unitName}`"
    :min="0"
    :max="replaceMax"
    :has-same-config-option="
      replaceUpgrade.replacingUnits.instances.length > 1 &&
      hasChoices(replaceUpgrade.replacingUnits.unitName)
    "
    :unit-amount="replaceUpgrade.replacedCount"
    :same-config="getSameConfig(replaceUpgrade.replacingUnits.unitName)"
    @update:unit-amount="(val: number | null) => val !== null && emit('replace-count-change', val)"
    @update:same-config="
      (val: boolean) =>
        setSameConfig(
          replaceUpgrade!.replacingUnits.unitName,
          val,
          replaceUpgrade!.replacingUnits.instances,
          upgrade.upgradeName,
        )
    "
  >
    <!-- Per-instance weapon editors for replacing units -->
    <template
      v-if="replaceUpgrade.replacedCount > 0 && hasChoices(replaceUpgrade.replacingUnits.unitName)"
    >
      <template
        v-if="
          getSameConfig(replaceUpgrade.replacingUnits.unitName) &&
          replaceUpgrade.replacingUnits.instances.length > 0
        "
      >
        <UnitInstanceEditor
          :name="replaceUpgrade.replacingUnits.unitName"
          :weapon-slots="getWeaponSlots(replaceUpgrade.replacingUnits.unitName)"
          :instance="replaceUpgrade.replacingUnits.instances[0]"
          @weapon-change="
            (slotIdx, weapon) => {
              for (let i = 0; i < replaceUpgrade!.replacingUnits.instances.length; i++) {
                emit(
                  'weapon-change',
                  upgrade.upgradeName,
                  replaceUpgrade!.replacingUnits.unitName,
                  i,
                  slotIdx,
                  weapon,
                )
              }
            }
          "
        />
      </template>
      <template v-else>
        <template v-for="(inst, instIdx) in replaceUpgrade.replacingUnits.instances" :key="instIdx">
          <UnitInstanceEditor
            :name="`${replaceUpgrade.replacingUnits.unitName} ${instIdx + 1}`"
            :weapon-slots="getWeaponSlots(replaceUpgrade.replacingUnits.unitName)"
            :instance="inst"
            @weapon-change="
              (slotIdx, weapon) =>
                emit(
                  'weapon-change',
                  upgrade.upgradeName,
                  replaceUpgrade!.replacingUnits.unitName,
                  instIdx,
                  slotIdx,
                  weapon,
                )
            "
          />
        </template>
      </template>
    </template>
  </UnitPanel>

  <!-- Character upgrade -->
  <div v-else-if="upgrade.type === 'character' && characterUpgrade">
    <Select
      :model-value="characterUpgrade.chosenCharacterName"
      :options="characterUpgradeDef?.characterNames ?? []"
      @update:model-value="(val: string | null) => emit('update-character', val ?? null)"
    />
  </div>

  <!-- Add upgrade -->
  <div v-else-if="upgrade.type === 'add'" class="add-section">
    <UnitPanel
      v-for="ute in upgrade.addedUnits"
      :key="ute.unitName"
      :name="ute.unitName"
      :min="getAddMin(ute.unitName)"
      :max="getAddMax(ute.unitName)"
      :has-same-config-option="ute.instances.length > 1 && hasChoices(ute.unitName)"
      :unit-amount="ute.instances.length"
      :same-config="getSameConfig(ute.unitName)"
      @update:unit-amount="
        (val: number | null) => {
          console.log('update', val)
          val !== null && emit('add-count-change', ute.unitName, val)
        }
      "
      @update:same-config="
        (val: boolean) => setSameConfig(ute.unitName, val, ute.instances, upgrade.upgradeName)
      "
    >
      <!-- Per-instance weapon editors for added units -->
      <template v-if="hasChoices(ute.unitName) && ute.instances.length > 0">
        <template v-if="getSameConfig(ute.unitName)">
          <UnitInstanceEditor
            :name="ute.unitName"
            :weapon-slots="getWeaponSlots(ute.unitName)"
            :instance="ute.instances[0]"
            @weapon-change="
              (slotIdx, weapon) => {
                for (let i = 0; i < ute.instances.length; i++) {
                  emit('weapon-change', upgrade.upgradeName, ute.unitName, i, slotIdx, weapon)
                }
              }
            "
          />
        </template>
        <template v-else>
          <template v-for="(inst, instIdx) in ute.instances" :key="instIdx">
            <UnitInstanceEditor
              :name="`${ute.unitName} ${instIdx + 1}`"
              :weapon-slots="getWeaponSlots(ute.unitName)"
              :instance="inst"
              @weapon-change="
                (slotIdx, weapon) =>
                  emit('weapon-change', upgrade.upgradeName, ute.unitName, instIdx, slotIdx, weapon)
              "
            />
          </template>
        </template>
      </template>
    </UnitPanel>
  </div>
</template>

<style scoped>
.add-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.applied-upgrade-panel {
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-border);
  border-radius: 0.5rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.upgrade-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upgrade-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.transport-tag {
  align-self: flex-start;
  font-size: 0.75rem;
}

.replace-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.replace-label {
  font-size: 0.875rem;
}

.replace-arrow {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.count-input {
  flex-basis: 140px;
}

.add-unit-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.3rem;
}

.unit-name {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.instances-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0.75rem;
  border-left: 2px solid var(--p-surface-border);
  margin-top: 0.3rem;
}

.sync-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.4rem;
}

.instance-row {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.instance-label {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.add-unit-row {
  display: flex;
  flex-direction: column;
}

.attach-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attach-label {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.attach-select {
  flex: 1;
}
</style>
