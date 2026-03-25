import * as fs from 'node:fs'
import * as path from 'node:path'
import { RawArmyDefSchema, SpecialRulesFileSchema } from '../src/infrastructure/armySchema.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const ARMIES_DIR = path.join(ROOT, 'src/data/armies')
const SPECIAL_RULES_FILE = path.join(ROOT, 'src/data/special-rules.json')

let hasErrors = false

function validateFile(
  filePath: string,
  schema: typeof RawArmyDefSchema | typeof SpecialRulesFileSchema,
): void {
  const relative = path.relative(ROOT, filePath)
  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch (e) {
    console.error(`\n✗ ${relative}`)
    console.error(`  Failed to parse JSON: ${(e as Error).message}`)
    hasErrors = true
    return
  }

  const result = schema.safeParse(raw)
  if (result.success) {
    console.log(`  ✓ ${relative}`)
    return
  }

  hasErrors = true
  console.error(`\n✗ ${relative}`)
  const flat = result.error.flatten()

  if (Object.keys(flat.formErrors).length > 0) {
    console.error('  Root errors:')
    for (const msg of flat.formErrors) {
      console.error(`    - ${msg}`)
    }
  }

  for (const [field, messages] of Object.entries(flat.fieldErrors)) {
    for (const msg of messages ?? []) {
      console.error(`  [${field}]: ${msg}`)
    }
  }

  // For nested errors, also print the full Zod issue list
  for (const issue of result.error.issues) {
    const loc = issue.path.length > 0 ? issue.path.join('.') : '(root)'
    console.error(`  ${loc}: ${issue.message}`)
  }
}

// Validate all army files
const armyFiles = fs
  .readdirSync(ARMIES_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => path.join(ARMIES_DIR, f))

if (armyFiles.length === 0) {
  console.warn('No army JSON files found in src/data/armies/')
}

console.log(`\nValidating ${armyFiles.length} army file(s) and special-rules.json...\n`)

for (const file of armyFiles) {
  validateFile(file, RawArmyDefSchema)
}

// Validate special rules file
validateFile(SPECIAL_RULES_FILE, SpecialRulesFileSchema)

if (hasErrors) {
  console.error('\nValidation failed.')
  process.exit(1)
} else {
  console.log('\nAll files valid.')
  process.exit(0)
}
