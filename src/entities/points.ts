import type { ArmyDef, UnitDef, WeaponSlot } from './army'
import type { ArmyList, Entry, UnitInstance, UnitTypeEntry } from './list'

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
