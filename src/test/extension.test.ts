import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';
import * as ts from "typescript";
import * as prettier from "prettier";
import * as fs from "fs";
import { updateToPrivate } from "../helpers/update-to-private";
import { analyzeComponentFiles } from "../analyze-component-files";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Test analyzing component with HTML references and updating to private", async () => {
    // Simulate a TypeScript file for testing, representing an Angular component
    const tsInputCode = `
        import { Component, Input } from '@angular/core';

        @Component({
            selector: 'app-test',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.css']
        })
        export class TestComponent {
            variable1 = 'test';

            functionTest() {}

            @Input() test: string;

            private myPrivateFunction() {}
        }
        `;

    // Simulate an HTML file content that references only variable1 and test
    const htmlInputCode = `
        <div>
            {{ variable1 }}
            <input [value]="test" />
        </div>
        `;

    // Expected result after running your extension's analysis
    const expectedTsOutput = `
        import { Component, Input } from '@angular/core';

        @Component({
            selector: 'app-test',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.css']
        })
        export class TestComponent {
            variable1 = 'test';

            private functionTest() {}

            @Input() test: string;

            private myPrivateFunction() {}
        }
        `;

    // Simulate creating a TypeScript SourceFile
    const sourceFile = ts.createSourceFile(
      "test.component.ts",
      tsInputCode,
      ts.ScriptTarget.Latest,
      true
    );

    // Call your extension's logic to analyze both TS and HTML files
    const updatedSourceFile = analyzeComponentFiles(sourceFile, htmlInputCode);

    // Convert the updated SourceFile back to string
    const printer = ts.createPrinter();
    const result = printer.printFile(updatedSourceFile);

    // Use Prettier to format the result and expected output
    const formattedResult = await prettier.format(result, {
      parser: "typescript",
    });
    const formattedExpectedOutput = await prettier.format(expectedTsOutput, {
      parser: "typescript",
    });

    // Log the outputs for debugging
    console.log("Formatted Actual Result:\n", formattedResult);
    console.log("Formatted Expected Output:\n", formattedExpectedOutput);

    // Assert that the result matches the expected output
    assert.strictEqual(
      formattedResult.trim(),
      formattedExpectedOutput.trim(),
      "The transformation did not produce the expected result."
    );
  });

  test("Should ignore lifecycle hooks and decorated properties", () => {
    const sourceCode = `
      import { Component, Input, Output, EventEmitter } from '@angular/core';

      @Component({
        selector: 'app-test',
        templateUrl: './test.component.html',
        styleUrls: ['./test.component.css']
      })
      export class TestComponent implements OnInit, OnDestroy {

        @Input() inputProp: string = '';
        @Output() outputProp = new EventEmitter<string>();

        variable1: string = 'test';

        ngOnInit(): void {
          console.log('ngOnInit called');
        }

        ngOnDestroy(): void {
          console.log('ngOnDestroy called');
        }

        unusedMethod(): void {
          console.log('This method is not used in the HTML');
        }

        anotherUnusedMethod(): void {
          console.log('Another unused method');
        }
      }
    `;

    const htmlContent = `
      <div>{{ inputProp }}</div>
    `;

    // Parse the TypeScript code
    const sourceFile = ts.createSourceFile(
      "test.component.ts",
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    // Run the analysis
    const updatedSourceFile = analyzeComponentFiles(sourceFile, htmlContent);

    // Convert the updated source file back to a string
    const printer = ts.createPrinter();
    const result = printer.printFile(updatedSourceFile);
    console.log("final", result);
    // Check the output
    assert.ok(
      result.includes("private variable1"),
      "variable1 should be private"
    );
    assert.ok(
      result.includes("private unusedMethod"),
      "unusedMethod should be private"
    );
    assert.ok(
      result.includes("private anotherUnusedMethod"),
      "anotherUnusedMethod should be private"
    );

    // Check lifecycle hooks remain public
    assert.ok(result.includes("ngOnInit"), "ngOnInit should remain public");
    assert.ok(
      result.includes("ngOnDestroy"),
      "ngOnDestroy should remain public"
    );

    // Check that decorated properties remain public
    assert.ok(
      result.includes("@Input() inputProp"),
      "inputProp should remain public"
    );
    assert.ok(
      result.includes("@Output() outputProp"),
      "outputProp should remain public"
    );
  });
});
