<script setup lang="ts">
import type { UpgradeDef } from '@/entities/army'

defineProps<{
  upgrades: UpgradeDef[]
}>()

function describeUpgrade(u: UpgradeDef): string {
  if (u.type === 'replace') {
    return `Replace up to ${u.replaces.max} ${u.replaces.fromUnitName} with ${u.replaces.toUnitName}`
  }
  if (u.type === 'character') {
    return `Choose one of: ${u.characterNames.join(', ')}`
  }
  const names = u.adds.map((a) => a.unitName).join(', ')
  if (u.maxTotal !== undefined) {
    return `Add up to ${u.maxTotal} from: ${names}`
  }
  return `Add any of: ${names}`
}
</script>

<template>
  <div class="army-reference-table">
    <table class="army-reference-table__native-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="upgrade in upgrades" :key="upgrade.name">
          <td>{{ upgrade.name }}</td>
          <td>{{ upgrade.type === 'replace' ? 'Replace' : upgrade.type === 'character' ? 'Character' : 'Add' }}</td>
          <td>{{ describeUpgrade(upgrade) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
