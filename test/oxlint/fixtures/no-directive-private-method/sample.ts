// @ts-nocheck -- @angular/core is not installed in this repository
import { Directive } from '@angular/core';

@Directive({ selector: '[appHighlight]' })
export class Highlight {
  private tally(): number {
    return 1;
  }
}
