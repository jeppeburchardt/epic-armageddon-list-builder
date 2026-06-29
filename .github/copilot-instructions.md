# Epic Armageddon Army Builder — Agent Instructions

## Project overview

A mobile-first web SPA for building army lists for the Epic Armageddon tabletop strategy game. Players create named army lists with a points limit, add detachments, apply upgrades, select per-unit weapon loadouts, and see derived point totals. All data is auto-saved to `localStorage`.

---

## Tech stack

| Concern           | Technology                                                 |
| ----------------- | ----------------------------------------------------------- |
| Build tool        | Vite                                                       |
| Framework         | Vue 3 (`<script setup>` + Composition API)                |
| Language          | TypeScript (strict mode)                                  |
| State management  | Pinia (though reactive state lives mostly in composables) |
| UI components     | Native Vue/HTML components                                |
| Routing           | Vue Router 4                                               |
| ID generation     | `uuid` (`v4`)                                              |
| Utilities         | `@vueuse/core`                                             |
| Schema validation | `zod` (army JSON validation, see `npm run validate`)       |

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

- **`entities/`** — no imports from Vue, Pinia, or any infrastructure. Only plain TypeScript.
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

- `DetachmentDef` — name, group, mandatory units (`UnitCount` — fixed count or min/max range), available upgrades, restrictions (e.g. `max_per_list`)
- `UpgradeDef` — discriminated union: `{ type: 'add', adds: AddSpec[] }`, `{ type: 'replace', replaces: ReplaceSpec }`, or `{ type: 'character', characterNames: string[] }`
- `UnitDef` — name, cost, type, speed, armour, cc, ff, `weaponSlots: WeaponSlot[]`, optional `transportation: { cost?, type?, capacity?, capabilities? }`, optional `gprTrainingInfo` (see GPR transparency below)
- `WeaponSlot` — discriminated union: `{ kind: 'fixed', weaponName, range, firepower, count? }` or `{ kind: 'choice', choices: WeaponOption[] }`

### `ArmyList` (user-created, persisted)

- `Entry` — one detachment instance: `id`, `detachmentName`, `baseUnits: UnitTypeEntry[]`, `appliedUpgrades: AppliedUpgrade[]`
- `AppliedUpgrade` — discriminated union: `{ type: 'add', addedUnits: UnitTypeEntry[] }`, `{ type: 'replace', replacedCount, replacingUnits: UnitTypeEntry }`, or `{ type: 'character', chosenCharacterName: string | null }`
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

| Path                                 | View                 | Description                                         |
| ------------------------------------- | -------------------- | ---------------------------------------------------- |
| `/`                                   | `HomeView`           | List of saved army lists                             |
| `/army/:slug`                         | `ArmyView`           | Human-readable army reference                        |
| `/:id`                                | `ListLayout`         | Shell for a single list; redirects to `view`         |
| `/:id/view`                           | `PrintView`          | Printer-friendly view with unit stats                |
| `/:id/edit`                           | `EditorView`         | Full list editor                                     |
| `/:id/reference`                      | `ListReferenceView`  | Army reference scoped to the list's army             |
| `/:id/reference/unit/:unitName/gpr`   | `UnitGprView`        | GPR transparency view for a single unit (see below)  |
| `/:pathMatch(.*)*`                    | `NotFoundView`       | 404 fallback                                         |

`ListLayout` instantiates `useListEditor(id)` once and `provide`s it under `listEditorKey`; the four child views and their components `inject(listEditorKey)` rather than re-instantiating the editor composable.

### GPR transparency

`UnitDef.gprTrainingInfo` (optional) holds the output of a Gaussian Process Regression model used to sanity-check a unit's hand-authored point cost against stat-derived predictions: `predictedMean`, `uncertainty`, `score`, `quality`, `topNearestNeighbours`, `contributingPriceValues`, `trainingSetSize`, `modelKernel`. `UnitGprView` (using `components/army/GprChart.vue`) renders this for army-reference users; units without training data show an empty-state instead of erroring.

---

## Adding a new army

1. Create `src/data/armies/<kebab-case-name>.json` matching `RawArmyDefSchema` in `src/infrastructure/armySchema.ts` (the raw, on-disk shape — a subset of `ArmyDef`; `unitSpecialRules` is computed at load time, not authored)
2. Import it in `src/infrastructure/StaticJsonArmyLoader.ts` and add it to the `armies` array (it gets parsed through `RawArmyDefSchema` and enriched there)
3. Run `npm run validate` (`scripts/validate-armies.ts`) to check the new file and `src/data/special-rules.json` against their zod schemas before committing
4. The new army will automatically appear in the "New List" dialog

### Army JSON structure

```jsonc
{
  "name": "Army Name",
  "slug": "army-name",               // kebab-case of name, matches filename
  "strategyRating": 5,
  "specialRules": [{ "title": "", "text": "" }],
  "restrictions": [
    { "type": "max_group_percentage", "group": "Support", "maxPercentage": 30 },
    { "type": "min_group_percentage", "group": "Core", "minPercentage": 25 }
  ],
  "detachments": [...],
  "upgrades": [...],
  "units": [...]                     // weapon profiles live inline on each unit's weaponSlots, not a separate top-level array
}
```

Unit special rules are resolved against the shared `src/data/special-rules.json` file by matching each unit's `specialRuleNames` (or legacy `traits`) to a rule `title`; the matched set becomes `ArmyDef.unitSpecialRules`.

---

## Conventions

- Use `<script setup lang="ts">` for all Vue components
- Use `defineProps<{...}>()` and `defineEmits<{...}>()` with explicit types
- Use `defineModel` for two-way binding on dialog `visible`
- Discriminated union narrowing: in templates, use a `computed` ref that narrows the type (e.g. `replaceUpgrade`) rather than accessing discriminated properties directly — Vue templates do not narrow unions
- Keep components under `components/` free of business logic; all logic goes in composables or use-cases
- `bootstrap.ts` is the only composition root; never instantiate infrastructure classes anywhere else
- Path alias `@/` resolves to `src/`

---

## Playwright expectations

- End-to-end coverage lives in `tests/playwright/` and runs with `npm run test:e2e`
- Prefer the dedicated `Playwright Test Army` (`src/data/armies/playwright-test-army.json`) for mutation-oriented tests so assertions do not depend on live army definitions that may change over time
- When adding or updating Playwright tests, cover every user-visible mutation the feature introduces (for example list creation/deletion, detachment changes, upgrades, counts, and weapon selections)
- All future user-facing features must ship with Playwright coverage for their new behavior

### Test structure

Group related tests under a `test.describe()` block and share setup with `test.beforeEach()`. Use `test.step()` inside multi-action tests to label phases clearly. One spec file per feature area.

```
tests/playwright/
  helpers.ts                  ← shared setup helpers (resetLists, createPlaywrightTestList, addDetachment, addUpgrade, detachmentCard)
  list-creation.spec.ts
  list-mutations.spec.ts      ← describe blocks: List Home Management, Detachment Ordering, Unit Counts, Upgrades
  detachment-details.spec.ts
  gpr-transparency.spec.ts
```

**Locators** — prefer role-based locators (`getByRole`, `getByLabel`, `getByText`). CSS class selectors are acceptable inside named dialogs or shared helpers where no semantic alternative exists.

**Assertions** — use auto-retrying web-first assertions. Prefer `toContainText` / `toHaveValue` / `toHaveCount` / `toHaveURL` over `toBeVisible()` unless visibility itself is what is under test.

**State** — always call `resetLists(page)` (or `createPlaywrightTestList` which calls it) at the start of each test or `beforeEach` to ensure a clean `localStorage` state.

**`<details>` panels** — the base units panel on a `DetachmentCard` starts **open** by default. Upgrade panels open when the upgrade is added (`activePanel` binding). Assert `toHaveAttribute('open', '')` for open and `not.toHaveAttribute('open')` for closed; never click `summary` to "open" a panel that is already open.
