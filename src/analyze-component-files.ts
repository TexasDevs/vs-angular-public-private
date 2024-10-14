import * as ts from "typescript";
import { updateToPrivate } from "./update-to-private";
import { getDeclarations } from "./get-declarations";
import { isUsedInHtml } from "./is-used-html";

export function analyzeComponentFiles(
  tsSourceFile: ts.SourceFile,
  htmlContent: string
): ts.SourceFile {
  // Extract the declarations from the TS file
  const declarations = getDeclarations(tsSourceFile);
  console.log("Declarations Found:", declarations);

  // Create a copy of the source file to apply transformations sequentially
  let updatedSourceFile = tsSourceFile;

  // Iterate over the declarations and update the private status based on HTML usage
  declarations.variables.forEach((variable) => {
    const isUsed = isUsedInHtml(htmlContent, variable);
    console.log(`Variable '${variable}' used in HTML: ${isUsed}`);
    if (!isUsed) {
      updatedSourceFile = updateToPrivate(updatedSourceFile, variable);
    }
  });

  declarations.functions.forEach((fn) => {
    const isUsed = isUsedInHtml(htmlContent, fn);
    console.log(`Function '${fn}' used in HTML: ${isUsed}`);
    if (!isUsed) {
      updatedSourceFile = updateToPrivate(updatedSourceFile, fn);
    }
  });

  return updatedSourceFile;
}
