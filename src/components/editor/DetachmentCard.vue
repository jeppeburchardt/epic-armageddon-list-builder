<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import PointsBadge from '@/components/shared/PointsBadge.vue'
import BaseUnitsPanel from './BaseUnitsPanel.vue'
import AppliedUpgradePanel from './AppliedUpgradePanel.vue'
import UpgradePickerDialog from './UpgradePickerDialog.vue'
import type { ArmyDef, UpgradeDef } from '@/entities/army'
import type { Entry } from '@/entities/list'
import { calculateEntryPoints } from '@/entities/points'
import { deriveBaseUnits, deriveFormationUnits, deriveUpgradeUnits } from '@/entities/composition'
import { validateTransportCapacity } from '@/entities/validation'
import { useMediaQuery } from '@vueuse/core'

const props = defineProps<{
  entry: Entry
  armyDef: ArmyDef
  detachmentNumber: number
}>()

const emit = defineEmits<{
  remove: []
  'base-count-change': [unitName: string, count: number]
  'weapon-change': [
    source: string,
    unitName: string,
    instanceIndex: number,
    slotIndex: number,
    weapon: string,
  ]
  'add-upgrade': [upgradeDef: UpgradeDef]
  'remove-upgrade': [upgradeName: string]
  'replace-count-change': [upgradeName: string, count: number]
  'add-count-change': [upgradeName: string, unitName: string, count: number]
  'update-character': [upgradeName: string, chosenCharacterName: string | null]
}>()

const isSmallScreen = useMediaQuery('(max-width: 600px)')

const showUpgradePicker = ref(false)
const activePanel = ref<string | undefined>(undefined)

function handleAddUpgrade(upgDef: UpgradeDef) {
  activePanel.value = upgDef.name
  emit('add-upgrade', upgDef)
}

const detachmentDef = computed(() =>
  props.armyDef.detachments.find((d) => d.name === props.entry.detachmentName),
)

const entryPoints = computed(() => calculateEntryPoints(props.entry, props.armyDef))

const transportResult = computed(() => validateTransportCapacity(props.entry, props.armyDef))

const transportWarning = computed(() => transportResult.value?.message ?? null)

const availableUpgradesCount = computed(() => {
  if (!detachmentDef.value) return 0
  const applied = new Set(props.entry.appliedUpgrades.map((u) => u.upgradeName))
  return detachmentDef.value.availableUpgrades.filter((n) => !applied.has(n)).length
})

function isTransportUpgrade(upgradeName: string): boolean {
  const def = props.armyDef.upgrades.find((u) => u.name === upgradeName)
  return def?.type === 'add' && (def.transportWarning ?? false)
}

function toRomanNumeral(value: number): string {
  const numerals: Array<[number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]

  let remaining = Math.max(1, Math.floor(value))
  let roman = ''

  for (const [num, symbol] of numerals) {
    while (remaining >= num) {
      roman += symbol
      remaining -= num
    }
  }

  return roman
}
</script>

<template>
  <Card :class="{ 'warning-card': transportWarning }">
    <template #content>
      <div class="entry">
        <div class="info">
          <div class="primary">
            <h3 class="name">
              <span class="detachment-number-badge">{{ toRomanNumeral(detachmentNumber) }}</span>
              <span>{{ entry.detachmentName }}</span>
            </h3>
            <PointsBadge :used="entryPoints" />
          </div>
          <div class="buttons">
            <Button
              v-if="availableUpgradesCount > 0"
              :label="isSmallScreen ? undefined : 'Add Upgrade'"
              icon="pi pi-plus"
              severity="primary"
              fluid
              @click="showUpgradePicker = true"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              :label="isSmallScreen ? undefined : 'Remove'"
              variant="outlined"
              fluid
              @click="emit('remove')"
            />
          </div>
          <div class="instances">
            <div
              v-for="unit in deriveFormationUnits(entry, armyDef)"
              :key="unit.unitName"
              class="instance"
            >
              <span>
                {{ unit.instances.length }}
                {{ unit.unitName }}
              </span>
            </div>
          </div>
        </div>
        <div class="upgrades">
          <Accordion v-model:value="activePanel">
            <AccordionPanel value="0">
              <AccordionHeader>
                <span>
                  Base units
                  <Tag
                    v-for="unit in deriveBaseUnits(entry)"
                    :key="unit.unitName"
                    severity="secondary"
                  >
                    {{ unit.instances.length }}x{{ unit.unitName }}
                  </Tag>
                </span>
              </AccordionHeader>
              <AccordionContent>
                <BaseUnitsPanel
                  :base-units="entry.baseUnits"
                  :detachment-name="entry.detachmentName"
                  :army-def="armyDef"
                  @count-change="(unitName, count) => emit('base-count-change', unitName, count)"
                  @weapon-change="
                    (unitName, instIdx, slotIdx, weapon) =>
                      emit('weapon-change', 'base', unitName, instIdx, slotIdx, weapon)
                  "
                />
              </AccordionContent>
            </AccordionPanel>
            <AccordionPanel
              v-for="upgrade in entry.appliedUpgrades"
              :key="upgrade.upgradeName"
              :value="upgrade.upgradeName"
            >
              <AccordionHeader>
                <span class="tag-list">
                  <span
                    :class="{
                      warning: isTransportUpgrade(upgrade.upgradeName) && !!transportWarning,
                    }"
                  >
                    {{ upgrade.upgradeName }}
                  </span>
                  <Tag
                    v-for="unit in deriveUpgradeUnits(upgrade)"
                    :key="unit.unitName"
                    severity="secondary"
                  >
                    {{ unit.instances.length }}x{{ unit.unitName }}
                  </Tag>
                </span>
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  text
                  size="small"
                  rounded
                  aria-label="Remove upgrade"
                  @click="emit('remove-upgrade', upgrade.upgradeName)"
                />
              </AccordionHeader>
              <AccordionContent>
                <AppliedUpgradePanel
                  :upgrade="upgrade"
                  :army-def="armyDef"
                  @remove="emit('remove-upgrade', upgrade.upgradeName)"
                  @replace-count-change="
                    (count) => emit('replace-count-change', upgrade.upgradeName, count)
                  "
                  @add-count-change="
                    (unitName, count) =>
                      emit('add-count-change', upgrade.upgradeName, unitName, count)
                  "
                  @weapon-change="
                    (_upgName, unitName, instIdx, slotIdx, weapon) =>
                      emit('weapon-change', upgrade.upgradeName, unitName, instIdx, slotIdx, weapon)
                  "
                  @update-character="
                    (charName) => emit('update-character', upgrade.upgradeName, charName)
                  "
                />
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
          <Message
            v-if="transportResult"
            :severity="transportResult.type === 'error' ? 'error' : 'warn'"
            class="transport-warning"
          >
            {{ transportResult.message }}
          </Message>
        </div>
      </div>
    </template>
    <template #footer> </template>
  </Card>

  <UpgradePickerDialog
    v-model:visible="showUpgradePicker"
    :detachment-name="entry.detachmentName"
    :army-def="armyDef"
    :applied-upgrade-names="entry.appliedUpgrades.map((u) => u.upgradeName)"
    @add="handleAddUpgrade"
  />
</template>

<style scoped>
.entry {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
}
.warning {
  color: var(--p-message-warn-color);
}
.warning-card {
  outline: 1px solid var(--p-message-warn-outlined-color);
}
.info {
  width: 220px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 0.5rem;
}
.buttons {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}
.instances {
  flex: 1 2 auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 600px) {
  .entry {
    flex-direction: column;
  }
  .info {
    width: auto;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .primary {
    flex: 1 2 auto;
  }
  .buttons {
    flex-direction: row;
  }
  .instances {
    width: 100%;
    flex-direction: row;
  }
}

.name {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detachment-number-badge {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  background: #000;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Times New Roman', Times, serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  flex-shrink: 0;
}

.upgrades {
  flex: 1 2 auto;
}

.transport-warning {
  margin-top: 0.75rem;
}

.tag-list {
  gap: 0.5rem;
  display: flex;
  align-items: center;
  flex: 1 2 auto;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.det-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-tag {
  font-size: 0.7rem;
  flex-shrink: 0;
}
</style>
