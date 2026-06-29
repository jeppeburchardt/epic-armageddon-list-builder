import type { ArmyDef } from './army'

export const GROUP_COLORS = ['#0969da', '#1f883d', '#9333ea', '#d97706', '#0891b2']

export function getGroupColor(group: string, armyDef: ArmyDef): string {
    const seen = new Set<string>()
    const groups: string[] = []
    for (const d of armyDef.detachments) {
        if (!seen.has(d.group)) {
            seen.add(d.group)
            groups.push(d.group)
        }
    }
    const index = groups.indexOf(group)
    return GROUP_COLORS[(index >= 0 ? index : 0) % GROUP_COLORS.length]
}
