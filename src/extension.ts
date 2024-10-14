// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { analyzeComponentFiles } from "./analyze-component-files";
import * as ts from "typescript";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "publicprivate" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "publicprivate.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from VS!");
    }
  );

  context.subscriptions.push(disposable);

  const analyzeComponentCommand = vscode.commands.registerCommand(
    "publicprivate.analyzeComponent",
    async () => {
      const activeEditor = vscode.window.activeTextEditor;

      if (
        !activeEditor ||
        !activeEditor.document.fileName.endsWith(".component.ts")
      ) {
        vscode.window.showWarningMessage(
          "Please open a .component.ts file to analyze."
        );
        return;
      }

      const tsContent = activeEditor.document.getText();
      const htmlFilePath = activeEditor.document.fileName.replace(
        ".component.ts",
        ".component.html"
      );
      const htmlDocument =
        await vscode.workspace.openTextDocument(htmlFilePath);
      const htmlContent = htmlDocument.getText();

      // Parse the TypeScript file into a SourceFile
      const sourceFile = ts.createSourceFile(
        activeEditor.document.fileName,
        tsContent,
        ts.ScriptTarget.Latest,
        true
      );

      // Perform the analysis using both TS and HTML files
      const updatedSourceFile = analyzeComponentFiles(sourceFile, htmlContent);

      // Convert the updated SourceFile back to a string and apply changes to the document
      const printer = ts.createPrinter();
      const updatedTsContent = printer.printFile(updatedSourceFile);
      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        activeEditor.document.positionAt(0),
        activeEditor.document.positionAt(tsContent.length)
      );
      edit.replace(activeEditor.document.uri, fullRange, updatedTsContent);
      await vscode.workspace.applyEdit(edit);

      vscode.window.showInformationMessage("Component analysis complete!");
    }
  );

  context.subscriptions.push(analyzeComponentCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
