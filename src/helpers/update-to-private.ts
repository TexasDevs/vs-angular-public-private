import * as ts from "typescript";

export function updateToPrivate(
  sourceFile: ts.SourceFile,
  declarationName: string
): ts.SourceFile {
  const transformer =
    <T extends ts.Node>(context: ts.TransformationContext) =>
    (rootNode: T) => {
      function visit(node: ts.Node): ts.Node {
        // Check if we are inside a class declaration
        if (ts.isClassDeclaration(node)) {
          const updatedMembers = node.members.map((member) => {
            // Handle Method Declarations (functions) inside the class
            if (
              ts.isMethodDeclaration(member) &&
              ts.isIdentifier(member.name)
            ) {
              if (member.name.text === declarationName) {
                const hasPrivateModifier = member.modifiers?.some(
                  (modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword
                );

                if (!hasPrivateModifier) {
                  // Create a new modifiers array explicitly with the private modifier
                  const privateModifier = ts.factory.createModifier(
                    ts.SyntaxKind.PrivateKeyword
                  );

                  // Safely create the modifiers array
                  const existingModifiers = member.modifiers
                    ? Array.from(member.modifiers)
                    : [];
                  const updatedModifiers = ts.factory.createNodeArray([
                    privateModifier,
                    ...existingModifiers,
                  ]);

                  // Rebuild the method declaration with the new modifiers
                  return ts.factory.createMethodDeclaration(
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
                const hasPrivateModifier = member.modifiers?.some(
                  (modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword
                );

                if (!hasPrivateModifier) {
                  const privateModifier = ts.factory.createModifier(
                    ts.SyntaxKind.PrivateKeyword
                  );
                  const existingModifiers = member.modifiers
                    ? Array.from(member.modifiers)
                    : [];
                  const updatedModifiers = ts.factory.createNodeArray([
                    privateModifier,
                    ...existingModifiers,
                  ]);

                  return ts.factory.createPropertyDeclaration(
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
