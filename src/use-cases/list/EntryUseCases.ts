import { v4 as uuidv4 } from 'uuid'
import type { ArmyDef, AddSpec, UpgradeDef } from '@/entities/army'
import type {
    ArmyList,
    Entry,
    UnitTypeEntry,
    UnitInstance,
    AppliedUpgrade,
    WeaponSelection,
} from '@/entities/list'
import type { ListRepository } from '@/ports/ListRepository'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultInstance(unitName: string, armyDef: ArmyDef): UnitInstance {
    const unitDef = armyDef.units.find((u) => u.name === unitName)
    if (!unitDef) return { weaponSelections: [] }

    const weaponSelections: WeaponSelection[] = []
    unitDef.weaponSlots.forEach((slot, idx) => {
        if (slot.kind === 'choice' && slot.choices.length > 0) {
            weaponSelections.push({
                slotIndex: idx,
                chosenWeaponName: slot.choices[0].weaponName,
            })
        }
    })
    return { weaponSelections }
}

function makeInstances(unitName: string, count: number, armyDef: ArmyDef): UnitInstance[] {
    return Array.from({ length: count }, () => defaultInstance(unitName, armyDef))
}

function getListOrThrow(repo: ListRepository, listId: string): ArmyList {
    const list = repo.getById(listId)
    if (!list) throw new Error(`List not found: ${listId}`)
    return list
}

function mutateList(
    repo: ListRepository,
    listId: string,
    mutate: (list: ArmyList) => ArmyList,
): ArmyList {
    const list = getListOrThrow(repo, listId)
    const updated = mutate(list)
    repo.save(updated)
    return updated
}

// ─── Entry creation from detachment ──────────────────────────────────────────

export function addEntry(
    repo: ListRepository,
    listId: string,
    detachmentName: string,
    armyDef: ArmyDef,
): ArmyList {
    const detDef = armyDef.detachments.find((d) => d.name === detachmentName)
    if (!detDef) throw new Error(`Detachment not found: ${detachmentName}`)

    const baseUnits: UnitTypeEntry[] = detDef.units.map((uc) => {
        const count = 'count' in uc ? uc.count : uc.min
        return {
            unitName: uc.unitName,
            instances: makeInstances(uc.unitName, count, armyDef),
        }
    })

    const entry: Entry = {
        id: uuidv4(),
        detachmentName,
        baseUnits,
        appliedUpgrades: [],
    }

    return mutateList(repo, listId, (list) => ({
        ...list,
        entries: [...list.entries, entry],
    }))
}

export function removeEntry(
    repo: ListRepository,
    listId: string,
    entryId: string,
): ArmyList {
    return mutateList(repo, listId, (list) => ({
        ...list,
        entries: list.entries.filter((e) => e.id !== entryId),
    }))
}

// ─── Base unit count (for variable-count detachments) ────────────────────────

export function updateBaseUnitCount(
    repo: ListRepository,
    listId: string,
    entryId: string,
    unitName: string,
    newCount: number,
    armyDef: ArmyDef,
): ArmyList {
    return mutateList(repo, listId, (list) => ({
        ...list,
        entries: list.entries.map((entry) => {
            if (entry.id !== entryId) return entry
            return {
                ...entry,
                baseUnits: entry.baseUnits.map((ute) => {
                    if (ute.unitName !== unitName) return ute
                    const currentCount = ute.instances.length
                    if (newCount === currentCount) return ute
                    if (newCount > currentCount) {
                        const extra = makeInstances(unitName, newCount - currentCount, armyDef)
                        return { ...ute, instances: [...ute.instances, ...extra] }
                    }
                    return { ...ute, instances: ute.instances.slice(0, newCount) }
                }),
            }
        }),
    }))
}

// ─── Upgrades ─────────────────────────────────────────────────────────────────

export interface AddUpgradeQuantities {
    /** unitName → count to add */
    counts: Record<string, number>
}

export function applyUpgrade(
    repo: ListRepository,
    listId: string,
    entryId: string,
    upgradeDef: UpgradeDef,
    armyDef: ArmyDef,
    quantities?: AddUpgradeQuantities,
): ArmyList {
    return mutateList(repo, listId, (list) => ({
        ...list,
        entries: list.entries.map((entry) => {
            if (entry.id !== entryId) return entry

            // Remove existing upgrade with same name if already applied
            const existingFiltered = entry.appliedUpgrades.filter(
                (u) => u.upgradeName !== upgradeDef.name,
            )

            let newUpgrade: AppliedUpgrade

            if (upgradeDef.type === 'replace') {
                newUpgrade = {
                    type: 'replace',
                    upgradeName: upgradeDef.name,
                    replacedCount: 0,
                    replacingUnits: {
                        unitName: upgradeDef.replaces.toUnitName,
                        instances: [],
                    },
                }
            } else if (upgradeDef.type === 'character') {
                newUpgrade = {
                    type: 'character',
                    upgradeName: upgradeDef.name,
                    chosenCharacterName: null,
                }
            } else {
                const addedUnits: UnitTypeEntry[] = upgradeDef.adds.map((addSpec: AddSpec) => {
                    const count = quantities?.counts[addSpec.unitName] ?? addSpec.min
                    return {
                        unitName: addSpec.unitName,
                        instances: makeInstances(addSpec.unitName, count, armyDef),
                    }
                })
                newUpgrade = {
                    type: 'add',
                    upgradeName: upgradeDef.name,
                    addedUnits,
                }
            }

            return {
                ...entry,
                appliedUpgrades: [...existingFiltered, newUpgrade],
            }
        }),
    }))
}

export function removeUpgrade(
    repo: ListRepository,
    listId: string,
    entryId: string,
    upgradeName: string,
): ArmyList {
    return mutateList(repo, listId, (list) => ({
        ...list,
        entries: list.entries.map((entry) => {
            if (entry.id !== entryId) return entry
            return {
                ...entry,
                appliedUpgrades: entry.appliedUpgrades.filter((u) => u.upgradeName !== upgradeName),
            }
        }),
    }))
}

// ─── Replace upgrade count ────────────────────────────────────────────────────

export function updateReplaceUpgradeCount(
    repo: ListRepository,
    listId: string,
    entryId: string,
    upgradeName: string,
    newCount: number,
    armyDef: ArmyDef,
): ArmyList {
    return mutateList(repo, listId, (list) => ({
        ...list,
        entries: list.entries.map((entry) => {
            if (entry.id !== entryId) return entry
            return {
                ...entry,
                appliedUpgrades: entry.appliedUpgrades.map((upgrade) => {
                    if (upgrade.upgradeName !== upgradeName || upgrade.type !== 'replace') return upgrade
                    const upgradeDef = armyDef.upgrades.find((u) => u.name === upgradeName)
                    if (!upgradeDef || upgradeDef.type !== 'replace') return upgrade

                    const toUnitName = upgradeDef.replaces.toUnitName
                    const currentCount = upgrade.replacingUnits.instances.length
                    let newInstances = upgrade.replacingUnits.instances
                    if (newCount > currentCount) {
                        const extra = makeInstances(toUnitName, newCount - currentCount, armyDef)
                        newInstances = [...newInstances, ...extra]
                    } else {
                        newInstances = newInstances.slice(0, newCount)
                    }

                    return {
                        ...upgrade,
                        replacedCount: newCount,
                        replacingUnits: { unitName: toUnitName, instances: newInstances },
                    }
                }),
            }
        }),
    }))
}

// ─── Add upgrade unit count ───────────────────────────────────────────────────

export function updateAddUpgradeUnitCount(
    repo: ListRepository,
    listId: string,
    entryId: string,
    upgradeName: string,
    unitName: string,
    newCount: number,
    armyDef: ArmyDef,
): ArmyList {
    return mutateList(repo, listId, (list) => ({
        ...list,
        entries: list.entries.map((entry) => {
            if (entry.id !== entryId) return entry
            return {
                ...entry,
                appliedUpgrades: entry.appliedUpgrades.map((upgrade) => {
                    if (upgrade.upgradeName !== upgradeName || upgrade.type !== 'add') return upgrade

                    // Enforce maxTotal: clamp newCount so the total across all AddSpecs stays within maxTotal
                    const upgradeDef = armyDef.upgrades.find((u) => u.name === upgradeName)
                    let clampedCount = newCount
                    if (upgradeDef && upgradeDef.type === 'add' && upgradeDef.maxTotal !== undefined) {
                        const addSpec = upgradeDef.adds.find((a) => a.unitName === unitName)
                        const otherUnitsTotal = upgrade.addedUnits
                            .filter((u) => u.unitName !== unitName)
                            .reduce((sum, u) => sum + u.instances.length, 0)
                        const remaining = Math.max(0, upgradeDef.maxTotal - otherUnitsTotal)
                        const specMax = addSpec?.max ?? upgradeDef.maxTotal
                        clampedCount = Math.min(newCount, remaining, specMax)
                        clampedCount = Math.max(clampedCount, addSpec?.min ?? 0)
                    }

                    return {
                        ...upgrade,
                        addedUnits: upgrade.addedUnits.map((ute) => {
                            if (ute.unitName !== unitName) return ute
                            const currentCount = ute.instances.length
                            if (clampedCount === currentCount) return ute
                            if (clampedCount > currentCount) {
                                const extra = makeInstances(unitName, clampedCount - currentCount, armyDef)
                                return { ...ute, instances: [...ute.instances, ...extra] }
                            }
                            return { ...ute, instances: ute.instances.slice(0, clampedCount) }
                        }),
                    }
                }),
            }
        }),
    }))
}

// ─── Character upgrade ────────────────────────────────────────────────────────

export function updateCharacterUpgrade(
    repo: ListRepository,
    listId: string,
    entryId: string,
    upgradeName: string,
    chosenCharacterName: string | null,
): ArmyList {
    return mutateList(repo, listId, (list) => ({
        ...list,
        entries: list.entries.map((entry) => {
            if (entry.id !== entryId) return entry
            return {
                ...entry,
                appliedUpgrades: entry.appliedUpgrades.map((upgrade) => {
                    if (upgrade.upgradeName !== upgradeName || upgrade.type !== 'character') return upgrade
                    return { ...upgrade, chosenCharacterName }
                }),
            }
        }),
    }))
}

// ─── Weapon selections ────────────────────────────────────────────────────────

export type WeaponSelectionSource = 'base' | string // 'base' or upgradeName

export function updateUnitWeaponSelection(
    repo: ListRepository,
    listId: string,
    entryId: string,
    source: WeaponSelectionSource,
    unitName: string,
    instanceIndex: number,
    slotIndex: number,
    chosenWeaponName: string,
): ArmyList {
    function updateInstances(instances: UnitInstance[]): UnitInstance[] {
        return instances.map((inst, idx) => {
            if (idx !== instanceIndex) return inst
            const filtered = inst.weaponSelections.filter((s) => s.slotIndex !== slotIndex)
            return {
                ...inst,
                weaponSelections: [...filtered, { slotIndex, chosenWeaponName }],
            }
        })
    }

    function updateUTEList(utes: UnitTypeEntry[]): UnitTypeEntry[] {
        return utes.map((ute) => {
            if (ute.unitName !== unitName) return ute
            return { ...ute, instances: updateInstances(ute.instances) }
        })
    }

    return mutateList(repo, listId, (list) => ({
        ...list,
        entries: list.entries.map((entry) => {
            if (entry.id !== entryId) return entry

            if (source === 'base') {
                return { ...entry, baseUnits: updateUTEList(entry.baseUnits) }
            }

            return {
                ...entry,
                appliedUpgrades: entry.appliedUpgrades.map((upgrade) => {
                    if (upgrade.upgradeName !== source) return upgrade
                    if (upgrade.type === 'add') {
                        return { ...upgrade, addedUnits: updateUTEList(upgrade.addedUnits) }
                    }
                    if (upgrade.type === 'replace') {
                        const ute = upgrade.replacingUnits
                        if (ute.unitName !== unitName) return upgrade
                        return {
                            ...upgrade,
                            replacingUnits: { ...ute, instances: updateInstances(ute.instances) },
                        }
                    }
                    return upgrade
                }),
            }
        }),
    }))
}
