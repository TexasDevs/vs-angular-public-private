import * as ts from "typescript";
import * as fs from "fs";

export function updateToPrivate(
  sourceFile: ts.SourceFile,
  declarationName: string
): ts.SourceFile {
  const transformer =
    <T extends ts.Node>(context: ts.TransformationContext) =>
    (rootNode: T) => {
      function visit(node: ts.Node): ts.Node {
        // Ensure that we're inside a class and the node is a method declaration
        if (ts.isClassDeclaration(node)) {
          const updatedMembers = node.members.map((member) => {
            // Handle Method Declarations (functions) inside the class
            if (
              ts.isMethodDeclaration(member) &&
              ts.isIdentifier(member.name)
            ) {
              if (member.name.text === declarationName) {
                if (
                  !member.modifiers?.some(
                    (modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword
                  )
                ) {
                  const privateModifier = ts.factory.createModifier(
                    ts.SyntaxKind.PrivateKeyword
                  );
                  const updatedModifiers = ts.factory.createNodeArray([
                    privateModifier,
                    ...(member.modifiers || []),
                  ]);
                  return ts.factory.updateMethodDeclaration(
                    member,
                    updatedModifiers,
                    member.asteriskToken,
                    member.name,
                    member.questionToken,
                    member.typeParameters,
                    member.parameters,
                    member.type,
                    member.body
                  );
                }
              }
            }

            // Handle Property Declarations (variables) inside the class
            if (
              ts.isPropertyDeclaration(member) &&
              ts.isIdentifier(member.name)
            ) {
              if (member.name.text === declarationName) {
                if (
                  !member.modifiers?.some(
                    (modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword
                  )
                ) {
                  const privateModifier = ts.factory.createModifier(
                    ts.SyntaxKind.PrivateKeyword
                  );
                  const updatedModifiers = ts.factory.createNodeArray([
                    privateModifier,
                    ...(member.modifiers || []),
                  ]);
                  return ts.factory.updatePropertyDeclaration(
                    member,
                    updatedModifiers,
                    member.name,
                    member.questionToken || member.exclamationToken,
                    member.type,
                    member.initializer
                  );
                }
              }
            }

            return member;
          });

          return ts.factory.updateClassDeclaration(
            node,
            node.modifiers,
            node.name,
            node.typeParameters,
            node.heritageClauses,
            updatedMembers
          );
        }

        return ts.visitEachChild(node, visit, context);
      }

      return ts.visitNode(rootNode, visit);
    };

  const result = ts.transform(sourceFile, [transformer])
    .transformed[0] as ts.SourceFile;
  return result;
}
