import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { FlowNodeData } from "@/lib/concurrent";

type ConcurrentNode = Node<FlowNodeData, "concurrent">;

export function CoreNode({ data }: NodeProps<ConcurrentNode>) {
  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full border-2 font-mono text-sm shadow-sm transition-colors",
        data.terminal
          ? "border-amber-400/70 bg-amber-950/40 text-amber-100"
          : "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-zinc-600 !bg-zinc-800"
      />
      <span>{data.id}</span>
      {!data.terminal && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-2 !w-2 !border-zinc-600 !bg-zinc-800"
        />
      )}
    </div>
  );
}
