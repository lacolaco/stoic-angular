import { ESLintUtils } from '@typescript-eslint/utils';

export interface StoicDocs {
  /** Whether the rule requires type information (parserOptions.projectService etc.) */
  requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<StoicDocs>(
  (name) => `https://github.com/lacolaco/stoic-angular/blob/main/docs/rules/${name}.md`,
);
