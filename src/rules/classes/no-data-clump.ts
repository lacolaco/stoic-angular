import type { ParserServicesWithTypeInformation } from '@typescript-eslint/utils';
import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';
import { distinct } from '../../support/ast-utils.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'dataClump';

type Context = Parameters<Parameters<typeof ESLintUtils.RuleCreator.withoutDocs>[0]['create']>[0];

type Services = ParserServicesWithTypeInformation;

function isLiteralAlias(statement: ts.Statement): statement is ts.TypeAliasDeclaration {
  const alias = ts.isTypeAliasDeclaration(statement) ? statement : undefined;
  return alias !== undefined && ts.isTypeLiteralNode(alias.type);
}

/** Targets only types whose shape is defined in the module (interfaces and aliases of object literal types) */
function isOwnShape(
  statement: ts.Statement,
): statement is ts.InterfaceDeclaration | ts.TypeAliasDeclaration {
  return ts.isInterfaceDeclaration(statement) || isLiteralAlias(statement);
}

function localTypes(file: ts.SourceFile): Map<string, ts.DeclarationStatement> {
  const declarations = file.statements.filter(isOwnShape);
  return new Map(declarations.map((declaration) => [declaration.name.text, declaration]));
}

function moduleFunctions(file: ts.SourceFile): ts.FunctionDeclaration[] {
  return file.statements.filter((statement) => ts.isFunctionDeclaration(statement));
}

/** Aggregate parameter types of module functions and find local types passed around by multiple functions */
class Census {
  private readonly counts = new Map<string, number>();

  constructor(private readonly checker: ts.TypeChecker) {}

  survey(file: ts.SourceFile): ts.DeclarationStatement[] {
    moduleFunctions(file).forEach((fn) => this.tally(fn));
    const declared = [...localTypes(file).entries()];
    return declared.filter(([name]) => (this.counts.get(name) ?? 0) >= 2).map(([, node]) => node);
  }

  private tally(fn: ts.SignatureDeclaration): void {
    const names = fn.parameters.flatMap((parameter) => this.nameOf(parameter));
    distinct(names).forEach((name) => this.counts.set(name, (this.counts.get(name) ?? 0) + 1));
  }

  private nameOf(parameter: ts.ParameterDeclaration): string[] {
    const bare = this.element(this.checker.getTypeAtLocation(parameter));
    const symbol = bare.aliasSymbol ?? bare.getSymbol();
    return symbol === undefined ? [] : [symbol.name];
  }

  /** Arrays and readonly arrays are inspected down to the element type */
  private element(type: ts.Type): ts.Type {
    return this.checker.getIndexTypeOfType(type, ts.IndexKind.Number) ?? type;
  }
}

function reportClumps(context: Context, services: Services, node: TSESTree.Program): void {
  const { program, esTreeNodeToTSNodeMap } = services;
  const file = esTreeNodeToTSNodeMap.get(node);
  const scan = new Census(program.getTypeChecker());
  scan.survey(file).forEach(({ name }) => flagAt(context, services, name));
}

function flagAt(context: Context, services: Services, name: ts.Node | undefined): void {
  if (name !== undefined) {
    const { loc } = services.tsNodeToESTreeNodeMap.get(name);
    context.report({ loc, messageId: 'dataClump' });
  }
}

/**
 * Forbid data clumps. If a type whose shape is defined in a module is passed around as an argument by multiple
 * module functions in the same module, that type should become a class that owns the behavior
 * as methods. Renaming functions or parameters does not avoid this
 */
export const noDataClump = createRule<[], MessageIds>({
  name: 'no-data-clump',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires grouping data clumps passed as arguments to multiple module functions into a class.',
      requiresTypeChecking: true,
    },
    messages: {
      dataClump:
        'This type is passed as an argument to multiple module functions. Make it a class and move the operations into methods (no data clumps)',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    return { Program: (node) => reportClumps(context, services, node) };
  },
});
