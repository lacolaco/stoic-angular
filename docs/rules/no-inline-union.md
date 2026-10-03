# stoic-angular/no-inline-union

📝 Requires union types to be written only inside type alias declarations.

<!-- end auto-generated rule header -->

A union type should be written only on the right-hand side of a `type` declaration. Everywhere else, refer to it by name.

## Rule details

The rule reports every union type that is not inside a `type X = ...` declaration, wherever it appears: parameters and return types of functions and methods, variable annotations, class members (public, `protected`, `private` and `#private` alike), `interface` members, `as` and `satisfies` types, type parameter constraints, type arguments, and code inside function bodies. Class declarations and class expressions are both covered, and the rule does not look at decorators or class names.

Type arguments are reported as well, including those of an initializer such as `input<'s' | 'm'>()`, `signal<A | B>(...)` or `new Subject<'a' | 'b'>()`.

The one place where a union is allowed is inside a `type` alias declaration, at any depth: `type Options = { size: 's' | 'm' }` and `type Handler = (mode: 'a' | 'b') => void` are fine. An `interface` is not a type alias, so a union inside it is reported.

The rule does not use type information and has no options.

### What counts as a union

The rule flattens nested unions and drops `undefined`, `null` and `void`. It reports the union when two or more options remain and they are not all boolean literals.

- `T | undefined` and `T | null` are allowed: the second option only marks absence.
- `true | false` is allowed: it already has the name `boolean`.
- `string | number` and `'a' | 'b'` are reported.
- In a nested union such as `'a' | ('b' | 'c')`, only the outer union is reported.

### Examples

Examples of incorrect code for this rule:

```ts
export class Zoom {
  stepBy(delta: -1 | 1): void {}
}
```

```ts
declare function input<T>(): () => T;

export class Button {
  readonly size = input<'s' | 'm'>();
}
```

```ts
export interface Panel {
  mode: 'a' | 'b';
}
```

```ts
export const mode = 'a' as 'a' | 'b';
```

Examples of correct code for this rule:

```ts
export type Direction = -1 | 1;

export class Zoom {
  stepBy(delta: Direction): void {}
}
```

```ts
declare function input<T>(): () => T;

type Size = 's' | 'm';

export class Button {
  readonly size = input<Size>();
}
```

```ts
export type Options = { size: 's' | 'm' };
export type Handler = (mode: 'a' | 'b') => void;
```

```ts
declare function signal<T>(): () => T;

export const maybe = signal<string | undefined>();
export function flag(on: true | false, step: number | null): void {}
```

## Why

When a set of options is written inline, adding an option means finding and rewriting every place that spells it out. A named type confines the rewrite to one place. A name on a type that appears in a public signature also tells the reader what the options mean, which the list of literals alone does not.

## Instead of inline unions

Extract the union into a `type` declaration and use its name.

```ts
// Before
export class Zoom {
  stepBy(delta: -1 | 1): void {}
}
```

```ts
// After
export type Direction = -1 | 1;

export class Zoom {
  stepBy(delta: Direction): void {}
}
```

## Opting out

To allow a union in one place, disable the rule on that line and write the reason after `--`:

```ts
// eslint-disable-next-line stoic-angular/no-inline-union -- reason
```
