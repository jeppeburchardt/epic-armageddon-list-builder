import type { ArmyDef, DetachmentDef, UnitDef, UpgradeDef, WeaponSlot } from './army'
import type { AppliedUpgrade, ArmyList, Entry, UnitInstance, UnitTypeEntry } from './list'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findUnitDef(armyDef: ArmyDef, unitName: string): UnitDef | undefined {
    return armyDef.units.find((u) => u.name === unitName)
}

/**
 * Returns the extra cost from weapon selections on a single unit instance.
 * Choice slots where the selection is missing default to the first option (0 extra cost).
 */
export function unitInstanceExtraCost(instance: UnitInstance, weaponSlots: WeaponSlot[]): number {
    let extra = 0
    for (const slot of weaponSlots) {
        if (slot.kind !== 'choice') continue
        const sel = instance.weaponSelections.find(
            (s) => s.slotIndex === weaponSlots.indexOf(slot),
        )
        if (!sel) continue
        const option = slot.choices.find((c) => c.weaponName === sel.chosenWeaponName)
        extra += option?.additionalCost ?? 0
    }
    return extra
}

/** Returns the total cost for all instances of a given unit type entry */
function unitTypeEntryCost(ute: UnitTypeEntry, armyDef: ArmyDef): number {
    const def = findUnitDef(armyDef, ute.unitName)
    if (!def) return 0
    return ute.instances.reduce(
        (sum, inst) => sum + def.cost + unitInstanceExtraCost(inst, def.weaponSlots),
        0,
    )
}

// ─── Entry-level cost ─────────────────────────────────────────────────────────

export function calculateEntryPoints(entry: Entry, armyDef: ArmyDef): number {
    let total = 0

    // Base units — subtract replaced units for replace upgrades later
    const baseUnitCostMap = new Map<string, number>()
    for (const ute of entry.baseUnits) {
        const cost = unitTypeEntryCost(ute, armyDef)
        total += cost
        baseUnitCostMap.set(ute.unitName, cost / (ute.instances.length || 1))
    }

    for (const upgrade of entry.appliedUpgrades) {
        if (upgrade.type === 'replace') {
            // Find the upgrade def to know fromUnitName
            const upgradeDef = armyDef.upgrades.find((u) => u.name === upgrade.upgradeName)
            if (upgradeDef && upgradeDef.type === 'replace') {
                const fromUnitDef = findUnitDef(armyDef, upgradeDef.replaces.fromUnitName)
                if (fromUnitDef) {
                    // Subtract the cost of replaced base units
                    total -= fromUnitDef.cost * upgrade.replacedCount
                }
                // Add the replacement units' cost
                total += unitTypeEntryCost(upgrade.replacingUnits, armyDef)
            }
        } else if (upgrade.type === 'character') {
            // 'character' upgrade: add character cost (no base unit consumed)
            if (upgrade.chosenCharacterName) {
                const charDef = findUnitDef(armyDef, upgrade.chosenCharacterName)
                if (charDef) total += charDef.cost
            }
        } else {
            // 'add' upgrade: add cost of all added unit type entries
            for (const ute of upgrade.addedUnits) {
                total += unitTypeEntryCost(ute, armyDef)
            }
        }
    }

    return total
}

// ─── Upgrade-level cost ──────────────────────────────────────────────────────

/**
 * Returns the minimum points cost for an upgrade definition,
 * representing the cheapest single-unit application of the upgrade:
 * - 'add': cost of a single unit of the cheapest addable unit type
 * - 'replace': net cost delta per single replacement (toUnitCost − fromUnitCost)
 * - 'character': cost of the cheapest available character
 * Returns 0 if the relevant unit definitions cannot be found.
 */
export function upgradeMinCost(upgradeDef: UpgradeDef, armyDef: ArmyDef): number {
    if (upgradeDef.type === 'replace') {
        const fromDef = findUnitDef(armyDef, upgradeDef.replaces.fromUnitName)
        const toDef = findUnitDef(armyDef, upgradeDef.replaces.toUnitName)
        if (!fromDef || !toDef) return 0
        return toDef.cost - fromDef.cost
    }
    if (upgradeDef.type === 'character') {
        const costs = upgradeDef.characterNames
            .map((name) => findUnitDef(armyDef, name)?.cost)
            .filter((c): c is number => c !== undefined)
        return costs.length > 0 ? Math.min(...costs) : 0
    }
    // 'add' type: cheapest single unit across all add specs
    const costs = upgradeDef.adds
        .map((a) => findUnitDef(armyDef, a.unitName)?.cost)
        .filter((c): c is number => c !== undefined)
    return costs.length > 0 ? Math.min(...costs) : 0
}

/**
 * Returns the actual points cost contributed by a single applied upgrade.
 * - 'add': sum of costs for all added unit instances
 * - 'replace': cost of replacing units minus the cost of the removed base units
 * - 'character': cost of the chosen character (0 if no character selected yet)
 */
export function calculateAppliedUpgradePoints(upgrade: AppliedUpgrade, armyDef: ArmyDef): number {
    if (upgrade.type === 'replace') {
        const upgradeDef = armyDef.upgrades.find((u) => u.name === upgrade.upgradeName)
        if (!upgradeDef || upgradeDef.type !== 'replace') return 0
        const fromUnitDef = findUnitDef(armyDef, upgradeDef.replaces.fromUnitName)
        if (!fromUnitDef) return 0
        return (
            unitTypeEntryCost(upgrade.replacingUnits, armyDef) -
            fromUnitDef.cost * upgrade.replacedCount
        )
    }
    if (upgrade.type === 'character') {
        if (!upgrade.chosenCharacterName) return 0
        const charDef = findUnitDef(armyDef, upgrade.chosenCharacterName)
        return charDef?.cost ?? 0
    }
    // 'add' type
    return upgrade.addedUnits.reduce((sum, ute) => sum + unitTypeEntryCost(ute, armyDef), 0)
}

// ─── Detachment-level cost ────────────────────────────────────────────────────

/**
 * Returns the minimum points cost to field a detachment: the cost of its
 * mandatory base units at their minimum count (fixed `count`, or `min` for
 * variable-count units), with all choice weapon slots defaulted to their
 * cheapest (0 additional cost) option.
 */
export function detachmentMinCost(detachmentDef: DetachmentDef, armyDef: ArmyDef): number {
    return detachmentDef.units.reduce((sum, uc) => {
        const def = findUnitDef(armyDef, uc.unitName)
        if (!def) return sum
        const minCount = uc.count ?? uc.min ?? 0
        return sum + def.cost * minCount
    }, 0)
}

// ─── List-level cost ─────────────────────────────────────────────────────────

export function calculateGroupPoints(
    entries: Entry[],
    group: string,
    armyDef: ArmyDef,
): number {
    return entries
        .filter((e) => {
            const det = armyDef.detachments.find((d) => d.name === e.detachmentName)
            return det?.group === group
        })
        .reduce((sum, e) => sum + calculateEntryPoints(e, armyDef), 0)
}

export function calculateListPoints(list: ArmyList, armyDef: ArmyDef): number {
    return list.entries.reduce((sum, e) => sum + calculateEntryPoints(e, armyDef), 0)
}
