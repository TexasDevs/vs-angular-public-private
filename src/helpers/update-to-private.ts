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
              console.log(`Inspecting method: ${member.name.text}`);
              if (member.name.text === declarationName) {
                console.log(
                  `Method ${declarationName} will be rebuilt with private modifier`
                );

                const hasPrivateModifier = member.modifiers?.some(
                  (modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword
                );
                console.log(`Has private modifier: ${hasPrivateModifier}`);

                if (!hasPrivateModifier) {
                  console.log(
                    `Applying private modifier to method: ${declarationName}`
                  );
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

                  console.log(
                    `Rebuilding method: ${declarationName} with new modifiers array.`
                  );

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
              } else {
                console.log(
                  `Method ${member.name.text} does not match ${declarationName}, skipping.`
                );
              }
            }

            // Handle Property Declarations (variables) inside the class
            if (
              ts.isPropertyDeclaration(member) &&
              ts.isIdentifier(member.name)
            ) {
              console.log(`Inspecting property: ${member.name.text}`);
              if (member.name.text === declarationName) {
                console.log(
                  `Property ${declarationName} will be rebuilt with private modifier`
                );

                const hasPrivateModifier = member.modifiers?.some(
                  (modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword
                );
                console.log(`Has private modifier: ${hasPrivateModifier}`);

                if (!hasPrivateModifier) {
                  console.log(
                    `Applying private modifier to property: ${declarationName}`
                  );
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

                  console.log(
                    `Rebuilding property: ${declarationName} with new modifiers array.`
                  );

                  return ts.factory.createPropertyDeclaration(
                    updatedModifiers,
                    member.name,
                    member.questionToken || member.exclamationToken,
                    member.type,
                    member.initializer
                  );
                }
              } else {
                console.log(
                  `Property ${member.name.text} does not match ${declarationName}, skipping.`
                );
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
