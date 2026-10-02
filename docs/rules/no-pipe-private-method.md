# stoic-angular/no-pipe-private-method

📝 Forbids private methods in Angular pipes and requires moving the logic to collaborating objects.

<!-- end auto-generated rule header -->

A pipe class should not have private methods. Move the logic to a collaborating object such as a service or a plain function, and keep the pipe to its `transform` method.

This rule is one of three that apply the same check to different decorators: [no-component-private-method](no-component-private-method.md) for `@Component`, [no-directive-private-method](no-directive-private-method.md) for `@Directive`, and [no-pipe-private-method](no-pipe-private-method.md) for `@Pipe`. Enable the ones that match your project.

## Rule details

The rule checks class declarations decorated with `@Pipe({...})` from `@angular/core` and reports these members:

- Methods with the TypeScript `private` modifier or a `#private` name, including `get` and `set` accessors. `constructor` is not reported.
- Fields with the `private` modifier or a `#private` name whose initial value is an arrow function or a function expression.

The report is placed on the member. `protected` and public members are allowed, and so are private fields whose value is not a function (for example `private readonly label = 'a'`).

Class expressions are not checked.

### How `@Pipe` is recognized

The rule does not use type information. It reads the `import` declarations of the file and follows these forms:

- `import { Pipe } from '@angular/core'` with `@Pipe({...})`
- `import { Pipe as Alias } from '@angular/core'` with `@Alias({...})`
- `import * as ng from '@angular/core'` with `@ng.Pipe({...})`

A `Pipe` imported from another module, a locally defined `Pipe`, and a file that does not import from `@angular/core` are not checked. Only the call form `@Pipe({...})` is checked.

Limitations: a `Pipe` that is re-exported through another module (for example `export { Pipe } from '@angular/core'` in a shared file) is missed, because the rule does not follow imports across files. A local variable that shadows the imported name is not detected.

The rule has no options.

### Examples

Examples of incorrect code for this rule:

```ts
import { Pipe } from '@angular/core';

@Pipe({ name: 'double' })
export class DoublePipe {
  transform(value: number): number {
    return this.twice(value);
  }

  private twice(value: number): number {
    return value * 2;
  }
}
```

```ts
import { Pipe as P } from '@angular/core';

@P({ name: 'double' })
export class DoublePipe {
  private readonly twice = (value: number): number => value * 2;
}
```

Examples of correct code for this rule:

```ts
import { Pipe } from '@angular/core';

@Pipe({ name: 'double' })
export class DoublePipe {
  transform(value: number): number {
    return this.twice(value);
  }

  protected twice(value: number): number {
    return value * 2;
  }
}
```

```ts
import { Pipe } from './my-framework';

@Pipe({ name: 'double' })
export class DoublePipe {
  private twice(value: number): number {
    return value * 2;
  }
}
```

## Why

The class of a pipe is where the framework meets your code. When it only exposes `transform` and delegates the work, the logic lives in objects and functions that can be tested and reused without the framework. A private method keeps logic behind a boundary that tests cannot reach directly, so it tends to stay inside the pipe.

## Instead of private methods

Move the logic to a service or a function, and call it from the pipe.

```ts
// Before
import { Pipe } from '@angular/core';

@Pipe({ name: 'double' })
export class DoublePipe {
  transform(value: number): number {
    return this.twice(value);
  }

  private twice(value: number): number {
    return value * 2;
  }
}
```

```ts
// After
import { Pipe } from '@angular/core';

export function twice(value: number): number {
  return value * 2;
}

@Pipe({ name: 'double' })
export class DoublePipe {
  transform(value: number): number {
    return twice(value);
  }
}
```

## Opting out

To allow a private method in one place, disable the rule on the member and write the reason after `--`:

```ts
// eslint-disable-next-line stoic-angular/no-pipe-private-method -- reason
```
