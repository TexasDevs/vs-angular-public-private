import { getDeclarations } from "./get-declarations";
import { isUsedInHtml } from "./is-used-html";
import { parseTsFile } from "./parse-file";
import * as fs from "fs";
import { updateToPrivate } from "./update-to-private";

export function analyzeComponent(tsFilePath: string, htmlFilePath: string) {
  const tsSourceFile = parseTsFile(tsFilePath);
  const declarations = getDeclarations(tsSourceFile);
  const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");

  // Check each variable and function
  declarations.variables.forEach((variable) => {
    if (!isUsedInHtml(htmlContent, variable)) {
      console.log(`${variable} is not used in HTML. Marking it as private.`);
      const updatedSourceFile = updateToPrivate(tsSourceFile, variable);
      // Write the updated .ts file
      fs.writeFileSync(tsFilePath, updatedSourceFile.getFullText());
    }
  });

  declarations.functions.forEach((fn) => {
    if (!isUsedInHtml(htmlContent, fn)) {
      console.log(`${fn} is not used in HTML. Marking it as private.`);
      const updatedSourceFile = updateToPrivate(tsSourceFile, fn);
      // Write the updated .ts file
      fs.writeFileSync(tsFilePath, updatedSourceFile.getFullText());
    }
  });
}
