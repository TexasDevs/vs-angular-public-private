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

  const result =
    interpolationRegex.test(htmlContent) ||
    propertyBindingRegex.test(htmlContent) ||
    eventBindingRegex.test(htmlContent) ||
    directBindingRegex.test(htmlContent);

  return result;
}
