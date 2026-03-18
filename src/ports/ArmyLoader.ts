import type { ArmyDef } from '@/entities/army'

export interface ArmyLoader {
    getAll(): ArmyDef[]
    getBySlug(slug: string): ArmyDef | undefined
}
