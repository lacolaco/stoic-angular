// @ts-nocheck -- @angular/core is not installed in this repository
import { Component, Directive, Pipe } from '@angular/core';

@Component({ selector: 'app-panel', template: '' })
export class Panel {
  private tally(): number {
    return 1;
  }
}

@Directive({ selector: '[appHighlight]' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}

@Pipe({ name: 'double' })
export class DoublePipe {
  transform(value: number): number {
    return this.twice(value);
  }

  private twice(value: number): number {
    return value * 2;
  }
}
