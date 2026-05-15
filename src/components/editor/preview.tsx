import { useEffect, useState } from "react";
import Editor from "@/components/editor/core";
import { convertGraph } from "@/lib/concurrent";
import { type ConcurrentError, parseConcurrentError } from "@/lib/error";
import { useEditorStore } from "@/store/editor";

export function Preview() {
  const from = useEditorStore((state) => state.from);
  const to = useEditorStore((state) => state.to);
  const code = useEditorStore((state) => state.code);

  const [output, setOutput] = useState("");
  const [error, setError] = useState<ConcurrentError | null>(null);

  useEffect(() => {
    if (!code.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const value = convertGraph(code, from, to);
      setOutput(value);
      setError(null);
    } catch (e) {
      setError(parseConcurrentError(e));
    }
  }, [code, from, to]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={to}
          options={{ readOnly: true }}
          value={output}
        />
      </div>
      {error && <ErrorPanel error={error} />}
    </div>
  );
}

function ErrorPanel({ error }: { error: ConcurrentError }) {
  const issueCount = error.kind === "validation" ? error.issues.length : 1;

  return (
    <div className="relative max-h-48 overflow-y-auto border-t border-destructive/35 bg-destructive/5">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-0.75 bg-destructive"
      />
      <div className="px-4 py-2.5 pl-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center border border-destructive/50 bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-destructive">
            ERR
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-destructive/85">
            {errorSubtitle(error)}
          </span>
          <span
            aria-hidden
            className="flex-1 select-none overflow-hidden text-destructive/25 leading-none"
          >
            <DottedRule />
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] tabular-nums text-destructive/55">
            {issueCount.toString().padStart(2, "0")}{" "}
            {issueCount === 1 ? "issue" : "issues"}
          </span>
        </div>
        <div className="mt-2.5">
          <ErrorBody error={error} />
        </div>
      </div>
    </div>
  );
}

function DottedRule() {
  return (
    <span className="block whitespace-nowrap tracking-[0.3em] text-[10px]">
      {".".repeat(200)}
    </span>
  );
}

function errorSubtitle(error: ConcurrentError): string {
  switch (error.kind) {
    case "validation":
      return "validation failed";
    case "parse":
      return "parse error";
    case "render":
      return "render error";
    case "invalid-type":
      return "unknown language";
    case "invalid-params":
      return "invalid parameters";
    case "unknown":
      return "conversion failed";
  }
}

function ErrorBody({ error }: { error: ConcurrentError }) {
  if (error.kind === "validation") {
    return (
      <ul className="space-y-1.5">
        {error.issues.map((issue, i) => (
          <li
            key={i}
            className="grid grid-cols-[auto_minmax(8rem,auto)_1fr] items-baseline gap-x-3 text-[11px] leading-relaxed"
          >
            <span className="font-medium tabular-nums text-destructive/40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-destructive/85">
              {issue.code}
            </span>
            <span className="wrap-break-word text-foreground/90">
              {issue.message}
            </span>
          </li>
        ))}
      </ul>
    );
  }
  if (error.kind === "parse" || error.kind === "render") {
    return (
      <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/90">
        {error.message}
      </pre>
    );
  }
  if (error.kind === "invalid-type") {
    return (
      <p className="text-[11px] text-foreground/90">
        unknown language:{" "}
        <code className="font-medium text-destructive">{error.value}</code>
      </p>
    );
  }
  if (error.kind === "invalid-params") {
    return (
      <p className="text-[11px] text-foreground/90">
        the conversion received invalid parameters.
      </p>
    );
  }
  return (
    <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/90">
      {error.message}
    </pre>
  );
}
