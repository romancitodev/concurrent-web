import Editor from "@/components/editor/core";
import { convertGraph } from "@/lib/concurrent";
import { useEditorStore } from "@/store/editor";

export function Playground() {
  const from = useEditorStore((state) => state.from);
  const setCode = useEditorStore((state) => state.setCode);
  const setIR = useEditorStore((state) => state.setIR);

  const handleOnChange = (code: string | undefined) => {
    if (!code) return;
    try {
      const ir = convertGraph(code, from, "graph");
      setCode(code);
      setIR(ir);
    } catch {
      setCode(code);
    }
  };

  return (
    <div className="flex w-full h-full">
      <Editor height="100%" language={from} onChange={handleOnChange} />
    </div>
  );
}
