import type { ArmyDef, SpecialRuleDef } from '@/entities/army'
import type { ArmyLoader } from '@/ports/ArmyLoader'
import legionesAstartes from '@/data/armies/legiones-astartes.json'
import playwrightTestArmy from '@/data/armies/playwright-test-army.json'
import spaceMarines from '@/data/armies/space-marine.json'
import allSpecialRules from '@/data/special-rules.json'
import { RawArmyDefSchema, SpecialRulesFileSchema } from '@/infrastructure/armySchema'

function normalizedRuleNames(unit: ArmyDef['units'][number]): string[] {
  const names = unit.specialRuleNames ?? unit.traits ?? []
  return Array.from(new Set(names))
}

function enrichArmy(raw: unknown, globalRules: SpecialRuleDef[]): ArmyDef {
  const army = RawArmyDefSchema.parse(raw)
  const normalizedUnits = army.units.map((unit) => ({
    ...unit,
    specialRuleNames: normalizedRuleNames(unit),
  }))

  const usedNames = new Set<string>()
  for (const unit of normalizedUnits) {
    for (const name of unit.specialRuleNames) {
      usedNames.add(name)
    }
  }
  const unitSpecialRules = globalRules.filter((r) => usedNames.has(r.title))
  return { ...army, units: normalizedUnits, unitSpecialRules }
}

const parsedRules = SpecialRulesFileSchema.parse(allSpecialRules)

const armies: ArmyDef[] = [
  enrichArmy(legionesAstartes, parsedRules),
  enrichArmy(playwrightTestArmy, parsedRules),
  enrichArmy(spaceMarines, parsedRules),
]

export class StaticJsonArmyLoader implements ArmyLoader {
  getAll(): ArmyDef[] {
    return armies
  }

  getBySlug(slug: string): ArmyDef | undefined {
    return armies.find((a) => a.slug === slug)
  }
}
