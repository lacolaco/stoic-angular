import { getFunctionHeadLocation } from '@eslint-community/eslint-utils';
import { ESLintUtils, type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import {
  allScopes,
  distinct,
  effectiveUse,
  enclosingFunctions,
  innermostOnly,
  isCallArgument,
  isReceiver,
  type FunctionNode,
} from '../../support/ast-utils.js';
import { createRule } from '../../support/create-rule.js';

type MessageIds = 'both';
type Finding = TSESLint.ReportDescriptor<MessageIds>;

type Kind = 'member' | 'passed';

function classify(id: TSESTree.Node): Kind | null {
  const { use, parent } = effectiveUse(id);
  const member = parent !== undefined && isReceiver(parent, use);
  const passed = parent !== undefined && isCallArgument(parent, use);
  return member ? 'member' : passed ? 'passed' : null;
}

const TARGET_DEF_TYPES: ReadonlySet<string> = new Set(['Parameter', 'Variable', 'CatchClause']);

/** Targets are parameters, local variables, and catch variables declared in a function (module scope is excluded) */
function isTarget(variable: TSESLint.Scope.Variable): boolean {
  const def = variable.defs[0];
  return (
    def !== undefined &&
    TARGET_DEF_TYPES.has(def.type) &&
    variable.scope.variableScope.type === 'function'
  );
}

/** Keeps all references of one variable, classified into member accesses and argument passes */
class Usage {
  private readonly member: TSESTree.Node[] = [];
  private readonly passed: TSESTree.Node[] = [];

  record(id: TSESTree.Node): void {
    this.append(classify(id), id);
  }

  private append(kind: Kind | null, id: TSESTree.Node): void {
    if (kind !== null) {
      this[kind].push(id);
    }
  }

  findings(name: string, sourceCode: TSESLint.SourceCode): Finding[] {
    return this.mixed().map((fn) => findingAt(fn, name, sourceCode));
  }

  private mixed(): FunctionNode[] {
    const both = this.member.length > 0 && this.passed.length > 0;
    return both ? mixedFunctions(this.member, this.passed) : [];
  }
}

function usesOf(variable: TSESLint.Scope.Variable): Usage {
  const usage = new Usage();
  for (const reference of variable.references) {
    usage.record(reference.identifier);
  }
  return usage;
}

/** Finds the innermost function containing both member accesses and argument passes */
function mixedFunctions(
  member: readonly TSESTree.Node[],
  passed: readonly TSESTree.Node[],
): FunctionNode[] {
  const memberFns = new Set(member.flatMap(enclosingFunctions));
  const candidates = passed.flatMap(enclosingFunctions).filter((fn) => memberFns.has(fn));
  return innermostOnly(distinct(candidates));
}

/** Report on the header of the function */
function findingAt(fn: FunctionNode, name: string, sourceCode: TSESLint.SourceCode): Finding {
  const loc = getFunctionHeadLocation(fn as never, sourceCode as never) as TSESTree.SourceLocation;
  return { loc, messageId: 'both', data: { name } };
}

function checkVariable(
  variable: TSESLint.Scope.Variable,
  sourceCode: TSESLint.SourceCode,
): Finding[] {
  const { name } = variable;
  return isTarget(variable) ? usesOf(variable).findings(name, sourceCode) : [];
}

function allFindings(sourceCode: TSESLint.SourceCode): Finding[] {
  const scopes = allScopes(sourceCode);
  return scopes.flatMap((scope) => scope.variables.flatMap((v) => checkVariable(v, sourceCode)));
}

/**
 * Either call or pass: a function either accesses members (methods and properties)
 * of an object or passes the object as an argument to other functions, but not both
 */
export const callOrPass = createRule<[], MessageIds>({
  name: 'call-or-pass',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows using the same variable for both member access and argument passing.',
    },
    messages: {
      both: 'This function uses the variable {{name}} for both member access and argument passing. Use it for only one of them (Either call or pass)',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      'Program:exit'() {
        for (const finding of allFindings(context.sourceCode)) {
          context.report(finding);
        }
      },
    };
  },
});
