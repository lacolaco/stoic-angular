# stoic-angular/no-extra-exports

📝 Requires a file that exports a class decorated with an Angular decorator to export nothing else.

<!-- end auto-generated rule header -->

A file that exports an Angular class should export nothing else. Put the class in a file of its own, and put every other thing you publish, such as a type, a constant or a helper function, in its own file as well.

## Rule details

The rule applies to a file that exports a class decorated with `@Component({...})`, `@Directive({...})`, `@Pipe({...})`, `@Injectable({...})`, `@NgModule({...})` or `@Service({...})` from `@angular/core`. In such a file it keeps the first decorated class that is exported, in the order of the exports, and reports every other export:

- Exported values, functions, classes and enums
- Exported types: `export type`, `export interface` and `export type { T }`
- The other names of an export list such as `export { a, b }`
- Re-exports: `export { x } from '...'`, `export * from '...'` and `export * as ns from '...'`
- Another `export default`
- A second exported decorated class, and a second export of the kept class (for example `export { Panel as Widget }` after `export class Panel`)

The kept class can be exported in any of these forms: `export class X`, `export default class X`, `class X {}` with `export { X }` or `export default X`, and `export { X as Y }`.

The report is placed on the extra export declaration, or on the specifier when the extra name is part of an export list. An empty `export {}` is not reported.

Declarations that are not exported are allowed, such as local functions, constants, types and enums. A file that does not export a decorated class is not checked.

### How the decorators are recognized

The rule does not use type information. It reads the `import` declarations of the file and follows these forms, shown for `Component`:

- `import { Component } from '@angular/core'` with `@Component({...})`
- `import { Component as Alias } from '@angular/core'` with `@Alias({...})`
- `import * as ng from '@angular/core'` with `@ng.Component({...})`

A decorator imported from another module, a locally defined decorator with the same name, and a file that does not import from `@angular/core` are not checked. Only the call form `@Component({...})` is checked.

Limitations: a decorator that is re-exported through another module (for example `export { Component } from '@angular/core'` in a shared file) is missed, because the rule does not follow imports across files. A local variable that shadows the imported name is not detected. See also [`no-declarable-private-method`](no-declarable-private-method.md), which recognizes decorators the same way.

### Examples

Examples of incorrect code for this rule:

```ts
import { Component } from '@angular/core';

export type PanelMode = 'compact' | 'wide';

@Component({ selector: 'app-panel', template: '' })
export class Panel {}
```

```ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Cart {}

export function totalOf(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
```

```ts
import { Component, Directive } from '@angular/core';

@Component({ selector: 'app-panel', template: '' })
export class Panel {}

@Directive({ selector: '[appHighlight]' })
export class Highlight {}
```

Examples of correct code for this rule:

```ts
import { Component } from '@angular/core';

type PanelMode = 'compact' | 'wide';

function labelOf(mode: PanelMode): string {
  return mode;
}

@Component({ selector: 'app-panel', template: '' })
export class Panel {
  protected readonly label = labelOf('wide');
}
```

```ts
import { Component } from '@angular/core';

@Component({ selector: 'app-panel', template: '' })
class Panel {}

export { Panel };
```

```ts
export type PanelMode = 'compact' | 'wide';

export function totalOf(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
```

## Why

When a file holds one Angular class and exports only that class, the role of the file and the target of an `import` are unambiguous. The types and helper functions that other files use are published from files of their own.

## Instead of extra exports

Move each extra export to its own file and import it where it is used.

```ts
// Before: panel.ts
import { Component } from '@angular/core';

export type PanelMode = 'compact' | 'wide';

@Component({ selector: 'app-panel', template: '' })
export class Panel {}
```

```ts
// After: panel-mode.ts
export type PanelMode = 'compact' | 'wide';
```

```ts
// After: panel.ts
import { Component } from '@angular/core';

@Component({ selector: 'app-panel', template: '' })
export class Panel {}
```

## Opting out

To allow an extra export in one place, disable the rule on the export and write the reason after `--`:

```ts
// eslint-disable-next-line stoic-angular/no-extra-exports -- reason
```
