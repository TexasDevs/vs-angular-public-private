export function isUsedInHtml(
  htmlContent: string,
  variableOrFunction: string
): boolean {
  // Improved regular expressions without the global 'g' flag
  const interpolationRegex = new RegExp(`{{\\s*${variableOrFunction}\\s*}}`);
  const propertyBindingRegex = new RegExp(
    `\$begin:math:display$\\\\s*\\\\w+\\\\s*\\$end:math:display$\\s*=\\s*['"]?${variableOrFunction}['"]?`
  );
  const eventBindingRegex = new RegExp(
    `\$begin:math:text$.*?\\$end:math:text$\\s*=\\s*['"]?${variableOrFunction}\$begin:math:text$.*?\\$end:math:text$['"]?`
  );
  const directBindingRegex = new RegExp(`\\b${variableOrFunction}\\b`);

  console.log(`Checking for variable/function: ${variableOrFunction}`);
  console.log(`Interpolation match:`, interpolationRegex.test(htmlContent));
  console.log(
    `Property binding match:`,
    propertyBindingRegex.test(htmlContent)
  );
  console.log(`Event binding match:`, eventBindingRegex.test(htmlContent));
  console.log(`Direct binding match:`, directBindingRegex.test(htmlContent));

  const result =
    interpolationRegex.test(htmlContent) ||
    propertyBindingRegex.test(htmlContent) ||
    eventBindingRegex.test(htmlContent) ||
    directBindingRegex.test(htmlContent);

  console.log(`Final result for ${variableOrFunction}: ${result}`);
  return result;
}
