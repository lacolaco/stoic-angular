import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noInlineUnion } from './no-inline-union';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

const error = { messageId: 'namedUnion' } as const;

tester.run('no-inline-union', noInlineUnion, {
  valid: [
    {
      name: 'A union inside a type alias is allowed',
      code: `export type Direction = -1 | 1;`,
    },
    {
      name: 'Named types are allowed in signatures',
      code: `type Direction = -1 | 1;
export class Zoom {
  stepBy(delta: Direction): void {
    void delta;
  }
}`,
    },
    {
      name: 'A single type is ignored',
      code: `export function toggle(blockId: string): void {
  void blockId;
}`,
    },
    {
      name: 'A union nested in an object type inside a type alias is allowed',
      code: `export type Options = { delta: -1 | 1; axis?: 'x' | 'y' };`,
    },
    {
      name: 'A union in a function type inside a type alias is allowed',
      code: `export type Watcher = (delta: -1 | 1) => 'a' | 'b';`,
    },
    {
      name: 'A union in a generic type alias is allowed',
      code: `export type Pick2<T extends 'a' | 'b'> = { [K in T]: string } | undefined;`,
    },
    {
      name: 'A type alias inside a function body is allowed',
      code: `export function f(): void {
  type Local = 'a' | 'b';
  const x: Local = 'a';
  void x;
}`,
    },
    {
      name: 'A named type argument of an initializer is allowed',
      code: `type Size = 's' | 'm';
declare function input<T>(): () => T;
export class Button {
  readonly size = input<Size>();
}`,
    },
    {
      name: 'A pair with undefined that only marks optionality is allowed',
      code: `export function select(step: number | undefined): void {
  void step;
}`,
    },
    {
      name: 'A pair with null is allowed',
      code: `export function select(step: number | null): void {
  void step;
}`,
    },
    {
      name: 'A pair with undefined as a type argument is allowed',
      code: `declare function signal<T>(): () => T;
type A = { a: 1 };
export const s = signal<A | undefined>();`,
    },
    {
      name: 'A pair of true and false is allowed because boolean is its name',
      code: `export function flag(on: true | false): void {
  void on;
}`,
    },
    {
      name: 'A pair of true, false and null is allowed',
      code: `export let flag: true | false | null;`,
    },
  ],
  invalid: [
    {
      name: 'Inline unions in public methods are reported',
      code: `export class Zoom {
  stepBy(delta: -1 | 1): void {
    void delta;
  }
}`,
      errors: [error],
    },
    {
      name: 'Inline unions in protected and private members are reported',
      code: `export class Zoom {
  protected clamp(delta: -1 | 1): void {
    void delta;
  }
  private mode: 'a' | 'b' = 'a';
  #side: 'l' | 'r' = 'l';
}`,
      errors: [error, error, error],
    },
    {
      name: 'Classes without decorators are covered',
      code: `export class FontCatalog {
  next(delta: -1 | 1): void {
    void delta;
  }
}`,
      errors: [error],
    },
    {
      name: 'Class expressions are covered',
      code: `export const Zoom = class {
  stepBy(delta: -1 | 1): void {
    void delta;
  }
};`,
      errors: [error],
    },
    {
      name: 'String literal unions are reported',
      code: `export function orient(side: 'portrait' | 'landscape'): void {
  void side;
}`,
      errors: [error],
    },
    {
      name: 'A union of primitive types is reported',
      code: `export function show(value: string | number): void {
  void value;
}`,
      errors: [error],
    },
    {
      name: 'Each offending parameter is reported',
      code: `export function move(delta: -1 | 1, axis: 'x' | 'y'): void {
  void delta;
  void axis;
}`,
      errors: [error, error],
    },
    {
      name: 'A return type is reported',
      code: `export function pick(): 'a' | 'b' {
  return 'a';
}`,
      errors: [error],
    },
    {
      name: 'A default value does not exempt the parameter',
      code: `export function stepBy(delta: -1 | 1 = 1): void {
  void delta;
}`,
      errors: [error],
    },
    {
      name: 'Rest parameters are reported',
      code: `export function stepAll(...deltas: (-1 | 1)[]): void {
  void deltas;
}`,
      errors: [error],
    },
    {
      name: 'A union that includes undefined is reported when two options remain',
      code: `export function stepBy(delta: -1 | 1 | undefined): void {
  void delta;
}`,
      errors: [error],
    },
    {
      name: 'Only the outer union is reported when parentheses are nested',
      code: `export function orient(side: 'portrait' | ('landscape' | undefined)): void {
  void side;
}`,
      errors: [error],
    },
    {
      name: 'Only the outer union is reported when wrapped in parentheses',
      code: `export function stepBy(delta: (-1 | 1) | undefined): void {
  void delta;
}`,
      errors: [error],
    },
    {
      name: 'Unions inside object types are reported',
      code: `export function stepBy(opts: { delta: -1 | 1 }): void {
  void opts;
}`,
      errors: [error],
    },
    {
      name: 'Unions inside tuples are reported',
      code: `export function stepBy(pair: [-1 | 1, number]): void {
  void pair;
}`,
      errors: [error],
    },
    {
      name: 'Unions in function type parameters are reported',
      code: `export function watch(cb: (delta: -1 | 1) => void): void {
  void cb;
}`,
      errors: [error],
    },
    {
      name: 'Arrow function properties are reported',
      code: `export class Zoom {
  readonly stepBy = (delta: -1 | 1): void => {
    void delta;
  };
}`,
      errors: [error],
    },
    {
      name: 'Function-typed properties without an initializer are reported',
      code: `export class Zoom {
  declare readonly stepBy: (delta: -1 | 1) => void;
}`,
      errors: [error],
    },
    {
      name: 'Type parameter constraints are reported',
      code: `export function pick<T extends -1 | 1>(delta: T): void {
  void delta;
}`,
      errors: [error],
    },
    {
      name: 'Constructor parameters are reported',
      code: `export class Zoom {
  constructor(delta: -1 | 1) {
    void delta;
  }
}`,
      errors: [error],
    },
    {
      name: 'Public and private constructor parameter properties are reported',
      code: `export class Zoom {
  constructor(readonly mode: 'a' | 'b', private readonly side: 'l' | 'r') {}
}`,
      errors: [error, error],
    },
    {
      name: 'Abstract members are reported',
      code: `export abstract class Zoom {
  abstract stepBy(delta: -1 | 1): void;
  abstract mode: 'a' | 'b';
}`,
      errors: [error, error],
    },
    {
      name: 'Getter and setter types are reported',
      code: `export class Zoom {
  get mode(): 'a' | 'b' {
    return 'a';
  }
  set mode(value: 'a' | 'b') {
    void value;
  }
}`,
      errors: [error, error],
    },
    {
      name: 'Unions in interfaces are reported',
      code: `export interface Zoom {
  mode: 'a' | 'b';
  stepBy(delta: -1 | 1): void;
}`,
      errors: [error, error],
    },
    {
      name: 'Variable annotations are reported',
      code: `export let mode: 'a' | 'b' = 'a';`,
      errors: [error],
    },
    {
      name: 'Type assertions and satisfies are reported',
      code: `export const a = 'a' as 'a' | 'b';
export const b = 'b' satisfies 'a' | 'b';`,
      errors: [error, error],
    },
    {
      name: 'Unions in method bodies are reported',
      code: `export class Zoom {
  stepBy(): void {
    const delta: -1 | 1 = 1;
    void delta;
  }
}`,
      errors: [error],
    },
    {
      name: 'Type arguments of a call initializer are reported',
      code: `declare function input<T>(): () => T;
export class Button {
  readonly size = input<'s' | 'm'>();
}`,
      errors: [error],
    },
    {
      name: 'Type arguments of signal and new expressions are reported',
      code: `declare function signal<T>(v: T): () => T;
declare class Subject<T> {}
export class Store {
  readonly a = signal<'a' | 'b'>('a');
  readonly b = new Subject<'a' | 'b'>();
}`,
      errors: [error, error],
    },
    {
      name: 'Type arguments of a call outside a class are reported',
      code: `declare function pick<T>(): T;
export const x = pick<'a' | 'b'>();`,
      errors: [error],
    },
    {
      name: 'An interface is not a type alias, so its unions are reported',
      code: `export interface Options extends Base<'a' | 'b'> {}
interface Base<T> {}`,
      errors: [error],
    },
  ],
});
