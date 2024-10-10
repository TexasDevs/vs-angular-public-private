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
        if (ts.isPropertyDeclaration(node) || ts.isMethodDeclaration(node)) {
          if (
            ts.isIdentifier(node.name) &&
            node.name.text === declarationName
          ) {
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
  return ts.transform(sourceFile, [transformer]).transformed[0];
}
