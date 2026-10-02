import { describe, expect, expectTypeOf, it } from 'vitest';
import plugin, { configure } from './index';
import type { ConfigureSettings } from './support/configure';
import type { TSESLint } from '@typescript-eslint/utils';
import type { Linter } from 'eslint';

describe('configure', () => {
  it('is exposed on the plugin object', () => {
    expect(plugin.configure).toBe(configure);
  });

  it('registers the plugin and enables nothing for empty settings', () => {
    const config = configure({});
    expect(config.plugins?.['stoic-angular']).toBe(plugin);
    expect(config.rules).toEqual({});
  });

  it('enables a rule with only the severity for true', () => {
    expect(configure({ 'max-function-lines': true }).rules).toEqual({
      'stoic-angular/max-function-lines': 'error',
    });
  });

  it('passes the options after the severity', () => {
    expect(configure({ 'max-function-lines': { maxLines: 8 } }).rules).toEqual({
      'stoic-angular/max-function-lines': ['error', { maxLines: 8 }],
    });
  });
});

describe('configure settings types', () => {
  it('accepts valid settings', () => {
    configure({});
    configure({ 'max-function-lines': true });
    configure({ 'max-function-lines': {} });
    configure({ 'max-function-lines': { maxLines: 8 } });
  });

  it('rejects unknown rule names', () => {
    // @ts-expect-error unknown rule name
    configure({ 'no-such-rule': true });
  });

  it('rejects invalid options', () => {
    // @ts-expect-error maxLines must be a number
    configure({ 'max-function-lines': { maxLines: 'eight' } });
    // @ts-expect-error unknown option key
    configure({ 'max-function-lines': { maxLine: 8 } });
    // @ts-expect-error false is not a valid setting
    configure({ 'max-function-lines': false });
  });

  it('returns a flat config object', () => {
    expectTypeOf(configure({})).toEqualTypeOf<Linter.Config>();
  });
});

describe('settings derived from rule definitions', () => {
  type Rule<Options extends readonly unknown[]> = TSESLint.RuleModule<'message', Options>;
  type Rules = {
    'no-options': Rule<[]>;
    'with-options': Rule<[{ limit?: number }?]>;
  };
  type Settings = ConfigureSettings<Rules>;

  it('allows only true for a rule without options', () => {
    expectTypeOf<Settings['no-options']>().toEqualTypeOf<true | undefined>();
  });

  it('allows true or the first option for a rule with options', () => {
    expectTypeOf<Settings['with-options']>().toEqualTypeOf<true | { limit?: number } | undefined>();
  });

  it('only accepts known rule names', () => {
    expectTypeOf<keyof Settings>().toEqualTypeOf<'no-options' | 'with-options'>();
  });
});
