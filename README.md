# Angular Component Analyzer

The Angular Component Analyzer is a Visual Studio Code extension that automatically analyzes your Angular component files to optimize code visibility and maintainability. It inspects `.component.ts` and `.component.html` files, ensuring that:

- Functions and variables defined in the `.ts` file and **not used** in the HTML are marked as `private`.
- Properties decorated with Angular-specific decorators like `@Input()`, `@Output()`, or lifecycle hooks such as `ngOnInit` remain public.

This extension helps keep your Angular code clean and structured, reducing the need for manual oversight. Perfect for developers aiming to improve code readability and enforce best practices in their projects.

## Key Features

- Automatically analyzes Angular component files (`.component.ts` and `.component.html`).
- Automatically marks unused functions and variables in `.ts` files as `private`.
- Preserves public access for properties with decorators like `@Input()` and Angular lifecycle hooks.
- Helps maintain clean and maintainable Angular components.

## How to Use

1. Run the extension on an open `.component.ts` file or right-click on a folder to analyze all components in that folder.
2. The extension will scan the component and apply the necessary visibility changes automatically.

Keep your Angular components tidy and improve code structure with ease!
