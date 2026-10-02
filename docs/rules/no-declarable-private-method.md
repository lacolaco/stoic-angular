# stoic-angular/no-declarable-private-method

📝 Forbids private methods in Angular components, directives and pipes and requires moving the logic to collaborating objects.

<!-- end auto-generated rule header -->

A component, directive or pipe class should not have private methods. Move the logic to a collaborating object such as a service or a plain function, and keep the class to its role in the framework: binding the template, reacting to the host element, or transforming a value.

## Rule details

The rule checks class declarations decorated with `@Component({...})`, `@Directive({...})` or `@Pipe({...})` from `@angular/core` and reports these members:

- Methods with the TypeScript `private` modifier or a `#private` name, including `get` and `set` accessors. `constructor` is not reported. To forbid accessors of every modifier, see [`no-declarable-accessor`](no-declarable-accessor.md).

The report is placed on the member, and its message names the kind (component, directive or pipe). `protected` and public members are allowed, and so are private fields, including fields whose value is a function (for example `private readonly toggle = () => ...`).

Class expressions are not checked.

### How the decorators are recognized

The rule does not use type information. It reads the `import` declarations of the file and follows these forms, shown for `Component`:

- `import { Component } from '@angular/core'` with `@Component({...})`
- `import { Component as Alias } from '@angular/core'` with `@Alias({...})`
- `import * as ng from '@angular/core'` with `@ng.Component({...})`

A decorator imported from another module, a locally defined decorator with the same name, and a file that does not import from `@angular/core` are not checked. Only the call form `@Component({...})` is checked.

Limitations: a decorator that is re-exported through another module (for example `export { Component } from '@angular/core'` in a shared file) is missed, because the rule does not follow imports across files. A local variable that shadows the imported name is not detected.

## Options

The rule takes one optional object with three boolean keys, one per kind of class:

- `allowComponent`: allow private methods in `@Component` classes
- `allowDirective`: allow private methods in `@Directive` classes
- `allowPipe`: allow private methods in `@Pipe` classes

Every key defaults to `false`, so all three kinds are checked without options and with `{}`. Setting a key to `true` excludes that kind from the check and leaves the others checked. Other keys and non-boolean values are rejected.

With `configure`, `true` checks all three kinds, and an option object excludes the kinds you allow:

```js
// Check components, directives and pipes
stoicAngular.configure({ 'no-declarable-private-method': true });

// Check components and directives; allow private methods in pipes
stoicAngular.configure({ 'no-declarable-private-method': { allowPipe: true } });
```

With a flat config written by hand:

```js
export default [
  {
    plugins: { 'stoic-angular': stoicAngular },
    rules: {
      'stoic-angular/no-declarable-private-method': ['error', { allowPipe: true }],
    },
  },
];
```

### Examples

Examples of incorrect code for this rule:

```ts
import { Component } from '@angular/core';

@Component({ selector: 'app-panel', template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}
```

```ts
import { Directive } from '@angular/core';

@Directive({ selector: '[appHighlight]' })
export class Highlight {
  private get tally(): number {
    return 1;
  }
}
```

```ts
import * as ng from '@angular/core';

@ng.Pipe({ name: 'double' })
export class DoublePipe {
  transform(value: number): number {
    return this.twice(value);
  }

  #twice(value: number): number {
    return value * 2;
  }
}
```

Examples of correct code for this rule:

```ts
import { Component } from '@angular/core';

@Component({ selector: 'app-panel', template: '' })
export class Panel {
  private readonly label = 'panel';
  private readonly toggle = (): void => {};
  protected tally(): number {
    return 1;
  }
}
```

```ts
import { Component } from './my-framework';

@Component({ selector: 'app-panel', template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}
```

Examples of correct code with the option `{ allowDirective: true }`:

```ts
import { Directive } from '@angular/core';

@Directive({ selector: '[appHighlight]' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}
```

## Why

The class of a component, directive or pipe is where the framework meets your code. When it only plays its role and delegates the work, the logic lives in objects and functions that can be tested and reused without the framework. A private method keeps logic behind a boundary that tests cannot reach directly, so it tends to stay inside the class.

## Instead of private methods

Move the logic to a service or a function, and call it from the class.

```ts
// Before
import { Component, signal } from '@angular/core';

@Component({ selector: 'app-cart', template: '' })
export class Cart {
  items = signal<number[]>([]);

  protected total(): number {
    return this.sum(this.items());
  }

  private sum(values: number[]): number {
    return values.reduce((a, b) => a + b, 0);
  }
}
```

```ts
// After
import { Component, signal } from '@angular/core';

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

@Component({ selector: 'app-cart', template: '' })
export class Cart {
  items = signal<number[]>([]);

  protected total(): number {
    return sum(this.items());
  }
}
```

## Opting out

To allow a private method in one place, disable the rule on the member and write the reason after `--`:

```ts
// eslint-disable-next-line stoic-angular/no-declarable-private-method -- reason
```
