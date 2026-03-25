import * as fs from 'node:fs'
import * as path from 'node:path'
import type { ZodIssue } from 'zod'
import { RawArmyDefSchema, SpecialRulesFileSchema } from '../src/infrastructure/armySchema.ts'

function formatPath(segments: (string | number)[]): string {
  return segments.reduce<string>((acc, seg) => {
    return typeof seg === 'number' ? `${acc}[${seg}]` : acc ? `${acc}.${seg}` : String(seg)
  }, '')
}

function printIssues(issues: ZodIssue[], indent: string): void {
  for (const issue of issues) {
    if (issue.code === 'invalid_union') {
      // Pick the branch with the deepest error path — it's the most specific/relevant
      const best = issue.unionErrors.reduce((a, b) => {
        const aDepth = Math.max(...a.issues.map((i) => i.path.length))
        const bDepth = Math.max(...b.issues.map((i) => i.path.length))
        return bDepth > aDepth ? b : a
      })
      printIssues(best.issues, indent)
    } else {
      const loc = issue.path.length > 0 ? formatPath(issue.path) : '(root)'
      console.error(`${indent}${loc}: ${issue.message}`)
    }
  }
}

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
  printIssues(result.error.issues, '  ')
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
