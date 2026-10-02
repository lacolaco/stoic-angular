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

function runOxlint(cwd: string, args: string[]): Diagnostic[] {
  const result = spawnSync(oxlintBin, ['-c', '.oxlintrc.json', '--format', 'json', ...args], {
    cwd,
    encoding: 'utf-8',
  });
  return (JSON.parse(result.stdout) as { diagnostics: Diagnostic[] }).diagnostics;
}

describe('oxlint jsPlugins compatibility', () => {
  let diagnostics: Diagnostic[] = [];

  beforeAll(() => {
    // The fixtures load the built plugin from dist/, so build it first
    execFileSync('pnpm', ['build'], { cwd: root, stdio: 'pipe' });
    diagnostics = runOxlint(here, ['fixtures']);
  }, 120_000);

  it('loads every enabled rule without internal errors', () => {
    const internal = diagnostics.filter((d) => !d.code.startsWith('stoic-angular('));
    expect(internal).toEqual([]);
  });

  it('reports max-function-lines', () => {
    const reports = diagnostics.filter(
      (d) =>
        d.code === 'stoic-angular(max-function-lines)' &&
        d.filename.startsWith('fixtures/max-function-lines/'),
    );
    expect(reports).toHaveLength(1);
  });

  it('reports if-only-at-start', () => {
    const reports = diagnostics.filter(
      (d) =>
        d.code === 'stoic-angular(if-only-at-start)' &&
        d.filename.startsWith('fixtures/if-only-at-start/'),
    );
    expect(reports).toHaveLength(1);
  });

  it('reports no-class-inheritance', () => {
    const reports = diagnostics.filter(
      (d) =>
        d.code === 'stoic-angular(no-class-inheritance)' &&
        d.filename.startsWith('fixtures/no-class-inheritance/'),
    );
    expect(reports).toHaveLength(1);
  });

  it('reports no-else', () => {
    const reports = diagnostics.filter(
      (d) => d.code === 'stoic-angular(no-else)' && d.filename.startsWith('fixtures/no-else/'),
    );
    expect(reports).toHaveLength(1);
  });

  it('reports no-switch', () => {
    const reports = diagnostics.filter(
      (d) => d.code === 'stoic-angular(no-switch)' && d.filename.startsWith('fixtures/no-switch/'),
    );
    expect(reports).toHaveLength(1);
  });

  it('reports prefer-inline-template (context.filename and node:fs)', () => {
    const reports = diagnostics.filter(
      (d) =>
        d.code === 'stoic-angular(prefer-inline-template)' &&
        d.filename.startsWith('fixtures/prefer-inline-template/'),
    );
    expect(reports).toHaveLength(1);
  });

  describe('--fix', () => {
    let work = '';

    beforeAll(() => {
      work = mkdtempSync(path.join(tmpdir(), 'stoic-oxlint-'));
      cpSync(path.join(here, 'fixtures'), path.join(work, 'fixtures'), { recursive: true });
      const config = readFileSync(path.join(here, '.oxlintrc.json'), 'utf-8');
      writeFileSync(
        path.join(work, '.oxlintrc.json'),
        config.replace('../../dist/index.js', distEntry),
      );
    });

    afterAll(() => {
      rmSync(work, { recursive: true, force: true });
    });

    it('rewrites templateUrl to an inline template with prefer-inline-template', () => {
      const target = 'fixtures/prefer-inline-template';
      runOxlint(work, ['--fix', target]);
      const fixed = readFileSync(path.join(work, target, 'sample.component.ts'), 'utf-8');
      expect(fixed).toContain('template: `');
      expect(fixed).toContain('<p>Hello</p>');
      expect(fixed).not.toContain('templateUrl');
    });
  });
});
