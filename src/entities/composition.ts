import type { ArmyDef } from './army'
import type { AppliedUpgrade, Entry, UnitTypeEntry } from './list'

/**
 * Derives the effective unit composition of a detachment entry by
 * layering replace and add upgrades on top of the base units.
 *
 * Returns a new array of UnitTypeEntry; same unitName entries are merged.
 */
export function deriveFormationUnits(entry: Entry, armyDef: ArmyDef): UnitTypeEntry[] {
    // Start with a mutable copy of base units
    const result = new Map<string, UnitTypeEntry>()

    for (const ute of entry.baseUnits) {
        result.set(ute.unitName, { unitName: ute.unitName, instances: [...ute.instances] })
    }

    for (const upgrade of entry.appliedUpgrades) {
        if (upgrade.type === 'replace') {
            const upgradeDef = armyDef.upgrades.find((u) => u.name === upgrade.upgradeName)
            if (upgradeDef && upgradeDef.type === 'replace') {
                const fromName = upgradeDef.replaces.fromUnitName
                const existing = result.get(fromName)
                if (existing) {
                    // Remove replaced instances from the end
                    const newInstances = existing.instances.slice(0, existing.instances.length - upgrade.replacedCount)
                    if (newInstances.length === 0) {
                        result.delete(fromName)
                    } else {
                        result.set(fromName, { ...existing, instances: newInstances })
                    }
                }
                // Add replacing units
                const toName = upgrade.replacingUnits.unitName
                const existingTo = result.get(toName)
                if (existingTo) {
                    result.set(toName, { ...existingTo, instances: [...existingTo.instances, ...upgrade.replacingUnits.instances] })
                } else {
                    result.set(toName, { ...upgrade.replacingUnits, instances: [...upgrade.replacingUnits.instances] })
                }
            }
        } else if (upgrade.type === 'character') {
            // 'character' upgrade: add the character as an extra unit (no base unit consumed)
            if (upgrade.chosenCharacterName) {
                const charEntry = result.get(upgrade.chosenCharacterName)
                if (charEntry) {
                    result.set(upgrade.chosenCharacterName, { ...charEntry, instances: [...charEntry.instances, { weaponSelections: [] }] })
                } else {
                    result.set(upgrade.chosenCharacterName, { unitName: upgrade.chosenCharacterName, instances: [{ weaponSelections: [] }] })
                }
            }
        } else {
            // 'add' upgrade: append each added unit type
            for (const ute of upgrade.addedUnits) {
                const existing = result.get(ute.unitName)
                if (existing) {
                    result.set(ute.unitName, { ...existing, instances: [...existing.instances, ...ute.instances] })
                } else {
                    result.set(ute.unitName, { ...ute, instances: [...ute.instances] })
                }
            }
        }
    }

    return Array.from(result.values())
}

/**
 * Returns the base units of an entry, filtered to those with at least one instance.
 */
export function deriveBaseUnits(entry: Entry): UnitTypeEntry[] {
    return entry.baseUnits.filter((u) => u.instances.length > 0)
}

/**
 * Returns the units contributed by a single applied upgrade,
 * normalised to UnitTypeEntry[].
 *
 * - 'add'       → the added units
 * - 'replace'   → the replacing units (wrapped in an array)
 * - 'character' → the chosen character as a single-instance entry, or [] if
 *                 no character has been selected yet
 */
export function deriveUpgradeUnits(upgrade: AppliedUpgrade): UnitTypeEntry[] {
    let unitTypeEntries: UnitTypeEntry[] = [];
    if (upgrade.type === 'add') {
        unitTypeEntries = upgrade.addedUnits
    } else if (upgrade.type === 'replace') {
        unitTypeEntries = [upgrade.replacingUnits]
    } else {
        if (upgrade.chosenCharacterName) {
            unitTypeEntries = [{ unitName: upgrade.chosenCharacterName, instances: [{ weaponSelections: [] }] }]
        }
    }
    return unitTypeEntries.filter(u => u.instances.length > 0)
}
