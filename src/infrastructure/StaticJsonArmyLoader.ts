import type { ArmyDef, SpecialRuleDef } from '@/entities/army'
import type { ArmyLoader } from '@/ports/ArmyLoader'
import legionesAstartes from '@/data/armies/legiones-astartes.json'
import allSpecialRules from '@/data/special-rules.json'

function enrichArmy(raw: unknown, globalRules: SpecialRuleDef[]): ArmyDef {
    const army = raw as ArmyDef
    const usedNames = new Set<string>()
    for (const unit of army.units) {
        for (const name of unit.specialRuleNames ?? []) {
            usedNames.add(name)
        }
    }
    const unitSpecialRules = globalRules.filter((r) => usedNames.has(r.title))
    return { ...army, unitSpecialRules }
}

const armies: ArmyDef[] = [enrichArmy(legionesAstartes, allSpecialRules as SpecialRuleDef[])]

export class StaticJsonArmyLoader implements ArmyLoader {
    getAll(): ArmyDef[] {
        return armies
    }

    getBySlug(slug: string): ArmyDef | undefined {
        return armies.find((a) => a.slug === slug)
    }
}
