import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { pureConditions } from './pure-conditions';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('pure-conditions', pureConditions, {
  valid: [
    {
      name: 'queries (has / includes / comparison) are allowed',
      code: `function f(xs: Set<string>, key: string): string {
  return xs.has(key) ? 'yes' : 'no';
}`,
    },
    {
      name: 'mutating calls outside a condition are out of scope',
      code: `function f(xs: string[], x: string): number {
  xs.push(x);
  return xs.length;
}`,
    },
    {
      name: 'pure function calls are allowed',
      code: `declare function isPrime(n: number): boolean;
function f(n: number): string {
  return isPrime(n) ? 'prime' : 'composite';
}`,
    },
  ],
  invalid: [
    {
      name: 'mutating method (delete) in a condition is prohibited',
      code: `declare function g(): void;
function f(xs: Set<string>, key: string): void {
  if (!xs.delete(key)) {
    g();
  }
}`,
      errors: [{ messageId: 'impureCondition' }],
    },
    {
      name: 'prohibited in a ternary condition too (pop)',
      code: `function f(xs: number[]): number {
  return xs.pop() !== undefined ? 1 : 0;
}`,
      errors: [{ messageId: 'impureCondition' }],
    },
    {
      name: 'iterator next in a while condition is prohibited too',
      code: `declare function use(v: number): void;
function f(it: Iterator<number>): void {
  while (!it.next().done) {
    use(0);
  }
}`,
      errors: [{ messageId: 'impureCondition' }],
    },
    {
      name: 'assignment in a condition is prohibited',
      code: `declare function g(): number;
function f(): void {
  let x = 0;
  for (; (x = g()) > 0; ) {
    x;
  }
}`,
      errors: [{ messageId: 'impureCondition' }],
    },
    {
      name: 'increment in a condition is prohibited',
      code: `function f(n: number): void {
  let i = 0;
  while (i++ < n) {
    i;
  }
}`,
      errors: [{ messageId: 'impureCondition' }],
    },
    {
      name: 'non-deterministic call (Math.random) is prohibited',
      code: `declare function g(): void;
function f(): void {
  if (Math.random() > 0.5) {
    g();
  }
}`,
      errors: [{ messageId: 'impureCondition' }],
    },
    {
      name: 'reports mutation inside a callback within a condition',
      code: `declare function g(): void;
function f(xs: number[][], v: number): void {
  if (xs.some((row) => row.push(v) > 0)) {
    g();
  }
}`,
      errors: [{ messageId: 'impureCondition' }],
    },
  ],
});
