import { ref } from 'vue'
import { services } from '@/bootstrap'
import type { ArmyList } from '@/entities/list'
import type { CreateListInput, UpdateListInput } from '@/use-cases/list/ListUseCases'

const lists = ref(services.getLists())

function refresh() {
  lists.value = services.getLists()
}

export function useLists() {
  function createList(input: CreateListInput): ArmyList {
    const list = services.createList(input)
    refresh()
    return list
  }

  function updateList(id: string, input: UpdateListInput): void {
    services.updateList(id, input)
    refresh()
  }

  function deleteList(id: string): void {
    services.deleteList(id)
    refresh()
  }

  return { lists, createList, updateList, deleteList }
}
