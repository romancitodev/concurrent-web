import Editor from "@/components/editor/core";
import { convertGraph } from "@/lib/concurrent";
import { useEditorStore } from "@/store/editor";

export function Playground() {
  const from = useEditorStore((state) => state.from);
  const code = useEditorStore((state) => state.code);
  const setCode = useEditorStore((state) => state.setCode);
  const setIR = useEditorStore((state) => state.setIR);

  const handleOnChange = (next: string | undefined) => {
    const value = next ?? "";
    setCode(value);
    if (!value.trim()) {
      setIR("");
      return;
    }
    try {
      const ir = convertGraph(value, from, "graph");
      setIR(ir);
    } catch {
      // keep previous IR so the renderer doesn't flicker on transient errors
    }
  };

  return (
    <div className="flex w-full h-full">
      <Editor
        height="100%"
        language={from}
        value={code}
        onChange={handleOnChange}
      />
    </div>
  );
}
