export function templateVariables(body: string): string[] {
  return [
    ...new Set(
      Array.from(body.matchAll(/{{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*}}/g), (match) => match[1]),
    ),
  ];
}

export function renderTemplate(
  body: string,
  values: Record<string, string | number | boolean> = {},
): string {
  const required = templateVariables(body);
  const missing = required.filter((key) => values[key] === undefined || values[key] === null);
  if (missing.length) throw new Error(`Missing template variables: ${missing.join(", ")}`);
  return body.replace(/{{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*}}/g, (_, key: string) =>
    String(values[key]),
  );
}
