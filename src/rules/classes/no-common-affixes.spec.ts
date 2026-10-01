import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noCommonAffixes } from './no-common-affixes';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-common-affixes', noCommonAffixes, {
  valid: [
    {
      name: 'Members without common prefixes or suffixes are allowed',
      code: `export class Timer {
  start(): void {
    this.begin();
  }
  private begin(): void {}
}`,
    },
    {
      name: 'Single-word names have no affixes and are out of scope',
      code: `export class Store {
  load(): void {}
  loadAll(): void {}
}`,
    },
    {
      name: 'Marker prefixes on / is are not checked',
      code: `export class Panel {
  onClick(): void {}
  onFocus(): void {}
  isOpen(): boolean {
    return true;
  }
  isValid(): boolean {
    return true;
  }
}`,
    },
    {
      name: 'The same prefix is allowed in different scopes',
      code: `export function first(): string {
  const pageCount = 1;
  return String(pageCount);
}
export function second(): string {
  const pageIndex = 2;
  return String(pageIndex);
}`,
    },
  ],
  invalid: [
    {
      name: 'Methods sharing a prefix in the same class are forbidden',
      code: `export class Screen {
  timerStart(): void {}
  timerStop(): void {}
}`,
      errors: [
        { messageId: 'commonAffix', data: { affix: 'timer' } },
        { messageId: 'commonAffix', data: { affix: 'timer' } },
      ],
    },
    {
      name: 'The word after a marker prefix becomes the effective prefix (Foo in onFooXxx)',
      code: `export class Screen {
  onTimerStart(): void {}
  onTimerStop(): void {}
}`,
      errors: [
        { messageId: 'commonAffix', data: { affix: 'timer' } },
        { messageId: 'commonAffix', data: { affix: 'timer' } },
      ],
    },
    {
      name: 'Sharing a word in a middle position is also forbidden as insufficient encapsulation',
      code: `interface ImportSource {
  readonly name: string;
}
export function assertDemoFetched(ok: boolean): void {
  if (!ok) {
    throw new Error('demo fetch failed');
  }
}
export function fetchDemoText(name: string): string {
  return name;
}
export function toDemoFileInput(name: string): ImportSource {
  return { name };
}`,
      errors: [
        { messageId: 'commonAffix', data: { affix: 'demo' } },
        { messageId: 'commonAffix', data: { affix: 'demo' } },
        { messageId: 'commonAffix', data: { affix: 'demo' } },
      ],
    },
    {
      name: 'Fields sharing a suffix in the same class are forbidden',
      code: `export class Layout {
  private readonly headerHeight = 1;
  private readonly footerHeight = 2;
  total(): number {
    return this.headerHeight + this.footerHeight;
  }
}`,
      errors: [
        { messageId: 'commonAffix', data: { affix: 'height' } },
        { messageId: 'commonAffix', data: { affix: 'height' } },
      ],
    },
    {
      name: 'Variables sharing a prefix in the same scope are forbidden',
      code: `export function summarize(): number {
  const pageCount = 1;
  const pageIndex = 2;
  return pageCount + pageIndex;
}`,
      errors: [
        { messageId: 'commonAffix', data: { affix: 'page' } },
        { messageId: 'commonAffix', data: { affix: 'page' } },
      ],
    },
    {
      name: 'Functions sharing a prefix at module level are forbidden',
      code: `export function accountDeposit(): void {}
export function accountWithdraw(): void {}`,
      errors: [
        { messageId: 'commonAffix', data: { affix: 'account' } },
        { messageId: 'commonAffix', data: { affix: 'account' } },
      ],
    },
  ],
});
