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

Add the `recommended` config to your flat config. This example reads TypeScript with the `typescript-eslint` parser.

```js
// eslint.config.js
import tsParser from '@typescript-eslint/parser';
import stoicAngular from 'eslint-plugin-stoic-angular';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser },
  },
  stoicAngular.configs.recommended,
];
```

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

💼 Configurations enabled in.\
✅ Set in the `recommended` configuration.

| Name                                                   | Description                                          | 💼 |
| :----------------------------------------------------- | :--------------------------------------------------- | :- |
| [max-function-lines](docs/rules/max-function-lines.md) | Limits the number of logic lines in a function body. | ✅  |

<!-- end auto-generated rules list -->

## License

[MIT](LICENSE)
