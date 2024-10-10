export function isUsedInHtml(
  htmlContent: string,
  variableOrFunction: string
): boolean {
  const interpolationRegex = new RegExp(
    `{{\\s*${variableOrFunction}\\s*}}`,
    "g"
  );
  const bindingRegex = new RegExp(
    `\$begin:math:display$.*?\\$end:math:display$\\s*=\\s*"${variableOrFunction}"`,
    "g"
  );
  const eventRegex = new RegExp(
    `\$begin:math:text$.*?\\$end:math:text$\\s*=\\s*"${variableOrFunction}\$begin:math:text$.*?\\$end:math:text$"`,
    "g"
  );

  return (
    interpolationRegex.test(htmlContent) ||
    bindingRegex.test(htmlContent) ||
    eventRegex.test(htmlContent)
  );
}
