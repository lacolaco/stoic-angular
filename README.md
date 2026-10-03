# eslint-plugin-stoic-angular

An ESLint plugin that imposes strict design constraints on Angular projects through lint checks. Many of the rules come from the rules in the book _Five Lines of Code_ by Christian Clausen. This project is not affiliated with or endorsed by the book or its author.

## Installation

```sh
pnpm add -D eslint-plugin-stoic-angular
```

The package has not been published to npm yet.

It requires ESLint 10 (`eslint@^10.0.0`).

## Usage

### ESLint

The plugin has no preset config objects (no `configs`). It has two functions that return a flat config, and you pick the one that fits how you adopt the rules:

- `defaults(overrides?)` enables every rule at once, plugin rules and the [core rules](#core-rules) alike, with the default options. Use it to adopt the whole discipline and then change or remove what does not fit.
- `configure(settings)` enables only the rules you list. Use it to adopt the rules one by one, so that every constraint in your project is one you chose.

Both register the plugin, and the severity is always `error`. A key is a rule name without the `stoic-angular/` prefix, and an unknown name is a type error in a TypeScript config. The examples read TypeScript with the `typescript-eslint` parser.

#### `defaults`

```js
// eslint.config.js
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import stoicAngular from 'eslint-plugin-stoic-angular';

export default defineConfig({
  files: ['**/*.ts'],
  languageOptions: { parser: tsParser },
  extends: [
    stoicAngular.defaults({
      'max-function-lines': { maxLines: 8 }, // override the options
      'no-else': false, // leave the rule out
    }),
  ],
});
```

- A rule that is not listed stays enabled with its default options. A rule you add to the plugin later is enabled the same way.
- The value is the first option of the rule (an override), `true` (enabled with the default options, to make it explicit) or `false` (the rule is not enabled).
- `defaults()` without an argument enables everything.

#### `configure`

```js
export default defineConfig({
  files: ['**/*.ts'],
  languageOptions: { parser: tsParser },
  extends: [
    stoicAngular.configure({
      'max-function-lines': { maxLines: 8 },
      'no-nested-ternary': true,
    }),
  ],
});
```

- Only the rules you list are enabled.
- `true` enables a rule with its default options. A rule that takes options also accepts them as the value.
- The same call also enables the ESLint core rules listed under [Core rules](#core-rules). Their keys have no prefix, and they are enabled under their own names (`no-nested-ternary`, not `stoic-angular/no-nested-ternary`).

### oxlint

The plugin runs as an oxlint JS plugin (alpha). Load the built entry point (`dist/index.js`) with an alias in `.oxlintrc.json` and enable the rules by their prefixed names:

```json
{
  "jsPlugins": [{ "name": "stoic-angular", "specifier": "./node_modules/eslint-plugin-stoic-angular/dist/index.js" }],
  "rules": {
    "stoic-angular/max-function-lines": "error"
  }
}
```

See [oxlint compatibility](docs/oxlint-compatibility.md) for what has been verified.

## Rules

<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                                       | Description                                                                                                                     | 🔧 |
| :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ | :- |
| [call-or-pass](docs/rules/call-or-pass.md)                                 | Disallows using the same variable for both member access and argument passing.                                                  |    |
| [if-only-at-start](docs/rules/if-only-at-start.md)                         | Requires an if statement to be only at the start of a function, which does nothing else.                                        |    |
| [max-function-lines](docs/rules/max-function-lines.md)                     | Limits the number of logic lines in a function body.                                                                            |    |
| [no-class-inheritance](docs/rules/no-class-inheritance.md)                 | Forbids inheriting from classes and requires sharing implementation through delegation.                                         |    |
| [no-declarable-accessor](docs/rules/no-declarable-accessor.md)             | Forbids getters and setters in Angular components, directives and pipes and requires signals, signal inputs or methods instead. |    |
| [no-declarable-private-method](docs/rules/no-declarable-private-method.md) | Forbids private methods in Angular components, directives and pipes and requires moving the logic to collaborating objects.     |    |
| [no-else](docs/rules/no-else.md)                                           | Disallows combining if and else.                                                                                                |    |
| [no-switch](docs/rules/no-switch.md)                                       | Disallows default in switch and requires every case to end with return.                                                         |    |
| [prefer-inline-template](docs/rules/prefer-inline-template.md)             | Requires short templates to be inline templates instead of templateUrl.                                                         | 🔧 |

<!-- end auto-generated rules list -->

## Core rules

`configure` can enable the following ESLint core rules, which fit the same discipline, and `defaults` enables all of them. With `configure`, each one is opt-in, like the plugin rules.

- [`no-nested-ternary`](https://eslint.org/docs/latest/rules/no-nested-ternary): Disallows nested ternary expressions.
- [`complexity`](https://eslint.org/docs/latest/rules/complexity): Limits the cyclomatic complexity of a function. `true` keeps ESLint's default limit of 20; pass a number, for example `complexity: 5`, for a stricter one.
- [`no-sequences`](https://eslint.org/docs/latest/rules/no-sequences): Disallows the comma operator, so that several expressions cannot be packed into one statement. `true` keeps ESLint's default, which allows a sequence in explicit parentheses; pass `{ allowInParentheses: false }` to forbid those too.

## License

[MIT](LICENSE)
