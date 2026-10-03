# stoic-angular/no-declarable-accessor

📝 Forbids getters and setters in Angular components, directives and pipes and requires signals, signal inputs or methods instead.

<!-- end auto-generated rule header -->

A component, directive or pipe class should not define getters or setters. Expose a value as a signal, a `computed` or a method, and declare an input with a signal input.

## Rule details

The rule checks class declarations decorated with `@Component({...})`, `@Directive({...})` or `@Pipe({...})` from `@angular/core` and reports every `get` and `set` accessor in them. The modifier does not matter: public, `protected`, `private`, `static` and `#private` accessors are all reported. A decorated setter such as `@Input() set value(v) {...}` is reported as well.

The report is placed on the accessor, and its message names the kind (component, directive or pipe). Methods, fields and the constructor are not reported, and neither is a method whose name looks like an accessor, such as `getValue()`.

A `private` or `#private` accessor is also reported by [`no-declarable-private-method`](no-declarable-private-method.md), so a file that enables both rules gets two reports for it.

Class expressions are not checked.

### How the decorators are recognized

The rule does not use type information. It reads the `import` declarations of the file and follows the same forms as [`no-declarable-private-method`](no-declarable-private-method.md#how-the-decorators-are-recognized):

- `import { Component } from '@angular/core'` with `@Component({...})`
- `import { Component as Alias } from '@angular/core'` with `@Alias({...})`
- `import * as ng from '@angular/core'` with `@ng.Component({...})`

A decorator imported from another module, a locally defined decorator with the same name, and a file that does not import from `@angular/core` are not checked. Only the call form `@Component({...})` is checked.

Limitations: a decorator that is re-exported through another module is missed, because the rule does not follow imports across files. A local variable that shadows the imported name is not detected.

## Options

The rule takes one optional object with three boolean keys, one per kind of class:

- `allowComponent`: allow accessors in `@Component` classes
- `allowDirective`: allow accessors in `@Directive` classes
- `allowPipe`: allow accessors in `@Pipe` classes

Every key defaults to `false`, so all three kinds are checked without options and with `{}`. Setting a key to `true` excludes that kind from the check and leaves the others checked. Other keys and non-boolean values are rejected.

With `configure`, `true` checks all three kinds, and an option object excludes the kinds you allow:

```js
// Check components, directives and pipes
stoicAngular.configure({ 'no-declarable-accessor': true });

// Check components and directives; allow accessors in pipes
stoicAngular.configure({ 'no-declarable-accessor': { allowPipe: true } });
```

With a flat config written by hand:

```js
export default [
  {
    plugins: { 'stoic-angular': stoicAngular },
    rules: {
      'stoic-angular/no-declarable-accessor': ['error', { allowPipe: true }],
    },
  },
];
```

### Examples

Examples of incorrect code for this rule:

```ts
import { Component } from '@angular/core';

@Component({ selector: 'app-cart', template: '' })
export class Cart {
  get total(): number {
    return 1;
  }
}
```

```ts
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-panel', template: '' })
export class Panel {
  @Input() set value(value: number) {}
}
```

```ts
import { Directive } from '@angular/core';

@Directive({ selector: '[appHighlight]' })
export class Highlight {
  static get defaultColor(): string {
    return 'yellow';
  }
}
```

Examples of correct code for this rule:

```ts
import { Component, computed, input } from '@angular/core';

@Component({ selector: 'app-cart', template: '' })
export class Cart {
  readonly prices = input.required<number[]>();
  protected readonly total = computed(() => this.prices().reduce((a, b) => a + b, 0));
}
```

```ts
import { Component } from '@angular/core';

@Component({ selector: 'app-cart', template: '' })
export class Cart {
  protected getTotal(): number {
    return 1;
  }
}
```

```ts
import { Component } from './my-framework';

@Component({ selector: 'app-cart', template: '' })
export class Cart {
  get total(): number {
    return 1;
  }
}
```

Examples of correct code with the option `{ allowPipe: true }`:

```ts
import { Pipe } from '@angular/core';

@Pipe({ name: 'double' })
export class DoublePipe {
  get factor(): number {
    return 2;
  }

  transform(value: number): number {
    return value * this.factor;
  }
}
```

## Why

A getter looks like a field but runs code on every read, and it caches nothing. When a template binds to it, the cost and any side effect of the getter are hidden behind a property name. A `computed` signal states the dependencies of the value and, as the [Angular documentation](https://angular.dev/guide/signals#computed-signals-are-both-lazily-evaluated-and-memoized) describes, is lazily evaluated and memoized, so an expensive derivation runs again only after a dependency changes. A setter, including a setter used as an input, runs code on assignment in the same hidden way; a signal input lets the class react to a changed input through `computed` or `effect` instead.

## Instead of accessors

Expose a derived value as a `computed`, an input as a signal input, and anything else as a method whose name says that it does work.

```ts
// Before
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-cart', template: '' })
export class Cart {
  private _prices: number[] = [];

  @Input() set prices(value: number[]) {
    this._prices = value;
  }

  get total(): number {
    return this._prices.reduce((a, b) => a + b, 0);
  }
}
```

```ts
// After
import { Component, computed, input } from '@angular/core';

@Component({ selector: 'app-cart', template: '' })
export class Cart {
  readonly prices = input.required<number[]>();
  protected readonly total = computed(() => this.prices().reduce((a, b) => a + b, 0));
}
```

## Opting out

To allow an accessor in one place, disable the rule on the member and write the reason after `--`:

```ts
// eslint-disable-next-line stoic-angular/no-declarable-accessor -- reason
```
