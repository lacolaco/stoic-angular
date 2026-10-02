# stoic-angular/call-or-pass

📝 Disallows using the same variable for both member access and argument passing.

<!-- end auto-generated rule header -->

A function should either use a variable's members or pass the variable on to other functions, not both.

## Rule details

The rule looks at the parameters, local variables, and `catch` variables declared inside a function. For each one, it classifies its uses:

- **Member access**: the variable is the receiver of a member access, such as `a.length`, `a.sort()`, `a[0]`, or `a?.length`.
- **Passing**: the variable is a direct argument of a call or a `new` expression, such as `g(a)`, `new G(a)`, or `g(...a)`.

When a variable has both kinds of use, the rule reports on the head of the innermost function that contains both a member access and a passing of that variable. The head is the function keyword and name, for example `function average`; for an arrow function it is the `=>` token. The variable is reported once for every such function.

TypeScript assertions are transparent: `a!`, `a as T`, `a satisfies T`, and `<T>a` count as the variable itself.

These uses count as neither, so they never cause a report:

- Calling the variable itself: `cb()`.
- Destructuring: `const { tagName } = el`.
- Passing the result of a member access: `g(a.length)`. Only `a.length` is passed, not `a`.

The rule does not check variables declared at module level, `this`, or import bindings.

This is the "Either call or pass" rule from _Five Lines of Code_ by Christian Clausen. A function that both reaches into an object and hands the same object to other functions works at two levels of abstraction. Moving one of the two uses into a function of its own, or destructuring the members first, keeps each function at a single level.

### Examples

Examples of incorrect code for this rule:

```ts
function average(arr: number[]): number {
  return sum(arr) / arr.length;
}
```

```ts
function f(a: number[]): void {
  a.sort();
  g(a);
}
```

```ts
function f(a: number[]): number {
  h(...a);
  return a.length;
}
```

```ts
function f(a: { bar(): void } | undefined): void {
  a!.bar();
  g(a!);
}
```

```ts
function f(a: number[]): number[] {
  return a.map((x) => g(a, x));
}
```

In the last example, the mixed use is reported on `function f`, because that is the innermost function that contains both `a.map` and `g(a, x)`. When both uses are inside the same callback, the callback is reported instead.

Examples of correct code for this rule:

```ts
function average(arr: number[]): number {
  return sum(arr) / size(arr);
}
```

```ts
function names(items: { name: string }[]): string {
  return items.map((item) => item.name).join(', ');
}
```

```ts
function f(a: number[]): number {
  g(a.length);
  return a.map((x) => x).length;
}
```

```ts
function f(cb: () => void): void {
  cb();
  h(cb);
}
```

```ts
function f(el: HTMLElement): void {
  const { tagName } = el;
  h(el, tagName);
}
```
