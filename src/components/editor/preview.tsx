import Editor from "@/components/editor/core";
import { convertGraph } from "@/lib/concurrent";
import { useEditorStore } from "@/store/editor";
import { useMemo } from "react";

export function Preview() {
  const from = useEditorStore((state) => state.from);
  const to = useEditorStore((state) => state.to);
  const code = useEditorStore((state) => state.code);
  const converted = useMemo(() => {
    try {
      return convertGraph(code, from, to);
    } catch {}
  }, [code, from, to]);
  return (
    <div className="flex w-full h-full">
      <Editor
        height="100%"
        language={to}
        options={{ readOnly: true }}
        value={converted ?? ""}
      />
    </div>
  );
}
