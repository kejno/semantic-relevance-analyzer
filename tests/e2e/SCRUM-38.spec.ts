import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')

describe('SCRUM-38: package setup verification', () => {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'))

  it('@xenova/transformers is in dependencies (not devDependencies)', () => {
    expect(pkg.dependencies).toHaveProperty('@xenova/transformers')
    expect(pkg.devDependencies).not.toHaveProperty('@xenova/transformers')
  })

  it('vitest is in devDependencies (not dependencies)', () => {
    expect(pkg.devDependencies).toHaveProperty('vitest')
    expect(pkg.dependencies).not.toHaveProperty('vitest')
  })

  it('test script is defined and invokes vitest', () => {
    expect(pkg.scripts).toHaveProperty('test')
    expect(pkg.scripts.test).toContain('vitest')
  })

  it('vitest.config.ts exists at project root', () => {
    expect(existsSync(resolve(ROOT, 'vitest.config.ts'))).toBe(true)
  })
})
