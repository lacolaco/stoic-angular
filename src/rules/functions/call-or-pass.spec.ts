import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { callOrPass } from './call-or-pass';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('call-or-pass', callOrPass, {
  valid: [
    {
      name: 'a function that only passes is allowed (code after the fix)',
      code: `declare function sum(a: number[]): number; declare function size(a: number[]): number;
function average(arr: number[]) {
  return sum(arr) / size(arr);
}`,
    },
    {
      name: 'a function that only accesses members is allowed',
      code: `function names(items: { name: string }[]) {
  return items.map((item) => item.name).join(', ');
}`,
    },
    {
      name: 'passed and accessed variables may coexist if they are different variables',
      code: `declare function store(x: unknown): void;
function f(a: number[], b: number[]) {
  store(a);
  return b.length;
}`,
    },
    {
      name: 'passing the result of a member access does not count as passing',
      code: `declare function g(x: number): void;
function f(a: number[]) {
  g(a.length);
  return a.map((x) => x);
}`,
    },
    {
      name: 'calling the variable itself as a function is neither',
      code: `declare function h(cb: () => void): void;
function f(cb: () => void) {
  cb();
  h(cb);
}`,
    },
    {
      name: 'destructuring first and then passing is the sanctioned way out',
      code: `declare function h(el: unknown, tag: string): void;
function f(el: HTMLElement) {
  const { tagName } = el;
  h(el, tagName);
}`,
    },
    {
      name: 'local variables are allowed too if only one of the two is used',
      code: `declare function make(): { run(): void };
function f() {
  const runner = make();
  runner.run();
}`,
    },
  ],
  invalid: [
    {
      name: 'prohibited example: the red line appears on the header (the function heading) of the function containing the mix',
      code: `declare function sum(a: number[]): number;
function average(arr: number[]) {
  return sum(arr) / arr.length;
}`,
      errors: [{ messageId: 'both', line: 2, column: 1, endLine: 2, endColumn: 17 }],
    },
    {
      name: 'both a method call and passing as an argument',
      code: `declare function g(a: number[]): void;
function f(a: number[]) {
  a.sort();
  g(a);
}`,
      errors: [{ messageId: 'both' }],
    },
    {
      name: 'passing via spread counts as passing too',
      code: `declare function h(...xs: number[]): void;
function f(a: number[]) {
  h(...a);
  return a.length;
}`,
      errors: [{ messageId: 'both' }],
    },
    {
      name: 'a mix of outer access and nested passing is reported on the outer function containing both',
      code: `declare function g(a: number[], x: number): void;
function f(a: number[]) {
  return a.map((x: number) => g(a, x));
}`,
      errors: [{ messageId: 'both', line: 2, column: 1 }],
    },
    {
      name: 'if both are inside a nested function, it is reported on the innermost function (the position of => for arrow functions)',
      code: `declare function g(a: number[]): void; declare function each(cb: () => void): void;
function f(a: number[]) {
  each(() => {
    a.sort();
    g(a);
  });
}`,
      errors: [{ messageId: 'both', line: 3, column: 11, endColumn: 13 }],
    },
    {
      name: 'uses through a non-null assertion count as the same variable',
      code: `declare function g(a: unknown): void;
function f(a: { bar(): void } | undefined) {
  a!.bar();
  g(a!);
}`,
      errors: [{ messageId: 'both' }],
    },
    {
      name: 'uses through an as assertion count as the same variable',
      code: `declare function h(a: unknown): void;
function f(a: unknown) {
  void (a as string[]).length;
  h(a);
}`,
      errors: [{ messageId: 'both' }],
    },
    {
      name: 'catch clause variables are covered too',
      code: `declare function report(e: unknown): void; declare function log(m: string): void;
function f() {
  try {
    log('x');
  } catch (e) {
    log((e as Error).message);
    report(e);
  }
}`,
      errors: [{ messageId: 'both' }],
    },
    {
      name: 'using both is a violation even for local variables',
      code: `declare function make(): { run(): void }; declare function stop(r: unknown): void;
function f() {
  const runner = make();
  runner.run();
  stop(runner);
}`,
      errors: [{ messageId: 'both' }],
    },
  ],
});
