import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';
import * as ts from "typescript";
import * as fs from "fs";
import { updateToPrivate } from "../update-to-private";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Test analyzing component and updating to private", async () => {
    // Simulate a TypeScript file for testing
    const inputCode = `
        variable1 = 'test';

        function functionTest() {}

        @Input() test: string;

        private myPrivateFunction() {}
        `;

    // Expected result after running your extension's command
    const expectedOutput = `
        variable1 = 'test';

        function functionTest() {}

        @Input() test: string;

        private myPrivateFunction() {}
        `;

    // Simulate creating a TypeScript SourceFile
    const sourceFile = ts.createSourceFile(
      "test.ts",
      inputCode,
      ts.ScriptTarget.Latest,
      true
    );

    // Use the function from your extension that performs the transformation
    const updatedSourceFile = updateToPrivate(sourceFile, "functionTest");

    // Convert updated SourceFile back to string
    const printer = ts.createPrinter();
    const result = printer.printFile(updatedSourceFile);

    // Assert that the result matches the expected output
    assert.strictEqual(
      result.trim(),
      expectedOutput.trim(),
      "The transformation did not produce the expected result."
    );
  });
});
