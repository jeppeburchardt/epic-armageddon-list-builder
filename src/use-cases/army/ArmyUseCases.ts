import type { ArmyDef } from '@/entities/army'
import type { ArmyLoader } from '@/ports/ArmyLoader'

export function getArmies(loader: ArmyLoader): ArmyDef[] {
    return loader.getAll()
}

export function getArmy(loader: ArmyLoader, slug: string): ArmyDef | undefined {
    return loader.getBySlug(slug)
}
