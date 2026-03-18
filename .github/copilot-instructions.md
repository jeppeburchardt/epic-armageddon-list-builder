# Epic Armageddon Army Builder — Agent Instructions

## Project overview

A mobile-first web SPA for building army lists for the Epic Armageddon tabletop strategy game. Players create named army lists with a points limit, add detachments, apply upgrades, select per-unit weapon loadouts, and see derived point totals. All data is auto-saved to `localStorage`.

---

## Tech stack

| Concern | Technology |
|---|---|
| Build tool | Vite |
| Framework | Vue 3 (`<script setup>` + Composition API) |
| Language | TypeScript (strict mode) |
| State management | Pinia (though reactive state lives mostly in composables) |
| UI components | PrimeVue 4 (`primevue@4`, `@primeuix/themes`) |
| Routing | Vue Router 4 |
| ID generation | `uuid` (`v4`) |

PrimeVue theme: **Aura** (configured in `src/main.ts`).

---

## Architecture: hexagonal (ports & adapters)

Strict dependency rule — outer layers may depend on inner layers, never the reverse. Vue and all framework code is confined to the adapter layers and never leaks into use cases or entities.

```
src/
  entities/        ← domain model: pure TS types + pure functions, zero external deps
  use-cases/       ← application logic; depends only on entities + port interfaces
  ports/           ← outbound port interfaces (ListRepository, ArmyLoader)
  composables/     ← driving adapters: Vue composables, own reactive state
  components/      ← UI layer: call composables only
  infrastructure/  ← driven adapters: implement ports (localStorage, static JSON)
  data/armies/     ← static JSON army definition files
  router/          ← Vue Router config
  bootstrap.ts     ← composition root: wires infrastructure to use cases
```

Dependency flow:

```
components → composables → use-cases → ports ← infrastructure
                                ↕
                            entities
```

### Layer rules (enforce strictly)

- **`entities/`** — no imports from Vue, Pinia, PrimeVue, or any infrastructure. Only plain TypeScript.
- **`use-cases/`** — no Vue imports. Depend on entities and port interfaces only. Functions receive port instances as parameters (no singletons).
- **`ports/`** — TypeScript interfaces only. No implementations.
- **`composables/`** — import from `bootstrap.ts` (never from `infrastructure/` directly). Own `ref`/`computed` state. Call use-case functions via `services` from bootstrap.
- **`components/`** — import from composables only. Never import from `use-cases/`, `ports/`, `entities/`, or `infrastructure/` directly.
- **`infrastructure/`** — implement port interfaces. May use browser APIs (localStorage) or static imports.
- **`bootstrap.ts`** — the only file that imports from both infrastructure and use-cases. Exports a `services` object consumed by composables.

---

## Domain model summary

### `ArmyDef` (static, from JSON)
Describes what choices are available: detachments, upgrades, unit definitions, weapon definitions, army-level restrictions (e.g. max 30% of points on Support detachments).

- `DetachmentDef` — name, group, mandatory units (`UnitCount` — fixed count or min/max range), available upgrades, restrictions
- `UpgradeDef` — discriminated union: `{ type: 'add', adds: AddSpec[] }` or `{ type: 'replace', replaces: ReplaceSpec }`
- `UnitDef` — name, cost, type, speed, armour, cc, ff, `weaponSlots: WeaponSlot[]`, transportType, transportCapacity
- `WeaponSlot` — discriminated union: `{ kind: 'fixed', weaponName, count? }` or `{ kind: 'choice', choices: WeaponOption[] }`

### `ArmyList` (user-created, persisted)
- `Entry` — one detachment instance: `id`, `detachmentName`, `baseUnits: UnitTypeEntry[]`, `appliedUpgrades: AppliedUpgrade[]`
- `AppliedUpgrade` — discriminated union: `{ type: 'add', addedUnits: UnitTypeEntry[] }` or `{ type: 'replace', replacedCount, replacingUnits: UnitTypeEntry }`
- `UnitTypeEntry` — `{ unitName, instances: UnitInstance[] }` — `instances.length` is the effective count
- `UnitInstance` — `{ weaponSelections: WeaponSelection[] }` — one entry per choice weapon slot; units with no choice slots have an empty array

### Key derivations (pure functions in `entities/`)
- `deriveFormationUnits(entry, armyDef)` → effective composition after applying upgrades
- `calculateEntryPoints(entry, armyDef)` → cost with replace deductions and weapon option additions
- `validateList(list, armyDef)` → `ValidationResult[]` (warnings for group % exceeded, transport capacity mismatches)

---

## Weapon selections

Weapon selections are **per individual unit instance** — each model in a formation independently tracks its chosen weapon. This means a formation of 4 Predators can each have a different weapon loadout.

---

## Routes

| Path | View | Description |
|---|---|---|
| `/` | `HomeView` | List of saved army lists |
| `/edit/:id` | `EditorView` | Full list editor |
| `/view/:id` | `PrintView` | Printer-friendly view with unit stats |
| `/army/:slug` | `ArmyView` | Human-readable army reference |

---

## Adding a new army

1. Create `src/data/armies/<kebab-case-name>.json` following the `ArmyDef` schema in `src/entities/army.ts`
2. Import it in `src/infrastructure/StaticJsonArmyLoader.ts` and add it to the `armies` array
3. The new army will automatically appear in the "New List" dialog

### Army JSON structure
```jsonc
{
  "name": "Army Name",
  "slug": "army-name",               // kebab-case of name, matches filename
  "strategyRating": 5,
  "specialRules": [{ "title": "", "text": "" }],
  "restrictions": [
    { "type": "max_group_percentage", "group": "Support", "maxPercentage": 30 }
  ],
  "detachments": [...],
  "upgrades": [...],
  "units": [...],
  "weapons": [...]
}
```

---

## Conventions

- Use `<script setup lang="ts">` for all Vue components
- Use `defineProps<{...}>()` and `defineEmits<{...}>()` with explicit types
- Use `defineModel` for two-way binding on dialog `visible`
- Discriminated union narrowing: in templates, use a `computed` ref that narrows the type (e.g. `replaceUpgrade`) rather than accessing discriminated properties directly — Vue templates do not narrow unions
- Keep components under `components/` free of business logic; all logic goes in composables or use-cases
- `bootstrap.ts` is the only composition root; never instantiate infrastructure classes anywhere else
- Path alias `@/` resolves to `src/`
