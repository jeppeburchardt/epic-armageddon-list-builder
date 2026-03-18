import type { ArmyList } from '@/entities/list'

export interface ListRepository {
    getAll(): ArmyList[]
    getById(id: string): ArmyList | undefined
    save(list: ArmyList): void
    delete(id: string): void
}
