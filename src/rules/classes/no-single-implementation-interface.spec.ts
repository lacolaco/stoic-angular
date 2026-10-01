import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noSingleImplementationInterface } from './no-single-implementation-interface';

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

tester.run('no-single-implementation-interface', noSingleImplementationInterface, {
  valid: [
    {
      name: 'Interfaces with two implementations are allowed',
      code: `interface Renderer {
  render(): string;
}
export class SvgRenderer implements Renderer {
  render(): string {
    return 'svg';
  }
}
export class CanvasRenderer implements Renderer {
  render(): string {
    return 'canvas';
  }
}`,
    },
    {
      name: 'Interfaces without implementations (used only as types) are out of scope',
      code: `interface Shape {
  width: number;
}
export function area(shape: Shape): number {
  return shape.width;
}`,
    },
    {
      name: 'Classes without implements are out of scope',
      code: `export class Standalone {
  value = 1;
}`,
    },
  ],
  invalid: [
    {
      name: 'An interface with only one implementation is forbidden (the squiggle appears on the interface declaration name)',
      code: `interface Renderer {
  render(): string;
}
export class SvgRenderer implements Renderer {
  render(): string {
    return 'svg';
  }
}`,
      errors: [{ messageId: 'singleImplementation', line: 1, column: 11, endColumn: 19 }],
    },
  ],
});
