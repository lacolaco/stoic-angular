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
const Component = (o) => (c) => c;
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
      name: 'Raising the threshold with the maxLines option also detects templates that exceeded it',
      filename: inFixtures('probe.ts'),
      code: component(`templateUrl: './long.html'`),
      options: [{ maxLines: 25 }],
      errors: [{ messageId: 'inline', data: { lines: '21', max: '25' } }],
      output: component(`template: \`\n${longBody}\n  \``),
    },
  ],
});
