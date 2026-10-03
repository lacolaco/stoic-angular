# AGENTS.md

`eslint-plugin-stoic-angular` is an open source ESLint plugin for Angular projects. Its rules impose strict design constraints on code through lint checks.

## Language

Everything in this repository and everything published from it is written in English. Japanese is not allowed anywhere on the public surface:

- Source code, identifiers, string literals, and comments
- Rule messages and `meta.docs.description`
- Test names, test code, and fixtures
- Documentation, README, and configuration files
- Commit messages, pull request titles and bodies, issues, and review comments

`pnpm check:english` scans every tracked file and fails on hiragana, katakana, CJK ideographs, or full-width forms. Run it after `git add` and before committing; it only sees tracked files.

## Commands

- `pnpm build`: compile `src/` to `dist/`
- `pnpm typecheck`: type-check the whole repository
- `pnpm test`: run the rule specs and the smoke test with vitest
- `pnpm docs:generate`: build, then regenerate the README rules list and the rule doc headers with eslint-doc-generator
- `pnpm docs:check`: build, then fail if the generated docs are out of date
- `pnpm check:english`: enforce the language rule above

## Layout

- `src/rules/<category>/`: one rule per file, with its spec next to it (currently `functions/`, `classes/` and `angular/`)
- `src/support/`: shared helpers; every rule is created through `createRule` in `create-rule.ts`
- `src/index.ts`: the plugin object (`meta`, `rules` and `configure`)
- `src/core-rules.ts`: the ESLint core rules that `configure` can enable (`coreRules`)
- `src/support/configure.ts`: the types and the builder behind `configure`
- `test/smoke/`: enables a rule in a flat config and lints a sample through the `ESLint` class
- `test/oxlint/`: runs the built plugin under oxlint (see `docs/oxlint-compatibility.md`)

## Rule metadata

A rule that uses type information sets `meta.docs.requiresTypeChecking: true`, so the docs can tell users which rules need `parserOptions` for type-aware linting.

## No preset configs

The plugin does not export `configs` (no `recommended`, no `all`). Every rule imposes a strict constraint, and users should know what they enable. Do not add preset config objects.

There are two ways to enable rules, and both are functions on the plugin object (and named exports):

- `configure(settings)` enables only the chosen rules.
- `defaults(overrides?)` enables every plugin rule and every core rule in `coreRules` with its default options. `overrides` changes the options of a rule, or leaves it out with `false`.

Adding a rule to `rules`, or a core rule to `coreRules`, reaches both automatically. Do not list rule names by hand in either function.

## `configure`

`plugin.configure(settings)` returns a flat config that registers the plugin and enables only the listed rules, always as `error`. Its `settings` type is derived from `typeof rules` in `src/index.ts` and from each rule's `RuleModule` type arguments: the keys are the rule names, and a value is `true` or the rule's first option. Adding a rule to `rules` is therefore all `configure` needs; do not write per-rule types by hand. `src/configure.spec.ts` checks the types.

### `defaults`

`plugin.defaults(overrides)` is built on the same pieces as `configure`. Its `overrides` type is `DefaultsOverrides`, which is `ConfigureSettings` with `false` added to every value, so it is derived and never written per rule. `false` leaves the rule out of `rules` instead of writing `'off'`, so that the output only lists enabled rules. `src/configure.spec.ts` checks the runtime behavior and the types.

### Core rules

`configure` and `defaults` also enable ESLint core rules, chosen one by one. A core rule is keyed by its own name and written without a prefix (`'no-nested-ternary': 'error'`). Only add a core rule that fits this project's discipline; do not add one just because it is popular.

To add one, append its name to `coreRules` in `src/core-rules.ts`. The setting type follows from `ESLintRules` (`eslint/rules`): the options are read from its `Linter.RuleEntry<Options>`, so do not write them by hand. A name shared with a plugin rule makes `ConfigureSettings` resolve to `never`, so the clash fails to compile. Then add the rule to the "Core rules" list in `README.md` (outside the generated section, so write it by hand) and cover it in `src/configure.spec.ts` and the smoke test.

## Commits

Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`, ...), written in English.
