import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noExtraExports } from './no-extra-exports';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

const head = `import { Component } from '@angular/core';
@Component({ template: '' })`;

const decorators = ['Component', 'Directive', 'Pipe', 'Injectable', 'NgModule', 'Service'];

tester.run('no-extra-exports', noExtraExports, {
  valid: [
    {
      name: 'export class alone',
      code: `${head}
export class Panel {}`,
    },
    {
      name: 'export default class alone',
      code: `${head}
export default class Panel {}`,
    },
    {
      name: 'class with export { X } alone',
      code: `${head}
class Panel {}
export { Panel };`,
    },
    {
      name: 'class with export { X as Y } alone',
      code: `${head}
class Panel {}
export { Panel as Widget };`,
    },
    {
      name: 'class with export default X alone',
      code: `${head}
class Panel {}
export default Panel;`,
    },
    {
      name: 'local declarations that are not exported',
      code: `${head}
export class Panel {}
const LABEL = 'panel';
function helper(): number { return 1; }
type Local = string;
interface Shape { a: number }
enum Kind { A }
class Other {}`,
    },
    {
      name: 'a decorated class that is not exported leaves the file alone',
      code: `${head}
class Panel {}
export const label = 'panel';`,
    },
    {
      name: 'a file without a decorated class may export anything',
      code: `export const a = 1;
export function b() {}
export class C {}
export type T = string;
export * from './x';`,
    },
    {
      name: 'an undecorated class is not a target',
      code: `import { Component } from '@angular/core';
export class Plain {}
export const a = 1;`,
    },
    {
      name: 'bare decorator form is not a target',
      code: `import { Component } from '@angular/core';
@Component
export class Panel {}
export const a = 1;`,
    },
    {
      name: 'decorator imported from another module',
      code: `import { Component } from './my-framework';
@Component({})
export class Panel {}
export const a = 1;`,
    },
    {
      name: 'locally defined decorator',
      code: `function Component(options: object) { return (target: unknown) => target; }
@Component({})
export class Panel {}
export const a = 1;`,
    },
    {
      name: 'another Angular decorator such as Input is not a target',
      code: `import { Input } from '@angular/core';
@Input()
export class Panel {}
export const a = 1;`,
    },
    {
      name: 'an empty export is not reported',
      code: `${head}
export class Panel {}
export {};`,
    },
    ...decorators.map((name) => ({
      name: `@${name} alone`,
      code: `import { ${name} } from '@angular/core';
@${name}({})
export class X {}`,
    })),
  ],
  invalid: [
    {
      name: 'exported const',
      code: `${head}
export class Panel {}
export const LABEL = 'panel';`,
      errors: [{ messageId: 'extraExport', data: { name: 'Panel' }, line: 4 }],
    },
    {
      name: 'exported function',
      code: `${head}
export class Panel {}
export function helper() {}`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    {
      name: 'exported undecorated class',
      code: `${head}
export class Panel {}
export class Other {}`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    {
      name: 'exported enum',
      code: `${head}
export class Panel {}
export enum Kind { A }`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    {
      name: 'exported type alias',
      code: `${head}
export class Panel {}
export type Label = string;`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    {
      name: 'exported interface',
      code: `${head}
export class Panel {}
export interface Shape { a: number }`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    {
      name: 'type-only export list',
      code: `${head}
export class Panel {}
type Label = string;
export type { Label };`,
      errors: [{ messageId: 'extraExport', line: 5, column: 15 }],
    },
    {
      name: 'type-only export of the decorated class itself is extra',
      code: `${head}
export class Panel {}
export type { Panel as PanelType };`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    {
      name: 'other names of an export list are reported at the specifier',
      code: `${head}
class Panel {}
const a = 1;
const b = 2;
export { a, Panel, b };`,
      errors: [
        { messageId: 'extraExport', line: 6, column: 10, endColumn: 11 },
        { messageId: 'extraExport', line: 6, column: 20, endColumn: 21 },
      ],
    },
    {
      name: 'the decorated class is the sole one even when it comes after other exports',
      code: `${head}
class Panel {}
export const a = 1;
export { Panel };`,
      errors: [{ messageId: 'extraExport', line: 4, column: 1 }],
    },
    {
      name: 're-export with a source',
      code: `${head}
export class Panel {}
export { x } from './x';`,
      errors: [{ messageId: 'extraExport', line: 4, column: 10 }],
    },
    {
      name: 're-export under another name from another module',
      code: `${head}
export class Panel {}
export { Panel as Other } from './x';`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    {
      name: 'export all',
      code: `${head}
export class Panel {}
export * from './x';`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    {
      name: 'export namespace re-export',
      code: `${head}
export class Panel {}
export * as ns from './x';`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    {
      name: 'another default export',
      code: `${head}
class Panel {}
export { Panel };
export default function helper() {}`,
      errors: [{ messageId: 'extraExport', line: 5 }],
    },
    {
      name: 'a second decorated class is reported',
      code: `import { Component, Directive } from '@angular/core';
@Component({ template: '' })
export class Panel {}
@Directive({})
export class Highlight {}`,
      errors: [{ messageId: 'extraExport', line: 5 }],
    },
    {
      name: 'a second decorated class exported through a list is reported',
      code: `import { Component, Pipe } from '@angular/core';
@Component({ template: '' })
class Panel {}
@Pipe({ name: 'p' })
class P {}
export { Panel, P };`,
      errors: [{ messageId: 'extraExport', line: 6, column: 17 }],
    },
    {
      name: 'the first decorated class in the file is the sole one for export default',
      code: `${head}
export default class Panel {}
export const a = 1;`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    {
      name: 'a second export of the same class is reported',
      code: `${head}
export class Panel {}
export { Panel as Widget };`,
      errors: [{ messageId: 'extraExport', line: 4, column: 10 }],
    },
    {
      name: 'alias import',
      code: `import { Component as C } from '@angular/core';
@C({})
export class Panel {}
export const a = 1;`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    {
      name: 'namespace import',
      code: `import * as ng from '@angular/core';
@ng.Component({})
export class Panel {}
export const a = 1;`,
      errors: [{ messageId: 'extraExport', line: 4 }],
    },
    ...decorators.map((name) => ({
      name: `@${name} is a target`,
      code: `import { ${name} } from '@angular/core';
@${name}({})
export class X {}
export const a = 1;`,
      errors: [{ messageId: 'extraExport' as const, line: 4 }],
    })),
  ],
});
