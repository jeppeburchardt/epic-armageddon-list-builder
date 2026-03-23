<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
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

const props = defineProps<{
  entry: Entry
  armyDef: ArmyDef
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

const transportWarning = computed(() => {
  const result = validateTransportCapacity(props.entry, props.armyDef)
  return result?.message ?? null
})

const availableUpgradesCount = computed(() => {
  if (!detachmentDef.value) return 0
  const applied = new Set(props.entry.appliedUpgrades.map((u) => u.upgradeName))
  return detachmentDef.value.availableUpgrades.filter((n) => !applied.has(n)).length
})

function isTransportUpgrade(upgradeName: string): boolean {
  const def = props.armyDef.upgrades.find((u) => u.name === upgradeName)
  return def?.type === 'add' && (def.transportWarning ?? false)
}
</script>

<template>
  <Card :class="{ warning: transportWarning }">
    <template #content>
      <div class="entry">
        <div class="info">
          <h3 class="name">{{ entry.detachmentName }}</h3>
          <PointsBadge :used="entryPoints" />
          <Button
            v-if="availableUpgradesCount > 0"
            label="Add Upgrade"
            icon="pi pi-plus"
            severity="primary"
            fluid
            @click="showUpgradePicker = true"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            label="Remove"
            variant="outlined"
            fluid
            @click="emit('remove')"
          />
          <div
            v-for="unit in deriveFormationUnits(entry, armyDef)"
            :key="unit.unitName"
            class="instance"
          >
            <span class="amount">
              {{ unit.instances.length }}
            </span>
            <span class="name">
              {{ unit.unitName }}
            </span>
          </div>
        </div>
        <div class="upgrades">
          <Accordion v-model:value="activePanel">
            <AccordionPanel value="0">
              <AccordionHeader
                >Base units
                <Tag
                  v-for="unit in deriveBaseUnits(entry)"
                  :key="unit.unitName"
                  severity="secondary"
                >
                  {{ unit.instances.length }}x{{ unit.unitName }}
                </Tag>
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
              :class="{ warning: isTransportUpgrade(upgrade.upgradeName) && !!transportWarning }"
            >
              <AccordionHeader>
                <span class="tag-list">
                  {{ upgrade.upgradeName }}
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

.info {
  width: 220px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.5rem;
}

.name {
  margin: 0;
}

.upgrades {
  flex: 1 2 auto;
}

.instance {
  /* TODO */
}
.amount {
  /* TODO */
}
.name {
  /* TODO */
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
