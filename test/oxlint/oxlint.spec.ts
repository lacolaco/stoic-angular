import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const oxlintBin = path.join(root, 'node_modules/.bin/oxlint');

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

  it('reports no-else', () => {
    const reports = diagnostics.filter(
      (d) => d.code === 'stoic-angular(no-else)' && d.filename.startsWith('fixtures/no-else/'),
    );
    expect(reports).toHaveLength(1);
  });
});
