import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { maxFunctionLines } from './max-function-lines';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

const statements = (n: number) => Array.from({ length: n }, (_, i) => `  x = ${i};`).join('\n');

tester.run('max-function-lines', maxFunctionLines, {
  valid: [
    { name: 'function declaration with 5 logic lines is allowed', code: `let x; function f() {\n${statements(5)}\n}` },
    {
      name: 'method with 5 logic lines is allowed',
      code: `let x; class C { m() {\n${statements(5)}\n} }`,
    },
    {
      name: 'lines with only nested closing brackets are not counted (for/for/if/return/return = exactly 5 lines)',
      code: `function f(xs: number[][]) {
  for (const row of xs) {
    for (const v of row) {
      if (v > 0) {
        return true;
      }
    }
  }
  return false;
}`,
    },
    {
      name: 'the closing ); of a multi-line call is not counted either',
      code: `declare function g(a: () => number): void; function f() {
  g(
    () => 1,
  );
  g(
    () => 2,
  );
}`,
    },
    { name: 'a one-line block counts as one line', code: `function f() { return 1; }` },
    {
      name: 'the threshold can be raised with the maxLines option',
      code: `let x; function f() {\n${statements(8)}\n}`,
      options: [{ maxLines: 8 }],
    },
  ],
  invalid: [
    {
      name: 'reports a function declaration with 6 logic lines',
      code: `let x; function f() {\n${statements(6)}\n}`,
      errors: [{ messageId: 'tooLong' }],
    },
    {
      name: 'the opening lines of for and if count as logic (4 statements + for + 1 inner statement = 6 lines)',
      code: `let x; function f(xs: number[]) {
  x = 1;
  x = 2;
  x = 3;
  x = 4;
  for (const v of xs) {
    x = v;
  }
}`,
      errors: [{ messageId: 'tooLong' }],
    },
    {
      name: 'arrow functions with expression bodies are counted by logic lines too',
      code: `const f = (a: number) =>\n  a +\n  1 +\n  2 +\n  3 +\n  4 +\n  5;`,
      errors: [{ messageId: 'tooLong' }],
    },
    {
      name: 'reports a method with 6 logic lines',
      code: `let x; class C { m() {\n${statements(6)}\n} }`,
      errors: [{ messageId: 'tooLong' }],
    },
  ],
});
