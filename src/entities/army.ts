// ─── Unit types ──────────────────────────────────────────────────────────────

export type UnitType = 'CH' | 'INF' | 'LV' | 'AV' | 'AC' | 'WE' | 'SC' | 'Special'

// ─── Weapons ─────────────────────────────────────────────────────────────────

/** A choosable weapon option within a weapon slot */
export interface WeaponOption {
    weaponName: string
    range: string
    firepower: string
    additionalCost: number
}

/**
 * A weapon slot on a unit.
 * Either a fixed weapon (with its full profile), possibly with a count multiplier,
 * or a set of mutually-exclusive choices each carrying their own profile.
 */
export type WeaponSlot =
    | { kind: 'fixed'; weaponName: string; range: string; firepower: string; count?: number }
    | { kind: 'choice'; name?: string; choices: WeaponOption[] }

// ─── Transport capacity ───────────────────────────────────────────────────────

/**
 * Transport capacity entry: which transport type can ride, and how many.
 * When multiple entries exist they are OR alternatives (e.g. Land Raider
 * carries marines:2 OR terminator:1).
 */
export interface TransportCapacityEntry {
    transportType: string
    count: number
}

// ─── Unit definition ─────────────────────────────────────────────────────────

export interface UnitDef {
    name: string
    cost: number
    type: UnitType
    speed: string | null
    armour: string | null
    cc: string | null
    ff: string | null
    weaponSlots: WeaponSlot[]
    transportType: string | null
    /** Empty array means no transport capacity. Multiple entries = OR alternatives. */
    transportCapacity: TransportCapacityEntry[]
    specialRuleNames?: string[]
}

// ─── Detachment / upgrade definitions ────────────────────────────────────────

/** Represents a unit count that may be fixed or a variable range */
export type UnitCount =
    | { unitName: string; count: number }
    | { unitName: string; min: number; max: number }

export interface ReplaceSpec {
    fromUnitName: string
    toUnitName: string
    /** Maximum number of units that can be replaced (min is always 0) */
    max: number
}

export interface AddSpec {
    unitName: string
    min: number
    max: number
}

export type UpgradeDef =
    | {
        name: string
        type: 'add'
        adds: AddSpec[]
        /** True if the added units are transports and should trigger transport capacity warnings */
        transportWarning?: boolean
    }
    | {
        name: string
        type: 'replace'
        replaces: ReplaceSpec
    }
    | {
        name: string
        type: 'character'
        characterNames: string[]
    }

export type DetachmentRestriction = { type: 'max_per_list'; value: number }

export interface DetachmentDef {
    name: string
    group: string
    units: UnitCount[]
    availableUpgrades: string[]
    restrictions: DetachmentRestriction[]
}

// ─── Army definition ─────────────────────────────────────────────────────────

export type ArmyRestriction = {
    type: 'max_group_percentage'
    group: string
    maxPercentage: number
}

export interface SpecialRule {
    title: string
    text: string
}

export interface SpecialRuleDef {
    title: string
    paragraphs: string[]
}

export interface ArmyDef {
    name: string
    slug: string
    strategyRating: number
    specialRules: SpecialRule[]
    restrictions: ArmyRestriction[]
    detachments: DetachmentDef[]
    upgrades: UpgradeDef[]
    units: UnitDef[]
    /** Resolved special rule definitions for all unit special rules used in this army */
    unitSpecialRules: SpecialRuleDef[]
}
