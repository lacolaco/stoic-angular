# stoic-angular/max-function-lines

📝 Limits the number of logic lines in a function body.

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Limits the number of logic lines in a function body to five by default.

## Rule details

The rule reports a function, method, or arrow function whose body has more than `maxLines` lines of logic.

This is the five lines rule from _Five Lines of Code_ by Christian Clausen: a function should not be longer than five lines. A function that fits in five lines does one thing and can be named after it. Longer functions are split into smaller ones.

### How lines are counted

The rule takes the source text of the function body and counts its lines.

- Blank lines and lines made only of `{`, `}`, `(`, `)`, `[`, `]`, `;`, and `,` are not counted. A closing `}` or `);` therefore costs nothing.
- Comment lines are counted.
- The opening line of a statement such as `for (...) {` or `if (...) {` is counted.
- A one-line body such as `{ return 1; }` counts as one line.
- Lines of a nested function are also counted for the enclosing function. The nested function is checked on its own as well.
- Function declarations, function expressions (including methods), and arrow functions are checked. An arrow function with an expression body is counted by the lines of that expression.

### Examples

Examples of incorrect code for this rule:

```ts
function report(items: number[]) {
  let sum = 0;
  for (const item of items) {
    sum += item;
  }
  console.log(sum);
  console.log(items.length);
  return sum;
}
```

The body has six lines of logic: `let sum`, the `for` header, `sum += item`, the two `console.log` calls, and `return`. The closing braces are not counted.

Examples of correct code for this rule:

```ts
function sum(items: number[]) {
  let total = 0;
  for (const item of items) {
    total += item;
  }
  return total;
}
```

The closing braces are not counted, so this body has four lines.

## Options

<!-- begin auto-generated rule options list -->

| Name       | Type    |
| :--------- | :------ |
| `maxLines` | Integer |

<!-- end auto-generated rule options list -->

`maxLines` is the largest number of logic lines allowed in a function body. It defaults to `5` and must be an integer of at least 1.

```js
// eslint.config.js
export default [
  {
    rules: {
      'stoic-angular/max-function-lines': ['error', { maxLines: 8 }],
    },
  },
];
```
