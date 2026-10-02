# stoic-angular/no-component-private-method

📝 Forbids private methods in Angular components and requires moving the logic to collaborating objects.

<!-- end auto-generated rule header -->

A component class should not have private methods. Move the logic to a collaborating object such as a service or a plain function, and keep the component to binding the template.

This rule is one of three that apply the same check to different decorators: [no-component-private-method](no-component-private-method.md) for `@Component`, [no-directive-private-method](no-directive-private-method.md) for `@Directive`, and [no-pipe-private-method](no-pipe-private-method.md) for `@Pipe`. Enable the ones that match your project.

## Rule details

The rule checks class declarations decorated with `@Component({...})` from `@angular/core` and reports these members:

- Methods with the TypeScript `private` modifier or a `#private` name, including `get` and `set` accessors. `constructor` is not reported.
- Fields with the `private` modifier or a `#private` name whose initial value is an arrow function or a function expression.

The report is placed on the member. `protected` and public members are allowed, and so are private fields whose value is not a function (for example `private readonly label = 'a'`).

Class expressions are not checked.

### How `@Component` is recognized

The rule does not use type information. It reads the `import` declarations of the file and follows these forms:

- `import { Component } from '@angular/core'` with `@Component({...})`
- `import { Component as Alias } from '@angular/core'` with `@Alias({...})`
- `import * as ng from '@angular/core'` with `@ng.Component({...})`

A `Component` imported from another module, a locally defined `Component`, and a file that does not import from `@angular/core` are not checked. Only the call form `@Component({...})` is checked.

Limitations: a `Component` that is re-exported through another module (for example `export { Component } from '@angular/core'` in a shared file) is missed, because the rule does not follow imports across files. A local variable that shadows the imported name is not detected.

The rule has no options.

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
import { Component } from '@angular/core';

@Component({ selector: 'app-panel', template: '' })
export class Panel {
  private readonly tally = (): number => 1;
}
```

```ts
import * as ng from '@angular/core';

@ng.Component({ selector: 'app-panel', template: '' })
export class Panel {
  #tally(): number {
    return 1;
  }
}
```

Examples of correct code for this rule:

```ts
import { Component } from '@angular/core';

@Component({ selector: 'app-panel', template: '' })
export class Panel {
  private readonly label = 'panel';
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

## Why

The class of a component is where the framework meets your code. When it only binds the template and delegates the work, the logic lives in objects and functions that can be tested and reused without the framework. A private method keeps logic behind a boundary that tests cannot reach directly, so it tends to stay inside the component.

## Instead of private methods

Move the logic to a service or a function, and call it from the component.

```ts
// Before
import { Component } from '@angular/core';

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
import { Component } from '@angular/core';

export function sum(values: number[]): number {
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
// eslint-disable-next-line stoic-angular/no-component-private-method -- reason
```
