import { z } from 'zod'

// ─── Weapons ─────────────────────────────────────────────────────────────────

export const WeaponOptionSchema = z.object({
  weaponName: z.string(),
  range: z.string(),
  firepower: z.string(),
  additionalCost: z.number(),
})

export const WeaponSlotSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('fixed'),
    weaponName: z.string(),
    range: z.string(),
    firepower: z.string(),
    count: z.number().optional(),
  }),
  z.object({
    kind: z.literal('choice'),
    name: z.string().optional(),
    choices: z.array(WeaponOptionSchema),
  }),
])

// ─── Transportation ──────────────────────────────────────────────────────────

export const TransportationSchema = z.object({
  cost: z.number().optional(),
  type: z.string().optional(),
  capacity: z.number().optional(),
  capabilities: z.array(z.string()).optional(),
})

// ─── Unit definition ─────────────────────────────────────────────────────────

export const UnitTypeSchema = z.enum(['CH', 'INF', 'LV', 'AV', 'AC', 'WE', 'AC/WE', 'SC', 'Special'])

export const UnitDefSchema = z.object({
  name: z.string(),
  cost: z.number(),
  type: UnitTypeSchema,
  speed: z.string().nullable(),
  armour: z.string().nullable(),
  cc: z.string().nullable(),
  ff: z.string().nullable(),
  weaponSlots: z.array(WeaponSlotSchema),
  transportation: TransportationSchema.optional(),
  specialRuleNames: z.array(z.string()).optional(),
})

// ─── Detachment / upgrade definitions ────────────────────────────────────────

export const UnitCountSchema = z.union([
  z.object({ unitName: z.string(), count: z.number() }),
  z.object({ unitName: z.string(), min: z.number(), max: z.number() }),
])

export const ReplaceSpecSchema = z.object({
  fromUnitName: z.string(),
  toUnitName: z.string(),
  max: z.number(),
})

export const AddSpecSchema = z.object({
  unitName: z.string(),
})

export const UpgradeDefSchema = z.discriminatedUnion('type', [
  z.object({
    name: z.string(),
    type: z.literal('add'),
    adds: z.array(AddSpecSchema),
    transportWarning: z.boolean().optional(),
    maxTotal: z.number().optional(),
  }),
  z.object({
    name: z.string(),
    type: z.literal('replace'),
    replaces: ReplaceSpecSchema,
  }),
  z.object({
    name: z.string(),
    type: z.literal('character'),
    characterNames: z.array(z.string()),
  }),
])

export const DetachmentRestrictionSchema = z.object({
  type: z.literal('max_per_list'),
  value: z.number(),
})

export const DetachmentDefSchema = z.object({
  name: z.string(),
  group: z.string(),
  units: z.array(UnitCountSchema),
  availableUpgrades: z.array(z.string()),
  restrictions: z.array(DetachmentRestrictionSchema),
})

// ─── Army definition ─────────────────────────────────────────────────────────

export const ArmyRestrictionSchema = z.object({
  type: z.literal('max_group_percentage'),
  group: z.string(),
  maxPercentage: z.number(),
})

export const SpecialRuleSchema = z.object({
  title: z.string(),
  text: z.string(),
})

/**
 * Schema for the raw JSON army file.
 * Does NOT include `unitSpecialRules` — that field is derived at runtime, not stored in JSON.
 */
export const RawArmyDefSchema = z.object({
  name: z.string(),
  slug: z.string(),
  strategyRating: z.number(),
  specialRules: z.array(SpecialRuleSchema),
  restrictions: z.array(ArmyRestrictionSchema),
  detachments: z.array(DetachmentDefSchema),
  upgrades: z.array(UpgradeDefSchema),
  units: z.array(UnitDefSchema),
})

// ─── Special rules file ───────────────────────────────────────────────────────

export const SpecialRuleDefSchema = z.object({
  title: z.string(),
  paragraphs: z.array(z.string()),
})

export const SpecialRulesFileSchema = z.array(SpecialRuleDefSchema)
