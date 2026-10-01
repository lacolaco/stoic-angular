import tsParser from '@typescript-eslint/parser';
import { ESLint, type Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import plugin from '../../src/index';

const cwd = import.meta.dirname;

async function lintSample(config: 'recommended' | 'recommended-type-checked'): Promise<string[]> {
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ['**/*.ts'],
        languageOptions: {
          parser: tsParser,
          parserOptions: { projectService: true, tsconfigRootDir: cwd },
        },
      },
      plugin.configs[config] as Linter.Config,
    ],
  });
  const [result] = await eslint.lintFiles(['sample.component.ts']);
  return result.messages.map((message) => message.ruleId ?? '(fatal)');
}

describe('smoke test: applying the configs to an Angular sample', () => {
  it('recommended reports only rules that do not need type information', async () => {
    const ruleIds = await lintSample('recommended');
    expect(ruleIds).toContain('stoic-angular/no-else');
    expect(ruleIds).not.toContain('stoic-angular/component-signature');
    expect(ruleIds).not.toContain('stoic-angular/no-getter-setter');
    expect(ruleIds).not.toContain('(fatal)');
  });

  it('recommended-type-checked also reports rules that need type information', async () => {
    const ruleIds = await lintSample('recommended-type-checked');
    expect(ruleIds).toContain('stoic-angular/no-else');
    expect(ruleIds).toContain('stoic-angular/component-signature');
    expect(ruleIds).toContain('stoic-angular/no-getter-setter');
    expect(ruleIds).not.toContain('(fatal)');
  });
});
