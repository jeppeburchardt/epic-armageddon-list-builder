import type { ArmyDef } from './army'
import type { ArmyList, Entry } from './list'
import { deriveFormationUnits } from './composition'
import { calculateGroupPoints, calculateListPoints } from './points'

export interface ValidationResult {
    type: 'warning' | 'error'
    entryId?: string
    message: string
}

// ─── Army-level restrictions ──────────────────────────────────────────────────

export function validateArmyRestrictions(
    list: ArmyList,
    armyDef: ArmyDef,
): ValidationResult[] {
    const results: ValidationResult[] = []
    const totalPoints = calculateListPoints(list, armyDef)

    for (const restriction of armyDef.restrictions) {
        if (restriction.type === 'max_group_percentage') {
            const groupPoints = calculateGroupPoints(list.entries, restriction.group, armyDef)
            const threshold = list.pointsLimit * (restriction.maxPercentage / 100)
            if (groupPoints > threshold) {
                results.push({
                    type: 'warning',
                    message: `${restriction.group} detachments cost ${groupPoints}pts — max ${restriction.maxPercentage}% of ${list.pointsLimit}pts (${threshold}pts).`,
                })
            }
            // Also warn if they exceed against actual spent points (secondary check)
            if (totalPoints > 0 && groupPoints / totalPoints > restriction.maxPercentage / 100) {
                // Only add if not already added (threshold check above is the canonical one)
            }
        }
    }

    return results
}

// ─── Transport capacity warning ───────────────────────────────────────────────

/**
 * Returns a warning if the transport capacity provided in the entry's add-upgrades
 * is insufficient or grossly excessive for the number of transportable units in the formation.
 */
export function validateTransportCapacity(
    entry: Entry,
    armyDef: ArmyDef,
): ValidationResult | null {
    // Find transport upgrades in the entry (add-type upgrades with transportWarning)
    const transportUpgrades = entry.appliedUpgrades.filter((upgrade) => {
        if (upgrade.type !== 'add') return false
        const def = armyDef.upgrades.find((u) => u.name === upgrade.upgradeName)
        return def && def.type === 'add' && def.transportWarning
    })

    if (transportUpgrades.length === 0) return null

    // Effective formation composition (excluding transport units themselves)
    const formation = deriveFormationUnits(entry, armyDef)

    // Count units needing transportation by transport type
    const needsByType = new Map<string, number>()
    for (const ute of formation) {
        const unitDef = armyDef.units.find((u) => u.name === ute.unitName)
        if (!unitDef || !unitDef.transportType) continue
        // Skip transport units themselves (they have no transportType that requires boarding)
        const existing = needsByType.get(unitDef.transportType) ?? 0
        needsByType.set(unitDef.transportType, existing + ute.instances.length)
    }

    if (needsByType.size === 0) return null

    // Count capacity provided by transport units in the add upgrades
    const capacityByType = new Map<string, number>()
    for (const upgrade of transportUpgrades) {
        if (upgrade.type !== 'add') continue
        for (const ute of upgrade.addedUnits) {
            const transportDef = armyDef.units.find((u) => u.name === ute.unitName)
            if (!transportDef) continue
            for (const cap of transportDef.transportCapacity) {
                const existing = capacityByType.get(cap.transportType) ?? 0
                capacityByType.set(cap.transportType, existing + cap.count * ute.instances.length)
            }
        }
    }

    const messages: string[] = []
    for (const [transportType, needed] of needsByType) {
        const available = capacityByType.get(transportType) ?? 0
        if (available < needed) {
            messages.push(
                `Not enough transport capacity for ${transportType} units: need ${needed}, have ${available}.`,
            )
        } else if (available > needed * 2) {
            messages.push(
                `Excess transport capacity for ${transportType} units: need ${needed}, have ${available}.`,
            )
        }
    }

    if (messages.length === 0) return null

    return {
        type: 'warning',
        entryId: entry.id,
        message: messages.join(' '),
    }
}

// ─── Full validation ──────────────────────────────────────────────────────────

export function validateList(list: ArmyList, armyDef: ArmyDef): ValidationResult[] {
    const results: ValidationResult[] = []
    results.push(...validateArmyRestrictions(list, armyDef))
    for (const entry of list.entries) {
        const transportWarning = validateTransportCapacity(entry, armyDef)
        if (transportWarning) results.push(transportWarning)
    }
    return results
}
