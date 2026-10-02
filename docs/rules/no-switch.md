# stoic-angular/no-switch

📝 Disallows default in switch and requires every case to end with return.

<!-- end auto-generated rule header -->

A `switch` should have no `default` clause, and every `case` should end with `return`.

## Rule details

The rule checks every `case` of every `switch` statement and reports on the `case` node.

- A `default` case is always reported.
- Any other `case` is allowed in one of two forms, and reported otherwise:
  - It has an empty body and is not the last `case` (cases grouped by fallthrough).
  - Its last statement is a `return`. If the last statement is a block, the last statement of that block is checked instead.

So a `case` that ends with `break` or `throw`, a `case` whose `return` appears only inside an `if`, and an empty `case` at the end of the `switch` are all reported.

This is the "Never use switch" rule from _Five Lines of Code_ by Christian Clausen. When a `switch` is still the clearest form, the rule narrows it to a shape whose exhaustiveness can be checked by the compiler. A `default` clause defeats that check: when a new option is added to a union, the `default` silently absorbs it and nothing points at the `switch` that needs a new `case`.

### Examples

Examples of incorrect code for this rule:

```ts
function label(kind: 'a' | 'b'): string {
  switch (kind) {
    case 'a':
      return 'A';
    default:
      return 'other';
  }
}
```

```ts
function report(kind: 'a' | 'b'): void {
  switch (kind) {
    case 'a':
      log('A');
      break;
    case 'b':
      log('B');
      break;
  }
}
```

```ts
function label(kind: 'a' | 'b'): string {
  switch (kind) {
    case 'a':
      return 'A';
    case 'b':
      throw new Error('unsupported');
  }
}
```

```ts
function label(kind: 'a' | 'b', verbose: boolean): string {
  switch (kind) {
    case 'a':
      if (verbose) {
        return 'Alpha';
      }
    case 'b':
      return 'B';
  }
}
```

```ts
function label(kind: 'a' | 'b'): string | undefined {
  switch (kind) {
    case 'a':
      return 'A';
    case 'b':
  }
  return undefined;
}
```

Examples of correct code for this rule:

```ts
function label(kind: 'a' | 'b'): string {
  switch (kind) {
    case 'a':
      return 'A';
    case 'b':
      return 'B';
  }
}
```

```ts
function label(kind: 'a' | 'b' | 'c'): string {
  switch (kind) {
    case 'a':
    case 'b':
      return 'AB';
    case 'c': {
      return 'C';
    }
  }
}
```

## Guaranteeing exhaustiveness

The rule does not check that a `switch` covers every member of a union. It forbids `default` so that the type checker can do that job. Two settings complete the guarantee:

- [`@typescript-eslint/switch-exhaustiveness-check`](https://typescript-eslint.io/rules/switch-exhaustiveness-check/) from typescript-eslint reports a `switch` over a union or an enum that lacks a `case` for some member. It needs type information, so the linter has to be configured for [typed linting](https://typescript-eslint.io/troubleshooting/typed-linting/).
- [`noImplicitReturns: true`](https://www.typescriptlang.org/tsconfig/#noImplicitReturns) in `tsconfig.json`. When a function that returns a value has a `switch` with a missing `case`, the compiler reports error TS2366 (`Function lacks ending return statement and return type does not include 'undefined'`).

```js
// eslint.config.js
import tseslint from 'typescript-eslint';
import stoic from 'eslint-plugin-stoic-angular';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { projectService: true },
    },
  },
  stoic.configure({ 'no-switch': true }),
  {
    files: ['**/*.ts'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },
];
```

With both in place, adding `'triangle'` to a union that a `switch` handles turns that `switch` into an error:

```ts
type Shape = 'circle' | 'square' | 'triangle';

function describe(shape: Shape): string | undefined {
  switch (shape) {
    case 'circle':
      return 'round';
    case 'square':
      return 'boxy';
  }
  return undefined;
}
// @typescript-eslint/switch-exhaustiveness-check:
//   Switch is not exhaustive. Cases not matched: "triangle"
```

When the function returns a value on every path of the `switch`, the compiler reports the same omission as well:

```ts
function area(shape: Shape): number {
  switch (shape) {
    case 'circle':
      return 1;
    case 'square':
      return 2;
  }
}
// TS2366: Function lacks ending return statement and return type does not include 'undefined'.
```

The default options of `switch-exhaustiveness-check` work with this rule. `allowDefaultCaseForExhaustiveSwitch: false` also works: it reports a redundant `default`, which this rule reports too. Do not set `requireDefaultForNonUnion: true`: it demands a `default` on a `switch` over a non-union type such as `number` or `string`, which this rule forbids, so such a `switch` could no longer be written at all.
