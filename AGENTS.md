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
- `pnpm docs`: build, then regenerate the README rules list and the rule doc headers with eslint-doc-generator
- `pnpm docs:check`: build, then fail if the generated docs are out of date
- `pnpm check:english`: enforce the language rule above

## Layout

- `src/rules/<category>/`: one rule per file, with its spec next to it (currently `functions/`)
- `src/support/`: shared helpers; every rule is created through `createRule` in `create-rule.ts`
- `src/index.ts`: the plugin object (`meta` and `rules`)
- `test/smoke/`: enables a rule in a flat config and lints a sample through the `ESLint` class
- `test/oxlint/`: runs the built plugin under oxlint (see `docs/oxlint-compatibility.md`)

## Rule metadata

A rule that uses type information sets `meta.docs.requiresTypeChecking: true`, so the docs can tell users which rules need `parserOptions` for type-aware linting.

## No preset configs

The plugin does not export `configs` (no `recommended`, no `all`). Every rule imposes a strict constraint, and users should enable each one explicitly, knowing what it constrains. Do not add preset configs.

## Commits

Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`, ...), written in English.
