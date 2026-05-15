export type ValidationKind =
  | "CircularDependency"
  | "MissingDependency"
  | "MissingLabel"
  | "UnusedLabel"
  | "UnsupportedDependencies";

export type ConcurrentError =
  | { kind: "validation"; issues: ValidationIssue[] }
  | { kind: "parse"; message: string }
  | { kind: "render"; message: string }
  | { kind: "invalid-type"; value: string }
  | { kind: "invalid-params" }
  | { kind: "unknown"; message: string };

export type ValidationIssue = {
  kind: ValidationKind;
  label: string;
  code: string;
  message: string;
};

const VALIDATION_LABELS: Record<ValidationKind, string> = {
  CircularDependency: "Circular dependency",
  MissingDependency: "Missing dependency",
  MissingLabel: "Missing label",
  UnusedLabel: "Unused label",
  UnsupportedDependencies: "Unsupported dependencies",
};

const VALIDATION_CODES: Record<ValidationKind, string> = {
  CircularDependency: "CIRCULAR_DEPENDENCY",
  MissingDependency: "MISSING_DEPENDENCY",
  MissingLabel: "MISSING_LABEL",
  UnusedLabel: "UNUSED_LABEL",
  UnsupportedDependencies: "UNSUPPORTED_DEPENDENCIES",
};

export function parseConcurrentError(err: unknown): ConcurrentError {
  const raw = toRawMessage(err).trim();

  if (raw.startsWith("Errors:")) {
    const issues = extractValidationIssues(raw);
    if (issues.length > 0) return { kind: "validation", issues };
  }

  const parse = raw.match(/^Parse error:\s*([\s\S]*)$/);
  if (parse) return { kind: "parse", message: parse[1].trim() };

  const render = raw.match(/^Render error:\s*([\s\S]*)$/);
  if (render) return { kind: "render", message: render[1].trim() };

  const invalidType = raw.match(/^Invalid type:\s*([\s\S]*)$/);
  if (invalidType) return { kind: "invalid-type", value: invalidType[1].trim() };

  if (raw === "Invalid parameters") return { kind: "invalid-params" };

  return { kind: "unknown", message: raw };
}

export function errorTitle(error: ConcurrentError): string {
  switch (error.kind) {
    case "validation":
      return error.issues.length === 1
        ? "Validation failed"
        : `${error.issues.length} validation issues`;
    case "parse":
      return "Parse error";
    case "render":
      return "Render error";
    case "invalid-type":
      return "Unknown language";
    case "invalid-params":
      return "Invalid parameters";
    case "unknown":
      return "Conversion failed";
  }
}

function toRawMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return String(err);
}

function extractValidationIssues(raw: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const pattern =
    /ValidationError\s*\{\s*kind:\s*(\w+)\s*,\s*message:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*\}/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(raw)) !== null) {
    const kind = match[1] as ValidationKind;
    issues.push({
      kind,
      label: VALIDATION_LABELS[kind] ?? kind,
      code: VALIDATION_CODES[kind] ?? kind.toUpperCase(),
      message: prettifyMessage(unescapeString(match[2])),
    });
  }
  return issues;
}

function prettifyMessage(value: string): string {
  return value.replace(/ -> /g, " → ");
}

function unescapeString(value: string): string {
  return value.replace(/\\(.)/g, (_, c: string) => {
    switch (c) {
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      default:
        return c;
    }
  });
}
