/**
 * The ESLint core rules this project has chosen to offer through `configure`.
 * Add a name here and `configure` accepts it; the setting type follows from `ESLintRules`.
 */
export const coreRules = ['no-nested-ternary'] as const;

export type CoreRuleName = (typeof coreRules)[number];
