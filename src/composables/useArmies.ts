import { computed } from 'vue'
import { services } from '@/bootstrap'

export function useArmies() {
    const armies = computed(() => services.getArmies())

    function getArmy(slug: string) {
        return services.getArmy(slug)
    }

    return { armies, getArmy }
}
