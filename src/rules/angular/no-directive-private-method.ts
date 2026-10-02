import { createPrivateMethodRule } from '../../support/private-method-rule.js';

/** Forbids private methods in a `@Directive` class */
export const noDirectivePrivateMethod = createPrivateMethodRule({
  name: 'no-directive-private-method',
  decorator: 'Directive',
  description:
    'Forbids private methods in Angular directives and requires moving the logic to collaborating objects.',
  message:
    'Do not put private methods in a directive. Move the logic to a collaborating object such as a service or a function (keep the directive to its host bindings and events)',
});
