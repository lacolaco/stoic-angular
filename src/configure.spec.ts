import { describe, expect, expectTypeOf, it } from 'vitest';
import { coreRules, type CoreRuleName } from './core-rules';
import plugin, { configure, rules } from './index';
import type { ConfigureSettings, CoreRuleSetting } from './support/configure';
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

  it('enables a rule without options with only the severity', () => {
    expect(configure({ 'if-only-at-start': true }).rules).toEqual({
      'stoic-angular/if-only-at-start': 'error',
    });
  });

  it('enables no-else with only the severity', () => {
    expect(configure({ 'no-else': true }).rules).toEqual({
      'stoic-angular/no-else': 'error',
    });
  });

  it('enables no-class-inheritance with only the severity', () => {
    expect(configure({ 'no-class-inheritance': true }).rules).toEqual({
      'stoic-angular/no-class-inheritance': 'error',
    });
  });

  it('enables no-switch with only the severity', () => {
    expect(configure({ 'no-switch': true }).rules).toEqual({
      'stoic-angular/no-switch': 'error',
    });
  });

  it('enables call-or-pass with only the severity', () => {
    expect(configure({ 'call-or-pass': true }).rules).toEqual({
      'stoic-angular/call-or-pass': 'error',
    });
  });

  it('enables prefer-inline-template with and without options', () => {
    expect(configure({ 'prefer-inline-template': true }).rules).toEqual({
      'stoic-angular/prefer-inline-template': 'error',
    });
    expect(configure({ 'prefer-inline-template': { maxLines: 5 } }).rules).toEqual({
      'stoic-angular/prefer-inline-template': ['error', { maxLines: 5 }],
    });
  });

  it('enables a core rule without the plugin prefix', () => {
    expect(configure({ 'no-nested-ternary': true }).rules).toEqual({
      'no-nested-ternary': 'error',
    });
  });

  it('enables core rules and plugin rules in one call', () => {
    const config = configure({ 'no-nested-ternary': true, 'max-function-lines': { maxLines: 8 } });
    expect(config.plugins?.['stoic-angular']).toBe(plugin);
    expect(config.rules).toEqual({
      'no-nested-ternary': 'error',
      'stoic-angular/max-function-lines': ['error', { maxLines: 8 }],
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
    configure({ 'if-only-at-start': true });
    configure({ 'if-only-at-start': true, 'max-function-lines': { maxLines: 8 } });
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

  it('accepts only true for a rule without options', () => {
    // @ts-expect-error if-only-at-start has no options
    configure({ 'if-only-at-start': {} });
    // @ts-expect-error if-only-at-start has no options
    configure({ 'if-only-at-start': { maxLines: 8 } });
    // @ts-expect-error false is not a valid setting
    configure({ 'if-only-at-start': false });
  });

  it('accepts only true for no-else', () => {
    // @ts-expect-error no-else has no options
    configure({ 'no-else': {} });
    // @ts-expect-error false is not a valid setting
    configure({ 'no-else': false });
  });

  it('accepts only true for no-class-inheritance', () => {
    // @ts-expect-error no-class-inheritance has no options
    configure({ 'no-class-inheritance': {} });
    // @ts-expect-error false is not a valid setting
    configure({ 'no-class-inheritance': false });
  });

  it('accepts only true for no-switch', () => {
    // @ts-expect-error no-switch has no options
    configure({ 'no-switch': {} });
    // @ts-expect-error false is not a valid setting
    configure({ 'no-switch': false });
  });

  it('accepts only true for call-or-pass', () => {
    // @ts-expect-error call-or-pass has no options
    configure({ 'call-or-pass': {} });
    // @ts-expect-error false is not a valid setting
    configure({ 'call-or-pass': false });
  });

  it('checks the prefer-inline-template settings', () => {
    configure({ 'prefer-inline-template': true });
    configure({ 'prefer-inline-template': { maxLines: 5 } });
    // @ts-expect-error maxLines must be a number
    configure({ 'prefer-inline-template': { maxLines: '5' } });
    // @ts-expect-error false is not a valid setting
    configure({ 'prefer-inline-template': false });
  });

  it('checks the core rule settings', () => {
    configure({ 'no-nested-ternary': true });
    configure({ 'no-nested-ternary': true, 'max-function-lines': { maxLines: 8 } });
    // @ts-expect-error no-nested-ternary has no options
    configure({ 'no-nested-ternary': {} });
    // @ts-expect-error false is not a valid setting
    configure({ 'no-nested-ternary': false });
    // @ts-expect-error a core rule that is not listed in coreRules
    configure({ 'no-nested-ternary-x': true });
    // @ts-expect-error a core rule that is not listed in coreRules
    configure({ 'no-new': true });
  });

  it('returns a flat config object', () => {
    expectTypeOf(configure({})).toEqualTypeOf<Linter.Config>();
  });
});

describe('settings derived from rule definitions', () => {
  type Settings = ConfigureSettings<typeof rules, CoreRuleName>;

  it('allows only true for a rule without options', () => {
    expectTypeOf<Settings['if-only-at-start']>().toEqualTypeOf<true | undefined>();
  });

  it('allows true or the first option for a rule with options', () => {
    expectTypeOf<Settings['max-function-lines']>().toEqualTypeOf<
      true | { maxLines?: number } | undefined
    >();
  });

  it('allows only true for a core rule without options', () => {
    expectTypeOf<Settings['no-nested-ternary']>().toEqualTypeOf<true | undefined>();
  });

  it('allows true or the first option for a core rule with options', () => {
    expectTypeOf<CoreRuleSetting<'max-depth'>>().toEqualTypeOf<
      true | number | { maximum?: number; max?: number }
    >();
  });

  it('keeps plugin rule names and core rule names apart', () => {
    expectTypeOf<Extract<keyof typeof rules, CoreRuleName>>().toBeNever();
    expect(coreRules.filter((name) => name in rules)).toEqual([]);
  });

  it('only accepts known rule names', () => {
    expectTypeOf<keyof Settings>().toEqualTypeOf<
      | 'call-or-pass'
      | 'if-only-at-start'
      | 'max-function-lines'
      | 'no-class-inheritance'
      | 'no-else'
      | 'no-switch'
      | 'prefer-inline-template'
      | 'no-nested-ternary'
    >();
  });
});
