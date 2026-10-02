import type { TSESLint } from '@typescript-eslint/utils';
import type { ESLint, Linter } from 'eslint';

/** The first option of a rule, read from the `Options` type argument of its `RuleModule` */
type FirstOption<Rule> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Rule extends TSESLint.RuleModule<string, infer Options, any, any>
    ? Options extends readonly []
      ? never
      : NonNullable<Options[0]>
    : never;

/** `true` enables a rule with its default options; a rule that takes options also accepts its first option */
export type RuleSetting<Rule> = true | FirstOption<Rule>;

/** Keys are rule names; only the rules listed are enabled, always with the `error` severity */
export type ConfigureSettings<Rules> = {
  [Name in keyof Rules]?: RuleSetting<Rules[Name]>;
};

/** Builds a flat config object that registers the plugin and enables the rules listed in `settings` */
export function buildConfig(
  pluginName: string,
  plugin: object,
  settings: Readonly<Record<string, unknown>>,
): Linter.Config {
  const rules: Linter.RulesRecord = {};
  for (const [name, setting] of Object.entries(settings)) {
    if (setting === undefined) continue;
    rules[`${pluginName}/${name}`] = setting === true ? 'error' : ['error', setting as Linter.RuleSeverityAndOptions[1]];
  }
  return { plugins: { [pluginName]: plugin as ESLint.Plugin }, rules };
}
