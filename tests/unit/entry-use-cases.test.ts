import assert from 'node:assert/strict'
import test from 'node:test'
import type { ArmyDef } from '../../src/entities/army'
import type { ArmyList } from '../../src/entities/list'
import type { ListRepository } from '../../src/ports/ListRepository'
import { addEntry, updateBaseUnitCount } from '../../src/use-cases/list/EntryUseCases'

class InMemoryListRepository implements ListRepository {
  private readonly lists = new Map<string, ArmyList>()

  constructor(initialLists: ArmyList[]) {
    initialLists.forEach((list) => this.lists.set(list.id, list))
  }

  getAll(): ArmyList[] {
    return Array.from(this.lists.values())
  }

  getById(id: string): ArmyList | undefined {
    return this.lists.get(id)
  }

  save(list: ArmyList): void {
    this.lists.set(list.id, list)
  }

  delete(id: string): void {
    this.lists.delete(id)
  }
}

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
        units: [{ unitName: 'Test Tank', min: 1, max: 3 }],
        availableUpgrades: [],
        restrictions: [],
      },
      {
        name: 'Fixed Detachment',
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
        cost: 50,
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

function createRepositoryWithList(): InMemoryListRepository {
  return new InMemoryListRepository([
    {
      id: 'list-1',
      name: 'List 1',
      pointsLimit: 3000,
      armySlug: 'test-army',
      entries: [],
    },
  ])
}

test('updateBaseUnitCount clamps mutable detachment units to their min and max', () => {
  const armyDef = createArmyDef()
  const repo = createRepositoryWithList()
  const listId = 'list-1'

  const listAfterAdd = addEntry(repo, listId, 'Mutable Detachment', armyDef)
  const entryId = listAfterAdd.entries[0].id

  const listAfterTooHigh = updateBaseUnitCount(repo, listId, entryId, 'Test Tank', 99, armyDef)
  assert.equal(listAfterTooHigh.entries[0].baseUnits[0].instances.length, 3)

  const listAfterTooLow = updateBaseUnitCount(repo, listId, entryId, 'Test Tank', 0, armyDef)
  assert.equal(listAfterTooLow.entries[0].baseUnits[0].instances.length, 1)
})

test('updateBaseUnitCount keeps fixed-count base units at their exact count', () => {
  const armyDef = createArmyDef()
  const repo = createRepositoryWithList()
  const listId = 'list-1'

  const listAfterAdd = addEntry(repo, listId, 'Fixed Detachment', armyDef)
  const entryId = listAfterAdd.entries[0].id

  const listAfterTooHigh = updateBaseUnitCount(repo, listId, entryId, 'Support Platform', 99, armyDef)
  assert.equal(listAfterTooHigh.entries[0].baseUnits[0].instances.length, 1)

  const listAfterTooLow = updateBaseUnitCount(repo, listId, entryId, 'Support Platform', 0, armyDef)
  assert.equal(listAfterTooLow.entries[0].baseUnits[0].instances.length, 1)
})
