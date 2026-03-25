import type { ArmyDef } from './army'
import type { ArmyList, Entry } from './list'
import { deriveFormationUnits } from './composition'
import { calculateGroupPoints } from './points'

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

    for (const restriction of armyDef.restrictions) {
        const groupPoints = calculateGroupPoints(list.entries, restriction.group, armyDef)
        const threshold = list.pointsLimit * (restriction.maxPercentage / 100)
        if (groupPoints > threshold) {
            results.push({
                type: 'warning',
                message: `${restriction.group} detachments cost ${groupPoints}pts — max ${restriction.maxPercentage}% of ${list.pointsLimit}pts (${threshold}pts).`,
            })
        }
    }

    return results
}

// ─── Transport capacity warning ───────────────────────────────────────────────

/**
 * Returns a warning if the transport capacity provided in the entry's add-upgrades
 * is insufficient or excessive for the transportable units in the formation.
 * 
 * Per the new transportation model:
 * - Transportable units have transportation.cost and transportation.type
 * - Transport units have transportation.capacity and transportation.capabilities[]
 * 
 * Warnings are shown if:
 * 1. Total cost is not met by total capacity
 * 2. Total capacity exceeds total cost by the capacity of one transport unit
 */
export function validateTransportCapacity(
    entry: Entry,
    armyDef: ArmyDef,
): ValidationResult | null {
    // Effective formation composition (base units + all applied upgrades)
    const formation = deriveFormationUnits(entry, armyDef)

    // Calculate total cost by transport type for units needing transportation
    const costByType = new Map<string, number>()
    for (const ute of formation) {
        const unitDef = armyDef.units.find((u) => u.name === ute.unitName)
        if (!unitDef?.transportation?.type || unitDef.transportation.cost === undefined) continue

        const type = unitDef.transportation.type
        const cost = unitDef.transportation.cost
        const existing = costByType.get(type) ?? 0
        costByType.set(type, existing + cost * ute.instances.length)
    }

    if (costByType.size === 0) return null

    // Calculate total capacity by transport type and track minimum capacity per type
    // The minimum capacity is used to determine the threshold for excess capacity warnings
    // (if capacity exceeds cost by one transport unit's worth)
    const capacityByType = new Map<string, number>()
    const minCapacityByType = new Map<string, number>()

    for (const ute of formation) {
        const transportDef = armyDef.units.find((u) => u.name === ute.unitName)
        if (!transportDef?.transportation?.capacity || !transportDef.transportation.capabilities) continue

        const capacity = transportDef.transportation.capacity
        const capabilities = transportDef.transportation.capabilities

        // Add capacity for each type this transport can carry
        for (const type of capabilities) {
            const existing = capacityByType.get(type) ?? 0
            capacityByType.set(type, existing + capacity * ute.instances.length)

            // Track minimum capacity for this type
            const currentMin = minCapacityByType.get(type) ?? Infinity
            minCapacityByType.set(type, Math.min(currentMin, capacity))
        }
    }

    // Validate each transport type
    const messages: string[] = []
    for (const [type, cost] of costByType) {
        const capacity = capacityByType.get(type) ?? 0

        // Warning 1: Insufficient capacity
        if (capacity < cost) {
            messages.push(
                `Not enough transport capacity for ${type} units: need ${cost}, have ${capacity}.`,
            )
        }
        // Warning 2: Excess capacity by one or more transport unit's worth
        else {
            // Find the minimum transport capacity that serves this type
            const minTransportCapacity = minCapacityByType.get(type) ?? 0
            if (minTransportCapacity > 0 && capacity >= cost + minTransportCapacity) {
                messages.push(
                    `Excess transport capacity for ${type} units: need ${cost}, have ${capacity}.`,
                )
            }
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
