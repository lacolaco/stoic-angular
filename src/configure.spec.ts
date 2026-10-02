import { describe, expect, expectTypeOf, it } from 'vitest';
import plugin, { configure, rules } from './index';
import type { ConfigureSettings } from './support/configure';
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

  it('enables prefer-inline-template with and without options', () => {
    expect(configure({ 'prefer-inline-template': true }).rules).toEqual({
      'stoic-angular/prefer-inline-template': 'error',
    });
    expect(configure({ 'prefer-inline-template': { maxLines: 5 } }).rules).toEqual({
      'stoic-angular/prefer-inline-template': ['error', { maxLines: 5 }],
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

  it('checks the prefer-inline-template settings', () => {
    configure({ 'prefer-inline-template': true });
    configure({ 'prefer-inline-template': { maxLines: 5 } });
    // @ts-expect-error maxLines must be a number
    configure({ 'prefer-inline-template': { maxLines: '5' } });
    // @ts-expect-error false is not a valid setting
    configure({ 'prefer-inline-template': false });
  });

  it('returns a flat config object', () => {
    expectTypeOf(configure({})).toEqualTypeOf<Linter.Config>();
  });
});

describe('settings derived from rule definitions', () => {
  type Settings = ConfigureSettings<typeof rules>;

  it('allows only true for a rule without options', () => {
    expectTypeOf<Settings['if-only-at-start']>().toEqualTypeOf<true | undefined>();
  });

  it('allows true or the first option for a rule with options', () => {
    expectTypeOf<Settings['max-function-lines']>().toEqualTypeOf<
      true | { maxLines?: number } | undefined
    >();
  });

  it('only accepts known rule names', () => {
    expectTypeOf<keyof Settings>().toEqualTypeOf<
      'if-only-at-start' | 'max-function-lines' | 'no-else' | 'prefer-inline-template'
    >();
  });
});
