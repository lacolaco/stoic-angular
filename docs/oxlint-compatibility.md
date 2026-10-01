# oxlint compatibility

Verified with oxlint 1.86.0 (JS plugins, alpha) on Node.js 22. The built plugin (`dist/index.js`) is loaded through `jsPlugins` and run against fixtures that violate each rule.

## Result for the rules without type information

All 11 rules in the `recommended` config load and report violations. No rule needed a code change.

| Rule | Works | APIs exercised |
| --- | --- | --- |
| `call-or-pass` | yes | `sourceCode.scopeManager`, function head location |
| `if-only-at-start` | yes | AST traversal |
| `max-function-lines` | yes | rule options, `sourceCode` |
| `no-else` | yes | AST traversal |
| `no-switch` | yes | AST traversal |
| `pure-conditions` | yes | AST traversal |
| `no-class-inheritance` | yes | AST traversal |
| `no-common-affixes` | yes | `sourceCode.scopeManager` |
| `max-directory-entries` | yes | `context.filename`, `node:fs` |
| `vm-signature` | yes | TypeScript syntax (type annotations) |
| `inline-short-templates` | yes | `context.filename`, `node:fs`, autofix |

Other findings:

- Rules created with `ESLintUtils.RuleCreator` from `@typescript-eslint/utils` run unchanged; no `eslintCompatPlugin` wrapper is needed.
- `--fix` works: `inline-short-templates` replaces `templateUrl` with an inline `template`. The rule's message asks the user to delete the now unused HTML file, and the fix does not do that.
- The plugin is loaded with an alias (`{ "name": "stoic-angular", "specifier": ... }`), so diagnostics appear as `stoic-angular(<rule>)` and rules are configured as `stoic-angular/<rule>`.
- The 7 rules that need type information are not covered here; oxlint JS plugins have no type information.

## How to verify

```sh
pnpm test test/oxlint
```

The spec builds the plugin (`pnpm build`), runs the oxlint CLI over `test/oxlint/fixtures/` with `test/oxlint/.oxlintrc.json`, and asserts one test per rule. A further test copies the fixtures to a temporary directory and runs `oxlint --fix`.

To try it by hand:

```sh
pnpm build
cd test/oxlint
npx oxlint -c .oxlintrc.json fixtures
```
