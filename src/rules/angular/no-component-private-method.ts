import { createPrivateMethodRule } from '../../support/private-method-rule.js';

/** Forbids private methods in a `@Component` class */
export const noComponentPrivateMethod = createPrivateMethodRule({
  name: 'no-component-private-method',
  decorator: 'Component',
  description:
    'Forbids private methods in Angular components and requires moving the logic to collaborating objects.',
  message:
    'Do not put private methods in a component. Move the logic to a collaborating object such as a service or a function (keep the component to binding the template)',
});
