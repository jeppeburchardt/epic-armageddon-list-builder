<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
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
import { calculateEntryPoints, calculateAppliedUpgradePoints, upgradeMinCost } from '@/entities/points'
import { deriveBaseUnits, deriveFormationUnits, deriveUpgradeUnits } from '@/entities/composition'
import { validateTransportCapacity } from '@/entities/validation'
import { toRomanNumeral } from '@/entities/romanNumerals'
import { useMediaQuery } from '@vueuse/core'

const props = defineProps<{
  entry: Entry
  armyDef: ArmyDef
  isFirst: boolean
  isLast: boolean
  detachmentNumber: number
}>()

const emit = defineEmits<{
  remove: []
  'move-up': []
  'move-down': []
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
const orderMenu = ref()

const orderMenuItems = computed(() => [
  {
    label: 'Move up',
    icon: 'pi pi-arrow-up',
    disabled: props.isFirst,
    command: () => emit('move-up'),
  },
  {
    label: 'Move down',
    icon: 'pi pi-arrow-down',
    disabled: props.isLast,
    command: () => emit('move-down'),
  },
])

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

const availableUpgradeDefs = computed(() => {
  if (!detachmentDef.value) return []
  const applied = new Set(props.entry.appliedUpgrades.map((u) => u.upgradeName))
  return detachmentDef.value.availableUpgrades
    .filter((n) => !applied.has(n))
    .map((n) => props.armyDef.upgrades.find((u) => u.name === n))
    .filter(Boolean) as UpgradeDef[]
})

function isTransportUpgrade(upgradeName: string): boolean {
  const def = props.armyDef.upgrades.find((u) => u.name === upgradeName)
  return def?.type === 'add' && (def.transportWarning ?? false)
}

function upgradeMinCostLabel(upgDef: UpgradeDef): string {
  const cost = upgradeMinCost(upgDef, props.armyDef)
  if (upgDef.type === 'replace') {
    if (cost > 0) return `+${cost}pts`
    if (cost < 0) return `${cost}pts`
    return '0pts'
  }
  return `from ${cost}pts`
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
              icon="pi pi-ellipsis-h"
              severity="secondary"
              variant="outlined"
              aria-label="More options"
              @click="(e) => orderMenu.toggle(e)"
            />
            <Menu ref="orderMenu" :model="orderMenuItems" popup />
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
                <span class="upgrade-points">
                  {{ calculateAppliedUpgradePoints(upgrade, armyDef) }}pts
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
          <div v-if="availableUpgradeDefs.length > 0" class="available-upgrades">
            <div
              v-for="upgDef in availableUpgradeDefs"
              :key="upgDef.name"
              class="available-upgrade"
            >
              <span class="available-upgrade-name">{{ upgDef.name }}</span>
              <span class="available-upgrade-price">{{ upgradeMinCostLabel(upgDef) }}</span>
            </div>
          </div>
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

.upgrade-points {
  font-size: 0.8rem;
  color: var(--p-text-color);
  white-space: nowrap;
  margin-right: 0.25rem;
}

.available-upgrades {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.available-upgrade {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0.75rem;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

.available-upgrade-name {
  font-weight: 500;
}

.available-upgrade-price {
  font-size: 0.8rem;
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
