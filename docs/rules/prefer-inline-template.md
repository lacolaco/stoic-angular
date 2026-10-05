# stoic-angular/prefer-inline-template

📝 Requires short templates to be inline templates instead of templateUrl.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

A short template should be an inline `template`, not a separate file referenced by `templateUrl`.

## Rule details

The rule reports a `templateUrl` property in the object passed to a `Component` decorator when both conditions hold:

- The value is a string literal. A template literal or a variable is not checked.
- The file it points to has at most `maxLines` lines (default 10). The path is resolved relative to the file being linted.

The line count is taken from the HTML file as follows: one trailing newline is dropped, then the text is split at `\n`. A one-line file ending with a newline has 1 line, and a blank line at the end of the file counts as a line. An empty file has 1 line.

The rule does not report when the referenced file cannot be read, for example because it does not exist. It also does not report a `templateUrl` outside a `Component` decorator, or an inline `template`.

A component whose template sits in a separate file makes its reader switch between two files. For a template of a few lines that cost buys nothing, so the rule asks for the template to be inline.

This is the opposite check from `@angular-eslint/component-max-inline-declarations`, which limits how long an inline template may be (its `template` option, 3 lines by default). If both rules are enabled, keep the angular-eslint `template` limit at or above `maxLines`; otherwise the autofix of this rule can produce an inline template that the other rule then reports.

### Autofix

`--fix` replaces the whole `templateUrl: '...'` property with `template: \`...\``, with these details:

- The HTML is re-indented one level (two spaces) deeper than the line that holds `templateUrl`.
- `\`, `` ` `` and `${` in the HTML are escaped.
- A file that contains only whitespace becomes an empty template literal.
- The HTML file is not deleted. Delete it yourself once nothing refers to it.
- `styleUrl` and `styleUrls` are not touched.

### How the decorator is recognized

The rule does not use type information. It reads the `import` declarations of the file and follows the same forms as [`no-declarable-private-method`](no-declarable-private-method.md#how-the-decorators-are-recognized):

- `import { Component } from '@angular/core'` with `@Component({...})`
- `import { Component as Alias } from '@angular/core'` with `@Alias({...})`
- `import * as ng from '@angular/core'` with `@ng.Component({...})`

A decorator imported from another module, a locally defined decorator with the same name, and a file that does not import from `@angular/core` are not checked.

Limitations: a decorator that is re-exported through another module is missed, because the rule does not follow imports across files. A local variable that shadows the imported name is not detected.

### Examples

Examples of incorrect code for this rule, where `card.component.html` has 3 lines:

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
})
export class Card {}
```

Examples of correct code for this rule:

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <h2>{{ title }}</h2>
    <p>{{ body }}</p>
  `,
})
export class Card {}
```

```ts
import { Component } from '@angular/core';

// report.component.html has 40 lines
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
})
export class Report {}
```

## Options

<!-- begin auto-generated rule options list -->

| Name       | Type    |
| :--------- | :------ |
| `maxLines` | Integer |

<!-- end auto-generated rule options list -->

`maxLines` is the largest line count of a referenced template that is reported. The default is 10. It must be an integer of at least 1.

```js
// eslint.config.js
import stoic from 'eslint-plugin-stoic-angular';

export default [stoic.configure({ 'prefer-inline-template': { maxLines: 5 } })];
```
