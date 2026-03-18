import type { ArmyList } from '@/entities/list'
import type { ListRepository } from '@/ports/ListRepository'

const STORAGE_KEY = 'ea-army-builder:lists'

export class LocalStorageListRepository implements ListRepository {
    private read(): ArmyList[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (!raw) return []
            return JSON.parse(raw) as ArmyList[]
        } catch {
            return []
        }
    }

    private write(lists: ArmyList[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
    }

    getAll(): ArmyList[] {
        return this.read()
    }

    getById(id: string): ArmyList | undefined {
        return this.read().find((l) => l.id === id)
    }

    save(list: ArmyList): void {
        const lists = this.read()
        const idx = lists.findIndex((l) => l.id === list.id)
        if (idx >= 0) {
            lists[idx] = list
        } else {
            lists.push(list)
        }
        this.write(lists)
    }

    delete(id: string): void {
        const lists = this.read().filter((l) => l.id !== id)
        this.write(lists)
    }
}
