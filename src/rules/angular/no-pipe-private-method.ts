import { createPrivateMethodRule } from '../../support/private-method-rule.js';

/** Forbids private methods in a `@Pipe` class */
export const noPipePrivateMethod = createPrivateMethodRule({
  name: 'no-pipe-private-method',
  decorator: 'Pipe',
  description:
    'Forbids private methods in Angular pipes and requires moving the logic to collaborating objects.',
  message:
    'Do not put private methods in a pipe. Move the logic to a collaborating object such as a service or a function (keep the pipe to its transform method)',
});
