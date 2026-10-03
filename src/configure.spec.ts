import { describe, expect, expectTypeOf, it } from 'vitest';
import { coreRules, type CoreRuleName } from './core-rules';
import plugin, { configure, defaults, rules } from './index';
import type { ConfigureSettings, CoreRuleSetting, DefaultsOverrides } from './support/configure';
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

  it('enables no-inline-union with only the severity', () => {
    expect(configure({ 'no-inline-union': true }).rules).toEqual({
      'stoic-angular/no-inline-union': 'error',
    });
  });

  it('accepts only true for no-inline-union', () => {
    // @ts-expect-error no-inline-union has no options
    configure({ 'no-inline-union': {} });
    // @ts-expect-error false is not a valid setting
    configure({ 'no-inline-union': false });
  });

  it('enables no-declarable-accessor with only the severity', () => {
    expect(configure({ 'no-declarable-accessor': true }).rules).toEqual({
      'stoic-angular/no-declarable-accessor': 'error',
    });
  });

  it('passes the option of no-declarable-accessor through', () => {
    expect(configure({ 'no-declarable-accessor': { allowPipe: true } }).rules).toEqual({
      'stoic-angular/no-declarable-accessor': ['error', { allowPipe: true }],
    });
  });

  it('enables no-declarable-private-method with only the severity', () => {
    expect(configure({ 'no-declarable-private-method': true }).rules).toEqual({
      'stoic-angular/no-declarable-private-method': 'error',
    });
  });

  it('passes the option of no-declarable-private-method through', () => {
    expect(configure({ 'no-declarable-private-method': { allowPipe: true } }).rules).toEqual({
      'stoic-angular/no-declarable-private-method': ['error', { allowPipe: true }],
    });
  });

  it('enables no-extra-exports with only the severity', () => {
    expect(configure({ 'no-extra-exports': true }).rules).toEqual({
      'stoic-angular/no-extra-exports': 'error',
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

  it('accepts boolean keys for the kinds of no-declarable-accessor', () => {
    configure({ 'no-declarable-accessor': true });
    configure({ 'no-declarable-accessor': { allowPipe: true } });
    configure({ 'no-declarable-accessor': {} });
    // @ts-expect-error the key is allowPipe, not pipe
    configure({ 'no-declarable-accessor': { pipe: true } });
    // @ts-expect-error the value must be a boolean
    configure({ 'no-declarable-accessor': { allowPipe: 'yes' } });
    // @ts-expect-error false is not a valid setting
    configure({ 'no-declarable-accessor': false });
  });

  it('accepts boolean keys for the kinds of no-declarable-private-method', () => {
    configure({ 'no-declarable-private-method': true });
    configure({ 'no-declarable-private-method': { allowPipe: true } });
    configure({ 'no-declarable-private-method': {} });
    // @ts-expect-error the key is allowPipe, not pipe
    configure({ 'no-declarable-private-method': { pipe: true } });
    // @ts-expect-error the value must be a boolean
    configure({ 'no-declarable-private-method': { allowPipe: 'yes' } });
    // @ts-expect-error false is not a valid setting
    configure({ 'no-declarable-private-method': false });
  });

  it('accepts only true for no-extra-exports', () => {
    // @ts-expect-error no-extra-exports has no options
    configure({ 'no-extra-exports': {} });
    // @ts-expect-error false is not a valid setting
    configure({ 'no-extra-exports': false });
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
    configure({ complexity: true });
    configure({ complexity: 5 });
    configure({ complexity: { max: 5 } });
    // @ts-expect-error complexity takes a number or an object
    configure({ complexity: 'five' });
    configure({ 'no-sequences': true });
    configure({ 'no-sequences': { allowInParentheses: false } });
    // @ts-expect-error no-sequences has no such option
    configure({ 'no-sequences': { allowAnywhere: true } });
  });

  it('enables complexity and no-sequences without a prefix', () => {
    expect(configure({ complexity: 5, 'no-sequences': true }).rules).toEqual({
      complexity: ['error', 5],
      'no-sequences': 'error',
    });
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
      | 'no-declarable-accessor'
      | 'no-declarable-private-method'
      | 'no-else'
      | 'no-extra-exports'
      | 'no-inline-union'
      | 'no-switch'
      | 'prefer-inline-template'
      | 'no-nested-ternary'
      | 'complexity'
      | 'no-sequences'
    >();
  });
});

describe('defaults', () => {
  const pluginRuleKeys = Object.keys(rules).map((name) => `stoic-angular/${name}`);
  const allKeys = [...pluginRuleKeys, ...coreRules].sort();

  it('includes no-inline-union', () => {
    expect(defaults().rules).toHaveProperty(['stoic-angular/no-inline-union'], 'error');
  });

  it('is exposed on the plugin object', () => {
    expect(plugin.defaults).toBe(defaults);
  });

  it('registers the plugin and enables every plugin rule and core rule as error', () => {
    const config = defaults();
    expect(config.plugins?.['stoic-angular']).toBe(plugin);
    expect(Object.keys(config.rules ?? {}).sort()).toEqual(allKeys);
    expect(Object.values(config.rules ?? {}).every((value) => value === 'error')).toBe(true);
  });

  it('writes core rules without the plugin prefix', () => {
    for (const name of coreRules) {
      expect(defaults().rules).toHaveProperty([name], 'error');
      expect(defaults().rules).not.toHaveProperty([`stoic-angular/${name}`]);
    }
  });

  it('treats an empty object and true like no override', () => {
    expect(defaults({})).toEqual(defaults());
    expect(defaults({ 'no-else': true, 'no-nested-ternary': true })).toEqual(defaults());
  });

  it('replaces the options of the rule that is overridden', () => {
    const config = defaults({ 'max-function-lines': { maxLines: 8 } });
    expect(config.rules?.['stoic-angular/max-function-lines']).toEqual(['error', { maxLines: 8 }]);
    expect(config.rules?.['stoic-angular/no-else']).toBe('error');
    expect(Object.keys(config.rules ?? {}).sort()).toEqual(allKeys);
  });

  it('leaves a rule out of rules for false, without writing off', () => {
    const config = defaults({ 'no-else': false, 'no-nested-ternary': false });
    expect(config.rules).not.toHaveProperty(['stoic-angular/no-else']);
    expect(config.rules).not.toHaveProperty(['no-nested-ternary']);
    expect(Object.values(config.rules ?? {})).not.toContain('off');
    expect(Object.keys(config.rules ?? {}).sort()).toEqual(
      allKeys.filter((key) => key !== 'stoic-angular/no-else' && key !== 'no-nested-ternary'),
    );
  });

  it('does not change configure', () => {
    expect(() => configure({})).not.toThrow();
    expect(configure({}).rules).toEqual({});
  });
});

describe('defaults overrides types', () => {
  it('accepts true, the first option and false', () => {
    defaults();
    defaults({});
    defaults({ 'no-else': false });
    defaults({ 'no-else': true });
    defaults({ 'max-function-lines': { maxLines: 8 }, 'no-nested-ternary': false });
    defaults({ 'no-else': false, 'max-function-lines': { maxLines: 8 } });
  });

  it('rejects unknown names and invalid options', () => {
    // @ts-expect-error unknown rule name
    defaults({ 'no-such-rule': false });
    // @ts-expect-error a core rule that is not listed in coreRules
    defaults({ 'no-new': false });
    // @ts-expect-error maxLines must be a number
    defaults({ 'max-function-lines': { maxLines: 'eight' } });
    // @ts-expect-error no-else has no options
    defaults({ 'no-else': {} });
  });

  it('returns a flat config object', () => {
    expectTypeOf(defaults()).toEqualTypeOf<Linter.Config>();
  });

  it('adds false to the settings of configure', () => {
    type Overrides = DefaultsOverrides<typeof rules, CoreRuleName>;
    expectTypeOf<Overrides['no-else']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Overrides['max-function-lines']>().toEqualTypeOf<
      boolean | { maxLines?: number } | undefined
    >();
    expectTypeOf<Overrides['no-nested-ternary']>().toEqualTypeOf<boolean | undefined>();
  });

  it('only accepts the same rule names as configure', () => {
    expectTypeOf<keyof DefaultsOverrides<typeof rules, CoreRuleName>>().toEqualTypeOf<
      keyof ConfigureSettings<typeof rules, CoreRuleName>
    >();
  });
});
