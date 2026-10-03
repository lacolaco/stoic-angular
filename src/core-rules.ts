import type { ESLintRules } from 'eslint/rules';

/** The core rule names declared in `ESLintRules`, without its index signature, so that a misspelled name is a compile error */
type KnownCoreRuleName = keyof { [Name in keyof ESLintRules as string extends Name ? never : Name]: unknown };

/**
 * The ESLint core rules this project has chosen to offer through `configure`.
 * Add a name here and `configure` accepts it; the setting type follows from `ESLintRules`.
 */
export const coreRules = ['no-nested-ternary', 'complexity', 'no-sequences'] as const satisfies readonly KnownCoreRuleName[];

export type CoreRuleName = (typeof coreRules)[number];
