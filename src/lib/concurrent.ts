import {
  convert_graph_string_wasm as convertGraph,
  graph_data_wasm,
  render_graph_to_svg_wasm as renderGraph,
} from "concurrent";
import Dagre from "@dagrejs/dagre";
import { MarkerType, type Edge, type Node } from "@xyflow/react";

export { convertGraph, renderGraph };

export type GraphNodeData = { id: string };
export type GraphEdgeKind = "flow" | "dep";
export type GraphEdgeData = { from: string; to: string; kind: GraphEdgeKind };
export type GraphData = { nodes: GraphNodeData[]; edges: GraphEdgeData[] };

export function graphData(input: string, format: string): GraphData {
  return graph_data_wasm(input, format) as GraphData;
}

export type FlowNodeData = { id: string; terminal: boolean };

const NODE_WIDTH = 64;
const NODE_HEIGHT = 64;

export function layoutGraph(
  data: GraphData,
  options: {
    nodeWidth?: number;
    nodeHeight?: number;
    rankSep?: number;
    nodeSep?: number;
  } = {},
): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  const width = options.nodeWidth ?? NODE_WIDTH;
  const height = options.nodeHeight ?? NODE_HEIGHT;

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "TB",
    ranker: "network-simplex",
    ranksep: options.rankSep ?? 60,
    nodesep: options.nodeSep ?? 40,
    marginx: 32,
    marginy: 32,
  });

  for (const node of data.nodes) g.setNode(node.id, { width, height });
  for (const edge of data.edges) g.setEdge(edge.from, edge.to);

  Dagre.layout(g);

  const terminals = new Set<string>();
  const hasOutgoing = new Set<string>();
  for (const edge of data.edges) hasOutgoing.add(edge.from);
  for (const node of data.nodes) {
    if (!hasOutgoing.has(node.id)) terminals.add(node.id);
  }

  const nodes: Node<FlowNodeData>[] = data.nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      id: node.id,
      type: "concurrent",
      position: { x: pos.x - width / 2, y: pos.y - height / 2 },
      data: { id: node.id, terminal: terminals.has(node.id) },
    };
  });

  const edges: Edge[] = data.edges.map((edge) => {
    const isDep = edge.kind === "dep";
    const color = isDep ? "#a78bfa" : "#71717a";
    return {
      id: `${edge.from}->${edge.to}`,
      source: edge.from,
      target: edge.to,
      type: "bezier",
      animated: isDep,
      style: isDep
        ? { strokeDasharray: "4 4", stroke: color }
        : { stroke: color },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color,
      },
      data: { kind: edge.kind },
    };
  });

  return { nodes, edges };
}
