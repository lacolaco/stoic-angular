// @ts-nocheck -- @angular/core is not installed in this repository
import { Component, Directive, Pipe } from '@angular/core';

@Component({ selector: 'app-panel', template: '' })
export class Panel {
  get total(): number {
    return 1;
  }
}

@Directive({ selector: '[appHighlight]' })
export class Highlight {
  set color(value: string) {}
}

@Pipe({ name: 'double' })
export class DoublePipe {
  transform(value: number): number {
    return value * this.factor;
  }

  get factor(): number {
    return 2;
  }
}
