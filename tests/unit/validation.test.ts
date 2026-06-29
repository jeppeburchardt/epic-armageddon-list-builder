import assert from 'node:assert/strict'
import test from 'node:test'
import type { ArmyDef } from '../../src/entities/army'
import type { ArmyList } from '../../src/entities/list'
import { validateArmyRestrictions } from '../../src/entities/validation'

function createArmyDef(): ArmyDef {
  return {
    name: 'Test Army',
    slug: 'test-army',
    strategyRating: 3,
    specialRules: [],
    restrictions: [
      { type: 'max_group_percentage', group: 'Support', maxPercentage: 30 },
      { type: 'min_group_percentage', group: 'Core', minPercentage: 50 },
    ],
    unitSpecialRules: [],
    detachments: [
      {
        name: 'Core Detachment',
        group: 'Core',
        units: [{ unitName: 'Test Tank', count: 1 }],
        availableUpgrades: [],
        restrictions: [],
      },
      {
        name: 'Support Detachment',
        group: 'Support',
        units: [{ unitName: 'Support Platform', count: 1 }],
        availableUpgrades: [],
        restrictions: [],
      },
    ],
    upgrades: [],
    units: [
      {
        name: 'Test Tank',
        cost: 100,
        type: 'AV',
        speed: '25cm',
        armour: '4+',
        cc: '6+',
        ff: '4+',
        weaponSlots: [],
      },
      {
        name: 'Support Platform',
        cost: 100,
        type: 'LV',
        speed: '15cm',
        armour: '5+',
        cc: '6+',
        ff: '5+',
        weaponSlots: [],
      },
    ],
  }
}

function createList(entries: ArmyList['entries']): ArmyList {
  return {
    id: 'list-1',
    name: 'Test List',
    pointsLimit: 1000,
    armySlug: 'test-army',
    entries,
  }
}

test('validateArmyRestrictions warns when a group exceeds its max percentage', () => {
  const armyDef = createArmyDef()
  const list = createList([
    {
      id: 'core-1',
      detachmentName: 'Core Detachment',
      baseUnits: [{ unitName: 'Test Tank', instances: [{ weaponSelections: [] }] }],
      appliedUpgrades: [],
    },
    {
      id: 'support-1',
      detachmentName: 'Support Detachment',
      baseUnits: [{ unitName: 'Support Platform', instances: [{ weaponSelections: [] }] }],
      appliedUpgrades: [],
    },
  ])

  // Support: 100pts, max 30% of 1000pts = 300pts -> not exceeded
  // Core: 100pts, min 50% of 1000pts = 500pts -> exceeded (below minimum)
  const results = validateArmyRestrictions(list, armyDef)

  assert.equal(results.length, 1)
  assert.match(results[0].message, /Core detachments cost 100pts — min 50% of 1000pts \(500pts\)/)
})

test('validateArmyRestrictions warns when a group exceeds its max percentage and is below its min', () => {
  const armyDef = createArmyDef()
  const list = createList([
    {
      id: 'support-1',
      detachmentName: 'Support Detachment',
      baseUnits: [
        { unitName: 'Support Platform', instances: [{ weaponSelections: [] }, { weaponSelections: [] }, { weaponSelections: [] }, { weaponSelections: [] }] },
      ],
      appliedUpgrades: [],
    },
  ])

  // Support: 400pts, max 30% of 1000pts = 300pts -> exceeded
  // Core: 0pts, min 50% of 1000pts = 500pts -> exceeded (below minimum)
  const results = validateArmyRestrictions(list, armyDef)

  assert.equal(results.length, 2)
  assert.ok(results.some((r) => /Support detachments cost 400pts — max 30%/.test(r.message)))
  assert.ok(results.some((r) => /Core detachments cost 0pts — min 50%/.test(r.message)))
})

test('validateArmyRestrictions has no warnings when both min and max are satisfied', () => {
  const armyDef = createArmyDef()
  const list = createList([
    {
      id: 'core-1',
      detachmentName: 'Core Detachment',
      baseUnits: [
        { unitName: 'Test Tank', instances: [{ weaponSelections: [] }, { weaponSelections: [] }, { weaponSelections: [] }, { weaponSelections: [] }, { weaponSelections: [] }, { weaponSelections: [] }] },
      ],
      appliedUpgrades: [],
    },
    {
      id: 'support-1',
      detachmentName: 'Support Detachment',
      baseUnits: [{ unitName: 'Support Platform', instances: [{ weaponSelections: [] }] }],
      appliedUpgrades: [],
    },
  ])

  // Core: 600pts >= 500pts min. Support: 100pts <= 300pts max.
  const results = validateArmyRestrictions(list, armyDef)

  assert.deepEqual(results, [])
})
