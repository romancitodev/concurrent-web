import { renderGraph } from "@/lib/concurrent";
import { useEditorStore } from "@/store/editor";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
} from "@xyflow/react";
import { useMemo } from "react";
import { Node } from "@/components/editor/node";

export function Renderer() {
  const ir = useEditorStore((state) => state.ir);

  const svgNode = useMemo(() => {
    try {
      return renderGraph(ir, "graph");
    } catch {
      return "";
    }
  }, [ir]);

  console.log(svgNode);

  function sanitizeSvg(svgString: string) {
    return svgString
      .replaceAll(/(\<path[^>]*stroke="[^"]*")/g, '$1 stroke-dasharray="5,5"')
      .replaceAll(/(\<path[^>]*stroke=")(#[0-9a-fA-F]{8})/g, "$1#e3e3e3");
  }

  const nodes = [
    {
      id: "1",
      type: "svg",
      data: { svg: sanitizeSvg(svgNode) },
      position: { x: 0, y: 0 },
    },
  ];
  const nodeTypes = { svg: Node };

  return (
    <div className="w-full h-full bg-zinc-50">
      <ReactFlow nodeTypes={nodeTypes} nodes={nodes} colorMode="dark" fitView>
        <Background
          variant={BackgroundVariant.Dots}
          patternClassName="fill-white/30"
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
