# AGENTS.md

`eslint-plugin-stoic-angular` is an open source ESLint plugin for Angular projects. Its rules impose strict design constraints (function length, branching, inheritance, naming, Angular class design) through lint checks.

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
- `pnpm check:english`: enforce the language rule above

## Layout

- `src/rules/{angular,classes,functions,structure}/`: one rule per file, with its spec next to it
- `src/support/`: shared helpers; every rule is created through `createRule` in `create-rule.ts`
- `src/index.ts`: the plugin object and its `recommended` and `recommended-type-checked` configs
- `test/smoke/`: applies both configs to an Angular sample through the `ESLint` class

## Rule metadata

A rule that uses type information sets `meta.docs.requiresTypeChecking: true`. The configs are derived from that flag: `recommended` contains only rules without it, and `recommended-type-checked` contains all rules. Do not maintain a separate list.

## Commits

Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`, ...), written in English.
