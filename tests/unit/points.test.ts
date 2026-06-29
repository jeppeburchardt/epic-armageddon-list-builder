import assert from 'node:assert/strict'
import test from 'node:test'
import type { ArmyDef } from '../../src/entities/army'
import { detachmentMinCost } from '../../src/entities/points'

function createArmyDef(): ArmyDef {
  return {
    name: 'Test Army',
    slug: 'test-army',
    strategyRating: 3,
    specialRules: [],
    restrictions: [],
    unitSpecialRules: [],
    detachments: [
      {
        name: 'Mutable Detachment',
        group: 'Core',
        units: [
          { unitName: 'Test Tank', min: 1, max: 3 },
          { unitName: 'Test Predator', count: 3, min: 3, max: 6 },
        ],
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
        weaponSlots: [
          {
            kind: 'choice',
            choices: [
              {
                weaponName: 'Plasma Cannon',
                range: '30cm',
                firepower: 'AT4+ AP4+',
                additionalCost: 10,
              },
              { weaponName: 'Lascannon', range: '45cm', firepower: 'AT4+', additionalCost: 5 },
            ],
          },
        ],
      },
      {
        name: 'Test Predator',
        cost: 80,
        type: 'AV',
        speed: '20cm',
        armour: '4+',
        cc: '6+',
        ff: '5+',
        weaponSlots: [
          { kind: 'fixed', weaponName: 'Predator Cannon', range: '45cm', firepower: 'AT5+ AP5+' },
        ],
      },
    ],
  }
}

test('detachmentMinCost includes the cheapest option for each choice weapon slot', () => {
  const armyDef = createArmyDef()
  const detachmentDef = armyDef.detachments[0]

  // Test Tank: min 1 * (100 + cheapest choice 5) = 105
  // Test Predator: count 3 * 80 (no choice slots) = 240
  assert.equal(detachmentMinCost(detachmentDef, armyDef), 105 + 240)
})
