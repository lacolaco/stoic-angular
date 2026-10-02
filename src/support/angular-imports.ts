import type { TSESTree } from '@typescript-eslint/utils';

const ANGULAR_CORE = '@angular/core';

type Specifier = TSESTree.ImportClause;

function importedName(specifier: TSESTree.ImportSpecifier): string {
  const { imported } = specifier;
  return imported.type === 'Identifier' ? imported.name : String(imported.value);
}

function coreImports(program: TSESTree.Program): TSESTree.ImportDeclaration[] {
  return program.body.filter(
    (node): node is TSESTree.ImportDeclaration =>
      node.type === 'ImportDeclaration' &&
      node.source.value === ANGULAR_CORE &&
      node.importKind !== 'type',
  );
}

function valueSpecifiers(program: TSESTree.Program): Specifier[] {
  return coreImports(program)
    .flatMap((declaration) => declaration.specifiers)
    .filter((specifier) => !('importKind' in specifier) || specifier.importKind !== 'type');
}

function isNamedImport(specifier: Specifier, local: string, name: string): boolean {
  return (
    specifier.type === 'ImportSpecifier' &&
    specifier.local.name === local &&
    importedName(specifier) === name
  );
}

function isNamespaceImport(specifier: Specifier, local: string): boolean {
  return specifier.type === 'ImportNamespaceSpecifier' && specifier.local.name === local;
}

function isCoreMember(specifiers: Specifier[], callee: TSESTree.MemberExpression, name: string) {
  const { object, property, computed } = callee;
  const memberName = property.type === 'Identifier' && !computed ? property.name : undefined;
  return (
    object.type === 'Identifier' &&
    memberName === name &&
    specifiers.some((specifier) => isNamespaceImport(specifier, object.name))
  );
}

function isCoreIdentifier(specifiers: Specifier[], callee: TSESTree.Identifier, name: string) {
  return specifiers.some((specifier) => isNamedImport(specifier, callee.name, name));
}

/**
 * Whether the callee refers to the `@angular/core` export `name`, judged only by the import
 * declarations of the file. Handles `import { name }`, `import { name as alias }` and
 * `import * as ns` with `ns.name`. A re-export through another module is not followed.
 */
export function isAngularCoreExport(
  program: TSESTree.Program,
  callee: TSESTree.Node,
  name: string,
): boolean {
  const specifiers = valueSpecifiers(program);
  if (callee.type === 'Identifier') {
    return isCoreIdentifier(specifiers, callee, name);
  }
  return callee.type === 'MemberExpression' && isCoreMember(specifiers, callee, name);
}

/**
 * Whether the decorator is a call `@name(...)` of the `@angular/core` export `name`
 * (see {@link isAngularCoreExport}). The bare form `@name` is not matched.
 */
export function isAngularCoreDecorator(
  program: TSESTree.Program,
  decorator: TSESTree.Decorator,
  name: string,
): boolean {
  const { expression } = decorator;
  return (
    expression.type === 'CallExpression' && isAngularCoreExport(program, expression.callee, name)
  );
}
