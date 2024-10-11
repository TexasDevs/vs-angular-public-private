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
        // Handle Property Declarations (variables)
        if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
          if (node.name.text === declarationName) {
            // Check if it's already private, skip if it is
            if (
              !node.modifiers?.some(
                (modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword
              )
            ) {
              const privateModifier = ts.factory.createModifier(
                ts.SyntaxKind.PrivateKeyword
              );
              const updatedModifiers = ts.factory.createNodeArray([
                privateModifier,
                ...(node.modifiers || []),
              ]);
              return ts.factory.updatePropertyDeclaration(
                node,
                updatedModifiers,
                node.name,
                node.questionToken || node.exclamationToken,
                node.type,
                node.initializer
              );
            }
          }
        }

        // Handle Method Declarations (functions)
        if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) {
          if (node.name.text === declarationName) {
            // Check if it's already private, skip if it is
            if (
              !node.modifiers?.some(
                (modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword
              )
            ) {
              const privateModifier = ts.factory.createModifier(
                ts.SyntaxKind.PrivateKeyword
              );
              const updatedModifiers = ts.factory.createNodeArray([
                privateModifier,
                ...(node.modifiers || []),
              ]);
              return ts.factory.updateMethodDeclaration(
                node,
                updatedModifiers,
                node.asteriskToken,
                node.name,
                node.questionToken,
                node.typeParameters,
                node.parameters,
                node.type,
                node.body
              );
            }
          }
        }

        return ts.visitEachChild(node, visit, context);
      }

      return ts.visitNode(rootNode, visit);
    };

  const result = ts.transform(sourceFile, [transformer])
    .transformed[0] as ts.SourceFile;
  return result;
}
