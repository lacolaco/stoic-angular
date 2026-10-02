# stoic-angular/no-else

📝 Disallows combining if and else.

<!-- end auto-generated rule header -->

An `if` should not have an `else`.

## Rule details

The rule reports every `if` statement that has an `else` branch, one report per `if`. The report points at the `if` keyword. An `if / else if / else` chain is reported once for each `if` that has an `alternate`, so the chain `if ... else if ... else` yields two reports: one for the first `if` and one for the `else if`.

This is the "Never use if with else" rule from _Five Lines of Code_ by Christian Clausen. Branching that needs an `else` can be written without it:

- An early `return` (or `throw`) in the `if` branch, followed by the code of the other branch.
- The conditional operator, when both branches only produce a value.
- Polymorphism, when the branches choose between behaviors by the kind of an object.

The conditional operator (`a ? b : c`) is not an `if` statement, so the rule does not report it. An `if` without an `else` is not reported either.

### Examples

Examples of incorrect code for this rule:

```ts
function label(flag: boolean): string {
  if (flag) {
    return 'on';
  } else {
    return 'off';
  }
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

Examples of correct code for this rule:

```ts
function label(flag: boolean): string {
  return flag ? 'on' : 'off';
}
```

```ts
function run(flag: boolean) {
  if (flag) {
    return handleFlagged();
  }
  return handleDefault();
}
```

```ts
interface Handler {
  handle(): void;
}

function dispatch(handler: Handler) {
  handler.handle();
}
```

## Related rules

[`if-only-at-start`](if-only-at-start.md) treats an `else if` chain as part of its leading `if`, so it allows the chain. This rule reports the same chain, because every `if` in it except the last has an `alternate`. Enabling both rules therefore forbids every `else if` chain: each `if` must be alone in its function (`if-only-at-start`) and must have no `else` (`no-else`).

The early `return` form above is also reported by `if-only-at-start`, because the `if` is followed by another statement. With both rules enabled, use the conditional operator or polymorphism, or extract the `if` into a function whose only statement is that `if`.
