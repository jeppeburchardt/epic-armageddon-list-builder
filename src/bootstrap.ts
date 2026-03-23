/**
 * Composition root — the only file that knows about both use cases and infrastructure.
 * Composables import from here; they never import from infrastructure directly.
 */
import { LocalStorageListRepository } from '@/infrastructure/LocalStorageListRepository'
import { StaticJsonArmyLoader } from '@/infrastructure/StaticJsonArmyLoader'
import * as ListUseCases from '@/use-cases/list/ListUseCases'
import * as EntryUseCases from '@/use-cases/list/EntryUseCases'
import * as ArmyUseCases from '@/use-cases/army/ArmyUseCases'

const listRepo = new LocalStorageListRepository()
const armyLoader = new StaticJsonArmyLoader()

export const services = {
    // Lists
    getLists: () => ListUseCases.getLists(listRepo),
    getList: (id: string) => ListUseCases.getList(listRepo, id),
    createList: (input: ListUseCases.CreateListInput) =>
        ListUseCases.createList(listRepo, input),
    updateList: (id: string, input: ListUseCases.UpdateListInput) =>
        ListUseCases.updateList(listRepo, id, input),
    deleteList: (id: string) => { ListUseCases.deleteList(listRepo, id) },

    // Entries
    addEntry: (listId: string, detachmentName: string, armyDef: import('@/entities/army').ArmyDef) =>
        EntryUseCases.addEntry(listRepo, listId, detachmentName, armyDef),
    removeEntry: (listId: string, entryId: string) =>
        EntryUseCases.removeEntry(listRepo, listId, entryId),
    updateBaseUnitCount: (
        listId: string,
        entryId: string,
        unitName: string,
        newCount: number,
        armyDef: import('@/entities/army').ArmyDef,
    ) => EntryUseCases.updateBaseUnitCount(listRepo, listId, entryId, unitName, newCount, armyDef),
    applyUpgrade: (
        listId: string,
        entryId: string,
        upgradeDef: import('@/entities/army').UpgradeDef,
        armyDef: import('@/entities/army').ArmyDef,
        quantities?: EntryUseCases.AddUpgradeQuantities,
    ) => EntryUseCases.applyUpgrade(listRepo, listId, entryId, upgradeDef, armyDef, quantities),
    removeUpgrade: (listId: string, entryId: string, upgradeName: string) =>
        EntryUseCases.removeUpgrade(listRepo, listId, entryId, upgradeName),
    updateReplaceUpgradeCount: (
        listId: string,
        entryId: string,
        upgradeName: string,
        newCount: number,
        armyDef: import('@/entities/army').ArmyDef,
    ) =>
        EntryUseCases.updateReplaceUpgradeCount(
            listRepo,
            listId,
            entryId,
            upgradeName,
            newCount,
            armyDef,
        ),
    updateAddUpgradeUnitCount: (
        listId: string,
        entryId: string,
        upgradeName: string,
        unitName: string,
        newCount: number,
        armyDef: import('@/entities/army').ArmyDef,
    ) =>
        EntryUseCases.updateAddUpgradeUnitCount(
            listRepo,
            listId,
            entryId,
            upgradeName,
            unitName,
            newCount,
            armyDef,
        ),
    updateCharacterUpgrade: (
        listId: string,
        entryId: string,
        upgradeName: string,
        chosenCharacterName: string | null,
    ) =>
        EntryUseCases.updateCharacterUpgrade(
            listRepo,
            listId,
            entryId,
            upgradeName,
            chosenCharacterName,
        ),
    updateUnitWeaponSelection: (
        listId: string,
        entryId: string,
        source: EntryUseCases.WeaponSelectionSource,
        unitName: string,
        instanceIndex: number,
        slotIndex: number,
        chosenWeaponName: string,
    ) =>
        EntryUseCases.updateUnitWeaponSelection(
            listRepo,
            listId,
            entryId,
            source,
            unitName,
            instanceIndex,
            slotIndex,
            chosenWeaponName,
        ),

    // Armies
    getArmies: () => ArmyUseCases.getArmies(armyLoader),
    getArmy: (slug: string) => ArmyUseCases.getArmy(armyLoader, slug),
}
