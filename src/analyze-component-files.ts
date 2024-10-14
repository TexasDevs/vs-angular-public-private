import * as ts from "typescript";
import { updateToPrivate } from "./update-to-private";
import { getDeclarations } from "./get-declarations";
import { isUsedInHtml } from "./is-used-html";

const ANGULAR_LIFECYCLE_HOOKS = [
  "ngOnInit",
  "ngOnDestroy",
  "ngAfterViewInit",
  "ngAfterViewChecked",
  "ngAfterContentInit",
  "ngAfterContentChecked",
  "ngDoCheck",
  "ngOnChanges",
];

export function analyzeComponentFiles(
  tsSourceFile: ts.SourceFile,
  htmlContent: string
): ts.SourceFile {
  const declarations = getDeclarations(tsSourceFile);

  // Store the original text of decorated properties to reinsert them unchanged later
  const originalDecoratedProperties: Record<string, string> = {};

  const sourceText = tsSourceFile.getFullText(); // Get full source text for referencing unchanged parts

  let updatedSourceFile = tsSourceFile;

  declarations.variables.forEach((variable) => {
    const isUsed = isUsedInHtml(htmlContent, variable);
    const hasDecorators = hasDecorator(tsSourceFile, variable);

    if (!isUsed && !hasDecorators) {
      updatedSourceFile = updateToPrivate(updatedSourceFile, variable); // Only update if no decorators
    }

    if (hasDecorators) {
      // Store the original text of the decorated property
      const node = getNodeByName(tsSourceFile, variable);
      if (node) {
        const nodeStart = node.getStart();
        const nodeEnd = node.getEnd();
        originalDecoratedProperties[variable] = sourceText.substring(
          nodeStart,
          nodeEnd
        );
      }
    }
  });

  declarations.functions.forEach((fn) => {
    const isUsed = isUsedInHtml(htmlContent, fn);
    const isLifecycleHook = ANGULAR_LIFECYCLE_HOOKS.includes(fn);
    const hasDecorators = hasDecorator(tsSourceFile, fn);

    if (!isUsed && !isLifecycleHook && !hasDecorators) {
      updatedSourceFile = updateToPrivate(updatedSourceFile, fn); // Only update if no decorators
    }

    if (hasDecorators) {
      // Store the original text of the decorated method
      const node = getNodeByName(tsSourceFile, fn);
      if (node) {
        const nodeStart = node.getStart();
        const nodeEnd = node.getEnd();
        originalDecoratedProperties[fn] = sourceText.substring(
          nodeStart,
          nodeEnd
        );
      }
    }
  });

  // After transformations, reinsert the original decorated properties
  const printer = ts.createPrinter();

  let result = printer.printFile(updatedSourceFile);

  // Replace the transformed decorated properties with their original text
  for (const [name, originalText] of Object.entries(
    originalDecoratedProperties
  )) {
    const regex = new RegExp(`private\\s+${name}\\s*[:=]`, "g"); // Regex to find the private transformed part
    result = result.replace(regex, originalText);
  }

  return updatedSourceFile;
}

// Utility function to check if a variable or method has decorators
function hasDecorator(
  sourceFile: ts.SourceFile,
  declarationName: string
): boolean {
  const node = getNodeByName(sourceFile, declarationName);
  if (
    node &&
    (ts.isPropertyDeclaration(node) || ts.isMethodDeclaration(node))
  ) {
    const decorators = ts.getDecorators(node);
    return decorators !== undefined && decorators.length > 0;
  }
  return false;
}

// Utility function to get a node by its name
function getNodeByName(
  sourceFile: ts.SourceFile,
  name: string
): ts.Node | undefined {
  let foundNode: ts.Node | undefined;

  function findNode(node: ts.Node) {
    if (
      ts.isClassElement(node) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      node.name.text === name
    ) {
      foundNode = node;
      return;
    }
    ts.forEachChild(node, findNode);
  }

  findNode(sourceFile);
  return foundNode;
}
