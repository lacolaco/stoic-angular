import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noDataClump } from './no-data-clump';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: { allowDefaultProject: ['*.ts'] },
      tsconfigRootDir: __dirname,
    },
  },
});

tester.run('no-data-clump', noDataClump, {
  valid: [
    {
      name: 'Allowed when only one function accepts a type defined in the module',
      code: `interface Point {
  x: number;
}
export function shift(point: Point): number {
  return point.x + 1;
}`,
    },
    {
      name: 'Types whose behavior lives in class methods are out of scope',
      code: `export class Counter {
  private total = 0;

  bump(): void {
    this.total += 1;
  }

  current(): number {
    return this.total;
  }
}`,
    },
    {
      name: 'Type aliases that are not object shaped (such as function types) are out of scope',
      code: `type Callback = (x: number) => void;
export function runA(cb: Callback): void {
  cb(1);
}
export function runB(cb: Callback): void {
  cb(2);
}`,
    },
    {
      name: 'Passing around external types (built-in or imported) is out of scope',
      code: `export function first(items: readonly string[]): string {
  return items[0];
}
export function last(items: readonly string[]): string {
  return items[items.length - 1];
}`,
    },
  ],
  invalid: [
    {
      name: 'Violation when two or more functions pass a module-local type as an argument (the squiggle is on the type declaration name)',
      code: `interface Tally {
  total: number;
}
export function bump(tally: Tally): void {
  tally.total += 1;
}
export function current(tally: Tally): number {
  return tally.total;
}`,
      errors: [{ messageId: 'dataClump', line: 1, column: 11, endColumn: 16 }],
    },
    {
      name: 'Passing it via arrays or readonly modifiers is also a violation',
      code: `interface Row {
  depth: number;
}
export function deepest(rows: readonly Row[]): number {
  return Math.max(...rows.map((row) => row.depth));
}
export function shallowest(rows: readonly Row[]): number {
  return Math.min(...rows.map((row) => row.depth));
}`,
      errors: [{ messageId: 'dataClump', line: 1, column: 11, endColumn: 14 }],
    },
  ],
});
