// ─── Weapon selection within a unit instance ─────────────────────────────────

/**
 * Records the user's choice for a single "choice" weapon slot.
 * slotIndex refers to the index in UnitDef.weaponSlots.
 */
export interface WeaponSelection {
    slotIndex: number
    chosenWeaponName: string
}

// ─── Unit instance ────────────────────────────────────────────────────────────

/**
 * A single physical model in a formation.
 * Only contains weapon selections for the choice slots on its UnitDef.
 * Units without any choice slots will always have an empty array.
 */
export interface UnitInstance {
    weaponSelections: WeaponSelection[]
}

// ─── Unit type entry ─────────────────────────────────────────────────────────

/**
 * A group of same-type unit instances within an entry or upgrade.
 * instances.length is the effective count of that unit type in the grouping.
 */
export interface UnitTypeEntry {
    unitName: string
    instances: UnitInstance[]
}

// ─── Applied upgrade ─────────────────────────────────────────────────────────

export type AppliedUpgrade =
    | {
        type: 'add'
        upgradeName: string
        /** One UnitTypeEntry per AddSpec.unitName; instances.length = user-chosen count */
        addedUnits: UnitTypeEntry[]
    }
    | {
        type: 'replace'
        upgradeName: string
        /**
         * How many base units have been replaced.
         * Maps fromUnitName (implicit from UpgradeDef) to count replaced.
         */
        replacedCount: number
        /** The instances of the replacement unit */
        replacingUnits: UnitTypeEntry
    }
    | {
        type: 'character'
        upgradeName: string
        /** The chosen character unit name, or null if not yet selected */
        chosenCharacterName: string | null
    }

// ─── Entry (detachment instance) ─────────────────────────────────────────────

/**
 * A single detachment instance within an army list.
 * baseUnits reflects the mandatory starting units (at the chosen count for
 * variable-count detachments). Applied upgrades layer on top.
 */
export interface Entry {
    id: string
    detachmentName: string
    baseUnits: UnitTypeEntry[]
    appliedUpgrades: AppliedUpgrade[]
}

// ─── Army list ────────────────────────────────────────────────────────────────

export interface ArmyList {
    id: string
    name: string
    pointsLimit: number
    armySlug: string
    entries: Entry[]
}
