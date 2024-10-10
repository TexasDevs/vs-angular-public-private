import * as vscode from "vscode";
import * as ts from "typescript";
import { updateToPrivate } from "./update-to-private";

export async function analyzeAngularComponent(
  document: vscode.TextDocument
): Promise<void> {
  const sourceCode = document.getText();

  // Parse the source code into a TypeScript SourceFile
  const sourceFile = ts.createSourceFile(
    document.fileName,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  // Analyze the sourceFile to get all declarations
  // You'll need to implement the logic to find the unused members in the .html file

  const updatedSourceFile = updateToPrivate(sourceFile, "declarationName"); // Pass declaration name dynamically

  // Convert the updated SourceFile back to string
  const printer = ts.createPrinter();
  const updatedCode = printer.printFile(updatedSourceFile);

  // Apply the updated code to the document
  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(sourceCode.length)
  );
  edit.replace(document.uri, fullRange, updatedCode);

  // Apply the edit to the workspace
  await vscode.workspace.applyEdit(edit);
}
