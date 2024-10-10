import * as ts from "typescript";

export function getDeclarations(sourceFile: ts.SourceFile) {
  const declarations: { variables: string[]; functions: string[] } = {
    variables: [],
    functions: [],
  };

  const visit = (node: ts.Node) => {
    if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
      declarations.variables.push(node.name.text);
    }
    if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) {
      declarations.functions.push(node.name.text);
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);
  return declarations;
}
