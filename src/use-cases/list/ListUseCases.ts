import { v4 as uuidv4 } from 'uuid'
import type { ArmyList } from '@/entities/list'
import type { ListRepository } from '@/ports/ListRepository'

export function getLists(repo: ListRepository): ArmyList[] {
    return repo.getAll()
}

export function getList(repo: ListRepository, id: string): ArmyList | undefined {
    return repo.getById(id)
}

export interface CreateListInput {
    name: string
    pointsLimit: number
    armySlug: string
}

export function createList(repo: ListRepository, input: CreateListInput): ArmyList {
    const list: ArmyList = {
        id: uuidv4(),
        name: input.name,
        pointsLimit: input.pointsLimit,
        armySlug: input.armySlug,
        entries: [],
    }
    repo.save(list)
    return list
}

export interface UpdateListInput {
    name?: string
    pointsLimit?: number
}

export function updateList(
    repo: ListRepository,
    id: string,
    input: UpdateListInput,
): ArmyList {
    const existing = repo.getById(id)
    if (!existing) throw new Error(`List not found: ${id}`)
    const updated: ArmyList = {
        ...existing,
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.pointsLimit !== undefined ? { pointsLimit: input.pointsLimit } : {}),
    }
    repo.save(updated)
    return updated
}

export function deleteList(repo: ListRepository, id: string): void {
    repo.delete(id)
}
