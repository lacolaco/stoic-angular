import { type TSESTree } from '@typescript-eslint/utils';
import { isAngularCoreDecorator } from '../../support/angular-imports.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'extraExport';
type Options = [];
type Statement = TSESTree.ProgramStatement;

/** One exported thing: where to report it, and the decorated class it exports, if it is one */
interface Entry {
  node: TSESTree.Node;
  decorated: string | undefined;
}

const DECORATORS = ['Component', 'Directive', 'Pipe', 'Injectable', 'NgModule', 'Service'];

function isDecorated(program: TSESTree.Program, cls: TSESTree.ClassDeclaration): boolean {
  return cls.decorators.some((decorator) =>
    DECORATORS.some((name) => isAngularCoreDecorator(program, decorator, name)),
  );
}

function classOf(statement: Statement): TSESTree.ClassDeclaration | undefined {
  const exported =
    statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration'
      ? statement.declaration
      : statement;
  return exported?.type === 'ClassDeclaration' ? exported : undefined;
}

/** Names of the top-level classes that carry an Angular decorator, whether exported or not */
function decoratedNames(program: TSESTree.Program): Set<string> {
  const names = program.body
    .map(classOf)
    .filter((cls): cls is TSESTree.ClassDeclaration => cls !== undefined)
    .filter((cls) => cls.id !== null && isDecorated(program, cls))
    .map((cls) => cls.id?.name ?? '');
  return new Set(names);
}

function specifierEntry(
  specifier: TSESTree.ExportSpecifier,
  decorated: Set<string>,
  isLocal: boolean,
): Entry {
  const { local } = specifier;
  const name = local.type === 'Identifier' ? local.name : undefined;
  const isClass = isLocal && specifier.exportKind !== 'type' && name !== undefined;
  return { node: specifier, decorated: isClass && decorated.has(name) ? name : undefined };
}

function namedEntries(node: TSESTree.ExportNamedDeclaration, decorated: Set<string>): Entry[] {
  const { declaration, specifiers, source, exportKind } = node;
  if (declaration) {
    const name = declaration.type === 'ClassDeclaration' ? declaration.id?.name : undefined;
    return [{ node, decorated: name !== undefined && decorated.has(name) ? name : undefined }];
  }
  const isLocal = source === null && exportKind !== 'type';
  return specifiers.map((specifier) => specifierEntry(specifier, decorated, isLocal));
}

function defaultEntry(
  program: TSESTree.Program,
  node: TSESTree.ExportDefaultDeclaration,
  decorated: Set<string>,
): Entry {
  const { declaration } = node;
  if (declaration.type === 'ClassDeclaration') {
    return { node, decorated: isDecorated(program, declaration) ? (declaration.id?.name ?? 'default') : undefined };
  }
  const name = declaration.type === 'Identifier' ? declaration.name : undefined;
  return { node, decorated: name !== undefined && decorated.has(name) ? name : undefined };
}

function entriesOf(program: TSESTree.Program, statement: Statement, decorated: Set<string>): Entry[] {
  if (statement.type === 'ExportNamedDeclaration') {
    return namedEntries(statement, decorated);
  }
  if (statement.type === 'ExportDefaultDeclaration') {
    return [defaultEntry(program, statement, decorated)];
  }
  return statement.type === 'ExportAllDeclaration' ? [{ node: statement, decorated: undefined }] : [];
}

/** Requires a file that exports an Angular class to export nothing else */
export const noExtraExports = createRule<Options, MessageIds>({
  name: 'no-extra-exports',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires a file that exports a class decorated with an Angular decorator to export nothing else.',
    },
    messages: {
      extraExport:
        'This file exports the Angular class {{name}}, so it must export nothing else. Move this export to its own file',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      'Program:exit'(program) {
        const decorated = decoratedNames(program);
        const entries = program.body.flatMap((statement) => entriesOf(program, statement, decorated));
        const sole = entries.find((entry) => entry.decorated !== undefined);
        entries
          .filter((entry) => sole !== undefined && entry !== sole)
          .forEach((entry) =>
            context.report({
              node: entry.node,
              messageId: 'extraExport',
              data: { name: sole?.decorated },
            }),
          );
      },
    };
  },
});
