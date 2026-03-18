import { computed, ref } from 'vue'
import { services } from '@/bootstrap'
import type { ArmyDef, UpgradeDef } from '@/entities/army'
import type { ArmyList } from '@/entities/list'
import { calculateListPoints } from '@/entities/points'
import { validateList } from '@/entities/validation'
import type { AddUpgradeQuantities, WeaponSelectionSource } from '@/use-cases/list/EntryUseCases'

export function useListEditor(listId: string) {
    // Reactive snapshot of the list
    const list = ref<ArmyList | undefined>(services.getList(listId))

    function refresh() {
        list.value = services.getList(listId)
    }

    const armyDef = computed<ArmyDef | undefined>(() => {
        if (!list.value) return undefined
        return services.getArmy(list.value.armySlug)
    })

    const totalPoints = computed<number>(() => {
        if (!list.value || !armyDef.value) return 0
        return calculateListPoints(list.value, armyDef.value)
    })

    const validationResults = computed(() => {
        if (!list.value || !armyDef.value) return []
        return validateList(list.value, armyDef.value)
    })

    // ─── List-level mutations ────────────────────────────────────────────────────

    function updateName(name: string): void {
        services.updateList(listId, { name })
        refresh()
    }

    function updatePointsLimit(pointsLimit: number): void {
        services.updateList(listId, { pointsLimit })
        refresh()
    }

    // ─── Entry mutations ─────────────────────────────────────────────────────────

    function addEntry(detachmentName: string): void {
        if (!armyDef.value) return
        services.addEntry(listId, detachmentName, armyDef.value)
        refresh()
    }

    function removeEntry(entryId: string): void {
        services.removeEntry(listId, entryId)
        refresh()
    }

    function updateBaseUnitCount(entryId: string, unitName: string, count: number): void {
        if (!armyDef.value) return
        services.updateBaseUnitCount(listId, entryId, unitName, count, armyDef.value)
        refresh()
    }

    // ─── Upgrade mutations ───────────────────────────────────────────────────────

    function applyUpgrade(
        entryId: string,
        upgradeDef: UpgradeDef,
        quantities?: AddUpgradeQuantities,
    ): void {
        if (!armyDef.value) return
        services.applyUpgrade(listId, entryId, upgradeDef, armyDef.value, quantities)
        refresh()
    }

    function removeUpgrade(entryId: string, upgradeName: string): void {
        services.removeUpgrade(listId, entryId, upgradeName)
        refresh()
    }

    function updateReplaceUpgradeCount(
        entryId: string,
        upgradeName: string,
        newCount: number,
    ): void {
        if (!armyDef.value) return
        services.updateReplaceUpgradeCount(listId, entryId, upgradeName, newCount, armyDef.value)
        refresh()
    }

    function updateAddUpgradeUnitCount(
        entryId: string,
        upgradeName: string,
        unitName: string,
        newCount: number,
    ): void {
        if (!armyDef.value) return
        services.updateAddUpgradeUnitCount(listId, entryId, upgradeName, unitName, newCount, armyDef.value)
        refresh()
    }

    // ─── Character upgrade ────────────────────────────────────────────────────────

    function updateCharacterUpgrade(
        entryId: string,
        upgradeName: string,
        chosenCharacterName: string | null,
    ): void {
        services.updateCharacterUpgrade(listId, entryId, upgradeName, chosenCharacterName)
        refresh()
    }

    // ─── Weapon selection ────────────────────────────────────────────────────────

    function updateWeaponSelection(
        entryId: string,
        source: WeaponSelectionSource,
        unitName: string,
        instanceIndex: number,
        slotIndex: number,
        chosenWeaponName: string,
    ): void {
        services.updateUnitWeaponSelection(
            listId,
            entryId,
            source,
            unitName,
            instanceIndex,
            slotIndex,
            chosenWeaponName,
        )
        refresh()
    }

    return {
        list,
        armyDef,
        totalPoints,
        validationResults,
        updateName,
        updatePointsLimit,
        addEntry,
        removeEntry,
        updateBaseUnitCount,
        applyUpgrade,
        removeUpgrade,
        updateReplaceUpgradeCount,
        updateAddUpgradeUnitCount,
        updateWeaponSelection,
        updateCharacterUpgrade,
    }
}
