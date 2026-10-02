import type { TSESLint } from '@typescript-eslint/utils';
import type { ESLint, Linter } from 'eslint';
import type { ESLintRules } from 'eslint/rules';

/** The first option of a rule, read from the `Options` type argument of its `RuleModule` */
type FirstOption<Rule> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Rule extends TSESLint.RuleModule<string, infer Options, any, any>
    ? Options extends readonly []
      ? never
      : NonNullable<Options[0]>
    : never;

/** The first option of a core rule, read from the `Options` of its `Linter.RuleEntry<Options>` in `ESLintRules` */
type FirstCoreOption<Entry> =
  Extract<Entry, readonly unknown[]> extends readonly [unknown, ...infer Options]
    ? Options extends readonly []
      ? never
      : NonNullable<Options[0]>
    : never;

/** `true` enables a rule with its default options; a rule that takes options also accepts its first option */
export type RuleSetting<Rule> = true | FirstOption<Rule>;

/** The same as `RuleSetting`, for the ESLint core rule `Name` */
export type CoreRuleSetting<Name extends keyof ESLintRules> = true | FirstCoreOption<ESLintRules[Name]>;

/** Resolves to `never` when a plugin rule shares its name with a core rule, so that every `configure` call fails to compile */
type NoNameOverlap<Rules, CoreName> = [Extract<keyof Rules, CoreName>] extends [never] ? unknown : never;

/**
 * Keys are plugin rule names and the names of the chosen core rules; only the rules listed are enabled,
 * always with the `error` severity
 */
export type ConfigureSettings<Rules, CoreName extends keyof ESLintRules = never> = {
  [Name in keyof Rules]?: RuleSetting<Rules[Name]>;
} & {
  [Name in CoreName]?: CoreRuleSetting<Name>;
} & NoNameOverlap<Rules, CoreName>;

/** Builds a flat config object that registers the plugin and enables the rules listed in `settings`; core rules keep their names, plugin rules get the prefix */
export function buildConfig(
  pluginName: string,
  plugin: object,
  settings: Readonly<Record<string, unknown>>,
  coreRuleNames: readonly string[],
): Linter.Config {
  const rules: Linter.RulesRecord = {};
  for (const [name, setting] of Object.entries(settings)) {
    if (setting === undefined) continue;
    const key = coreRuleNames.includes(name) ? name : `${pluginName}/${name}`;
    rules[key] = setting === true ? 'error' : ['error', setting as Linter.RuleSeverityAndOptions[1]];
  }
  return { plugins: { [pluginName]: plugin as ESLint.Plugin }, rules };
}
