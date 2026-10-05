import * as path from 'node:path';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { preferInlineTemplate } from './prefer-inline-template';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const fixturesDir = path.join(__dirname, 'fixtures');
const inFixtures = (name: string) => path.join(fixturesDir, name);

const longBody = Array.from({ length: 21 }, (_, i) => `    <p>Line ${i + 1}</p>`).join('\n');

const tester = new RuleTester();

const component = (props: string) => `
import { Component } from '@angular/core';
@Component({
  ${props}
})
export class Probe {}
`;

tester.run('prefer-inline-template', preferInlineTemplate, {
  valid: [
    {
      name: 'External templates over the threshold are allowed',
      filename: inFixtures('probe.ts'),
      code: component(`templateUrl: './long.html'`),
    },
    {
      name: 'Does not intervene when the referenced file does not exist (left to the compiler)',
      filename: inFixtures('probe.ts'),
      code: component(`templateUrl: './missing.html'`),
    },
    {
      name: 'A templateUrl property outside the Component decorator is ignored',
      filename: inFixtures('probe.ts'),
      code: `export const config = { templateUrl: './short.html' };`,
    },
    {
      name: 'A template above the default threshold (21 lines > 10) is allowed without options',
      filename: inFixtures('probe.ts'),
      code: component(`templateUrl: './long.html'`),
      options: [{}],
    },
    {
      name: 'The maxLines option can lower the threshold (3 lines > maxLines 2)',
      filename: inFixtures('probe.ts'),
      code: component(`templateUrl: './medium.html'`),
      options: [{ maxLines: 2 }],
    },
    {
      name: 'A locally defined Component function is not the Angular decorator',
      filename: inFixtures('probe.ts'),
      code: `
const Component = (o) => (c) => c;
@Component({
  templateUrl: './short.html'
})
export class Probe {}
`,
    },
    {
      name: 'A Component decorator imported from another module is ignored',
      filename: inFixtures('probe.ts'),
      code: `
import { Component } from './my-decorators';
@Component({
  templateUrl: './short.html'
})
export class Probe {}
`,
    },
  ],
  invalid: [
    {
      name: 'Detects external templates at or below the threshold and autofixes them to inline templates',
      filename: inFixtures('probe.ts'),
      code: component(`templateUrl: './short.html'`),
      errors: [{ messageId: 'inline' }],
      output: component('template: `\n    <p>Short {{ value }}</p>\n  `'),
    },
    {
      name: 'Indents a single-line decorator by the line indent, not the property column',
      filename: inFixtures('probe.ts'),
      code: `
import { Component } from '@angular/core';
@Component({ selector: 'b', templateUrl: './short.html' }) export class B {}
`,
      errors: [{ messageId: 'inline' }],
      output: `
import { Component } from '@angular/core';
@Component({ selector: 'b', template: \`
  <p>Short {{ value }}</p>
\` }) export class B {}
`,
    },
    {
      name: 'Uses the leading spaces of the line for a single-line decorator in an indented context',
      filename: inFixtures('probe.ts'),
      code: `
import { Component } from '@angular/core';
namespace N {
    @Component({ selector: 'b', templateUrl: './short.html' }) export class B {}
}
`,
      errors: [{ messageId: 'inline' }],
      output: `
import { Component } from '@angular/core';
namespace N {
    @Component({ selector: 'b', template: \`
      <p>Short {{ value }}</p>
    \` }) export class B {}
}
`,
    },
    {
      name: 'Preserves tabs in the leading whitespace of the line',
      filename: inFixtures('probe.ts'),
      code: "import { Component } from '@angular/core';\nnamespace N {\n\t@Component({ selector: 'b', templateUrl: './short.html' }) export class B {}\n}\n",
      errors: [{ messageId: 'inline' }],
      output:
        "import { Component } from '@angular/core';\nnamespace N {\n\t@Component({ selector: 'b', template: `\n\t  <p>Short {{ value }}</p>\n\t` }) export class B {}\n}\n",
    },
    {
      name: 'Raising the threshold with the maxLines option also detects templates that exceeded it',
      filename: inFixtures('probe.ts'),
      code: component(`templateUrl: './long.html'`),
      options: [{ maxLines: 25 }],
      errors: [{ messageId: 'inline', data: { lines: '21', max: '25' } }],
      output: component(`template: \`\n${longBody}\n  \``),
    },
    {
      name: 'Detects an aliased import of Component from @angular/core',
      filename: inFixtures('probe.ts'),
      code: `
import { Component as Cmp } from '@angular/core';
@Cmp({
  templateUrl: './short.html'
})
export class Probe {}
`,
      errors: [{ messageId: 'inline' }],
      output: `
import { Component as Cmp } from '@angular/core';
@Cmp({
  template: \`
    <p>Short {{ value }}</p>
  \`
})
export class Probe {}
`,
    },
    {
      name: 'Detects a namespace import of @angular/core',
      filename: inFixtures('probe.ts'),
      code: `
import * as ng from '@angular/core';
@ng.Component({
  templateUrl: './short.html'
})
export class Probe {}
`,
      errors: [{ messageId: 'inline' }],
      output: `
import * as ng from '@angular/core';
@ng.Component({
  template: \`
    <p>Short {{ value }}</p>
  \`
})
export class Probe {}
`,
    },
  ],
});
