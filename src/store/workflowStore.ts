import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { WorkflowNodeData } from "../types/workflow.types";

type WorkflowNode = Node & { data: WorkflowNodeData };

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  isSandboxOpen: boolean;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  setSelectedNode: (nodeId: string | null) => void;
  deleteNode: (nodeId: string) => void;
  setIsSandboxOpen: (open: boolean) => void;
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
  clearWorkflow: () => void;
}

const INITIAL_NODES: WorkflowNode[] = [
  {
    id: "start-1",
    type: "startNode",
    position: { x: 250, y: 80 },
    data: { type: "startNode", title: "Start Onboarding", metadata: [] },
  },
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: [],
  selectedNodeId: null,
  isSandboxOpen: false,

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as WorkflowNode[],
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: "#6366f1", strokeWidth: 2 },
        },
        state.edges
      ),
    })),

  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData }
          : n
      ),
    })),

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNodeId:
        state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    })),

  setIsSandboxOpen: (open) => set({ isSandboxOpen: open }),

  exportWorkflow: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges }, null, 2);
  },

  importWorkflow: (json) => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.nodes && parsed.edges) {
        set({ nodes: parsed.nodes, edges: parsed.edges, selectedNodeId: null });
      }
    } catch {
      console.error("Invalid workflow JSON");
    }
  },

  clearWorkflow: () =>
    set({ nodes: INITIAL_NODES, edges: [], selectedNodeId: null }),
}));