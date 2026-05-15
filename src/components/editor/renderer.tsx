import { graphData, layoutGraph } from "@/lib/concurrent";
import { useEditorStore } from "@/store/editor";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
} from "@xyflow/react";
import { useMemo } from "react";
import { CoreNode } from "@/components/editor/node";

const nodeTypes = { concurrent: CoreNode };

export function Renderer() {
  const ir = useEditorStore((state) => state.ir);

  const { nodes, edges } = useMemo(() => {
    try {
      const data = graphData(ir, "graph");
      return layoutGraph(data);
    } catch {
      return { nodes: [], edges: [] };
    }
  }, [ir]);

  return (
    <div className="h-full w-full bg-zinc-50">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        colorMode="dark"
        fitView
        nodesDraggable
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          patternClassName="fill-white/30"
        />
        <Controls showInteractive={true} />
      </ReactFlow>
    </div>
  );
}
