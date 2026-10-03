declare function input<T>(): () => T;

export class Zoom {
  readonly size = input<'s' | 'm'>();

  stepBy(delta: -1 | 1): void {
    void delta;
  }
}

export type Allowed = 'a' | 'b';
