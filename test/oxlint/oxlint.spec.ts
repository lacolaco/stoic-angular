import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const oxlintBin = path.join(root, 'node_modules/.bin/oxlint');
const distEntry = path.join(root, 'dist/index.js');

interface Diagnostic {
  code: string;
  filename: string;
  message: string;
}

function runOxlint(cwd: string, args: string[]): { diagnostics: Diagnostic[]; stderr: string } {
  const result = spawnSync(oxlintBin, ['-c', '.oxlintrc.json', '--format', 'json', ...args], {
    cwd,
    encoding: 'utf-8',
  });
  const parsed = JSON.parse(result.stdout) as { diagnostics: Diagnostic[] };
  return { diagnostics: parsed.diagnostics, stderr: result.stderr };
}

function reportsFor(diagnostics: Diagnostic[], rule: string): Diagnostic[] {
  return diagnostics.filter(
    (d) => d.code === `stoic-angular(${rule})` && d.filename.startsWith(`fixtures/${rule}/`),
  );
}

describe('oxlint jsPlugins compatibility (rules without type information)', () => {
  let diagnostics: Diagnostic[] = [];

  beforeAll(() => {
    // The fixtures load the built plugin from dist/, so build it first
    execFileSync('pnpm', ['build'], { cwd: root, stdio: 'pipe' });
    diagnostics = runOxlint(here, ['fixtures']).diagnostics;
  }, 120_000);

  it('loads every enabled rule without internal errors', () => {
    const internal = diagnostics.filter((d) => !d.code.startsWith('stoic-angular('));
    expect(internal).toEqual([]);
  });

  it('reports call-or-pass (scopeManager, getFunctionHeadLocation)', () => {
    expect(reportsFor(diagnostics, 'call-or-pass')).toHaveLength(1);
  });

  it('reports if-only-at-start', () => {
    expect(reportsFor(diagnostics, 'if-only-at-start')).toHaveLength(1);
  });

  it('reports max-function-lines', () => {
    expect(reportsFor(diagnostics, 'max-function-lines')).toHaveLength(1);
  });

  it('reports no-else', () => {
    expect(reportsFor(diagnostics, 'no-else')).toHaveLength(1);
  });

  it('reports no-switch', () => {
    expect(reportsFor(diagnostics, 'no-switch')).toHaveLength(1);
  });

  it('reports pure-conditions', () => {
    expect(reportsFor(diagnostics, 'pure-conditions')).toHaveLength(1);
  });

  it('reports no-class-inheritance', () => {
    expect(reportsFor(diagnostics, 'no-class-inheritance')).toHaveLength(1);
  });

  it('reports no-common-affixes (scopeManager)', () => {
    expect(reportsFor(diagnostics, 'no-common-affixes')).toHaveLength(2);
  });

  it('reports max-directory-entries (context.filename and node:fs)', () => {
    expect(reportsFor(diagnostics, 'max-directory-entries')).toHaveLength(10);
  });

  it('reports vm-signature in a TypeScript file with type annotations', () => {
    expect(reportsFor(diagnostics, 'vm-signature')).toHaveLength(2);
  });

  it('reports inline-short-templates (context.filename and node:fs)', () => {
    expect(reportsFor(diagnostics, 'inline-short-templates')).toHaveLength(1);
  });

  describe('--fix', () => {
    let work = '';

    beforeAll(() => {
      work = mkdtempSync(path.join(tmpdir(), 'stoic-oxlint-'));
      cpSync(path.join(here, 'fixtures'), path.join(work, 'fixtures'), { recursive: true });
      const config = readFileSync(path.join(here, '.oxlintrc.json'), 'utf-8');
      const absolute = config.replace('../../dist/index.js', distEntry);
      writeFileSync(path.join(work, '.oxlintrc.json'), absolute);
    });

    afterAll(() => {
      rmSync(work, { recursive: true, force: true });
    });

    it('rewrites templateUrl to an inline template with inline-short-templates', () => {
      const target = 'fixtures/inline-short-templates';
      runOxlint(work, ['--fix', target]);
      const fixed = readFileSync(path.join(work, target, 'sample.component.ts'), 'utf-8');
      expect(fixed).toContain('template: `');
      expect(fixed).toContain('<p>Hello</p>');
      expect(fixed).not.toContain('templateUrl');
    });
  });
});
