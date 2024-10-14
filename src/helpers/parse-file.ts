import * as ts from "typescript";
import * as fs from "fs";

export function parseTsFile(filePath: string) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );
  return sourceFile;
}
