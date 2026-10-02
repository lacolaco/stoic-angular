# oxlint compatibility

Verified with oxlint 1.86.0 (JS plugins, alpha) on Node.js 22. The built plugin (`dist/index.js`) is loaded through `jsPlugins` and run against a fixture that violates the rule.

## Result

| Rule | Works | APIs exercised |
| --- | --- | --- |
| `call-or-pass` | yes | `sourceCode.scopeManager` (`variables`, `references`), `getFunctionHeadLocation` |
| `if-only-at-start` | yes | `sourceCode.getFirstToken` |
| `max-function-lines` | yes | rule options, `sourceCode` |
| `no-class-inheritance` | yes | `ClassDeclaration` and `ClassExpression` nodes |
| `no-else` | yes | `sourceCode.getFirstToken` |
| `no-switch` | yes | `SwitchStatement` and `SwitchCase` nodes |
| `prefer-inline-template` | yes | `context.filename`, `node:fs`, `--fix` |

Other findings:

- Rules created with `ESLintUtils.RuleCreator` from `@typescript-eslint/utils` run unchanged; no `eslintCompatPlugin` wrapper is needed.
- The plugin is loaded with an alias (`{ "name": "stoic-angular", "specifier": ... }`), so diagnostics appear as `stoic-angular(<rule>)` and rules are configured as `stoic-angular/<rule>`.
- oxlint JS plugins have no type information, so rules that need it cannot run there.

## How to verify

```sh
pnpm test test/oxlint
```

The spec builds the plugin (`pnpm build`), runs the oxlint CLI over `test/oxlint/fixtures/` with `test/oxlint/.oxlintrc.json`, and asserts that the rule reports and that no internal error occurs.

To try it by hand:

```sh
pnpm build
cd test/oxlint
npx oxlint -c .oxlintrc.json fixtures
```
