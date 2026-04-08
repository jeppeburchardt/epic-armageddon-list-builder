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

export function validateArmyRestrictions(list: ArmyList, armyDef: ArmyDef): ValidationResult[] {
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
 * Returns a warning if the transport capacity in the formation is insufficient or excessive
 * for the transportable units.
 *
 * A transport's capacity is a single shared pool for all unit types it can carry — e.g. a
 * Thunderhawk with capacity 8 can carry any combination of Terminators and Dreadnoughts up
 * to 8 total slots, not 8 of each. Per-type bucketing would incorrectly double-count that
 * capacity, so we model this as a max-flow problem.
 *
 * Warnings are shown if:
 * 1. Max flow < total cost (insufficient capacity)
 * 2. Total applicable capacity >= total cost + smallest single transport unit's capacity (excess)
 */
export function validateTransportCapacity(entry: Entry, armyDef: ArmyDef): ValidationResult | null {
  // Gate: only validate if a transport upgrade has been applied
  const hasTransportUpgrade = entry.appliedUpgrades.some((upgrade) => {
    if (upgrade.type !== 'add') return false
    const upgradeDef = armyDef.upgrades.find((u) => u.name === upgrade.upgradeName)
    return upgradeDef?.type === 'add' && upgradeDef.transportWarning === true
  })

  if (!hasTransportUpgrade) return null

  const formation = deriveFormationUnits(entry, armyDef)

  // Total transport cost per unit type
  const costByType = new Map<string, number>()
  for (const ute of formation) {
    const unitDef = armyDef.units.find((u) => u.name === ute.unitName)
    if (!unitDef?.transportation?.type || unitDef.transportation.cost === undefined) continue
    const type = unitDef.transportation.type
    costByType.set(
      type,
      (costByType.get(type) ?? 0) + unitDef.transportation.cost * ute.instances.length,
    )
  }

  if (costByType.size === 0) return null

  // Collect transport units present in the formation
  const transports: Array<{ unitCapacity: number; count: number; capabilities: string[] }> = []
  for (const ute of formation) {
    const def = armyDef.units.find((u) => u.name === ute.unitName)
    if (!def?.transportation?.capacity || !def.transportation.capabilities?.length) continue
    transports.push({
      unitCapacity: def.transportation.capacity,
      count: ute.instances.length,
      capabilities: def.transportation.capabilities,
    })
  }

  // Max-flow network (Edmonds-Karp / BFS augmenting paths):
  //   source (0) → unit-type nodes (1..N) → transport nodes (N+1..N+M) → sink (N+M+1)
  // Each transport's capacity is a single pool shared across all unit types it can carry.
  // This correctly handles transports that cover multiple unit types.
  const types = [...costByType.keys()]
  const N = types.length
  const M = transports.length
  const SOURCE = 0
  const SINK = N + M + 1
  const size = SINK + 1
  const totalCost = [...costByType.values()].reduce((a, b) => a + b, 0)

  const cap: number[][] = Array.from(
    { length: size },
    (): number[] => Array(size).fill(0) as number[],
  )

  for (let i = 0; i < N; i++) {
    const cost = costByType.get(types[i])
    if (cost !== undefined) {
      cap[SOURCE][i + 1] = cost
    }
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      if (transports[j].capabilities.includes(types[i])) {
        const cost = costByType.get(types[i])
        if (cost !== undefined) {
          cap[i + 1][N + 1 + j] = cost
        }
      }
    }
  }
  for (let j = 0; j < M; j++) {
    cap[N + 1 + j][SINK] = transports[j].unitCapacity * transports[j].count
  }

  let maxFlow = 0
  const parent: number[] = new Array(size).fill(-1) as number[]
  let hasPath: boolean
  do {
    parent.fill(-1)
    parent[SOURCE] = SOURCE
    const queue = [SOURCE]
    let qi = 0
    while (qi < queue.length && parent[SINK] === -1) {
      const u = queue[qi++]
      for (let v = 0; v < size; v++) {
        if (parent[v] === -1 && cap[u][v] > 0) {
          parent[v] = u
          queue.push(v)
        }
      }
    }
    hasPath = parent[SINK] !== -1
    if (hasPath) {
      let pathFlow = Infinity
      for (let v = SINK; v !== SOURCE; v = parent[v]) {
        const pv = parent[v]
        pathFlow = Math.min(pathFlow, cap[pv][v])
      }
      for (let v = SINK; v !== SOURCE; v = parent[v]) {
        const pv = parent[v]
        cap[pv][v] -= pathFlow
        cap[v][pv] += pathFlow
      }
      maxFlow += pathFlow
    }
  } while (hasPath)

  const messages: string[] = []

  if (maxFlow < totalCost) {
    messages.push(`Not enough transport capacity: need ${totalCost}, have ${maxFlow}.`)
  } else {
    // Excess check: total applicable capacity >= total cost + smallest single transport unit
    const applicable = transports.filter((t) => t.capabilities.some((c) => costByType.has(c)))
    if (applicable.length > 0) {
      const totalCapacity = applicable.reduce((sum, t) => sum + t.unitCapacity * t.count, 0)
      const minUnitCapacity = Math.min(...applicable.map((t) => t.unitCapacity))
      if (totalCapacity >= totalCost + minUnitCapacity) {
        messages.push(`Excess transport capacity: need ${totalCost}, have ${totalCapacity}.`)
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
