# stoic-angular/if-only-at-start

📝 Requires an if statement to be only at the start of a function, which does nothing else.

<!-- end auto-generated rule header -->

A function that contains an `if` should consist of that `if` and nothing else.

## Rule details

The rule reports an `if` statement inside a function unless the `if` is the first and only statement of the function body. The report points at the `if` keyword. To fix it, extract the `if` into a function whose only statement is the `if`.

This is the "Only use if at the start" rule from _Five Lines of Code_ by Christian Clausen: an `if` goes at the start of a function, and a function that contains an `if` does nothing else. The rule is named after the start of the function, but what it asks for is a function made of the `if` alone. An `if` at the start of a function that has more statements after it is reported too.

The rule does not report an `if` that is:

- Outside a function, such as at module level or in a class `static` block.
- Part of an `else if` chain. The chain counts as part of the leading `if`.
- The first and only statement of a function body. The function can be a declaration, a function expression, a method, or an arrow function with a block body. A callback is a function, so an `if` that is the only statement of a callback is allowed.

Any other `if` is reported: an `if` in a loop, after another statement, before another statement, or inside another `if` or `else` block.

### Examples

Examples of incorrect code for this rule:

```ts
function reportPrimes(n: number) {
  for (let i = 2; i < n; i++) {
    if (isPrime(i)) {
      log(i);
    }
  }
}
```

```ts
function run() {
  const n = count();
  if (n > 0) {
    notify(n);
  }
}
```

```ts
function run(flag: boolean) {
  if (flag) {
    notify();
  }
  cleanup();
}
```

```ts
function run(a: boolean, b: boolean) {
  if (a) {
    if (b) {
      notify();
    }
  }
}
```

Examples of correct code for this rule:

```ts
function reportIfPrime(n: number) {
  if (isPrime(n)) {
    log(n);
  }
}

function reportPrimes(n: number) {
  for (let i = 2; i < n; i++) {
    reportIfPrime(i);
  }
}
```

```ts
function reportAll(items: number[]) {
  items.forEach((n) => {
    if (isPrime(n)) {
      log(n);
    }
  });
}
```

```ts
function dispatch(kind: string) {
  if (kind === 'a') {
    handleA();
  } else if (kind === 'b') {
    handleB();
  } else {
    handleDefault();
  }
}
```

This chain is allowed by this rule alone. With [`no-else`](no-else.md) enabled as well, it is reported, because `no-else` reports every `if` that has an `else`.

## Related rules

Together with [`no-else`](no-else.md), this rule forbids every `else if` chain: this rule allows the chain, and `no-else` reports each `if` in it that has an `else`.

The rule treats an `if` without braces the same as one with braces, so it does not depend on the core `curly` rule. A style that also requires braces on every control statement can enable `curly` with `'all'` alongside it.

```js
// eslint.config.js
export default [
  {
    rules: {
      curly: ['error', 'all'],
    },
  },
];
```
