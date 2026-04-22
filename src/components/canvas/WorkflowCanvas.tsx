import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "../../store/workflowStore";
import {
  StartNode,
  TaskNode,
  ApprovalNode,
  AutomatedNode,
  EndNode,
} from "../nodes/CustomNodes";
import type { NodeType, WorkflowNodeData } from "../../types/workflow.types";

const NODE_TYPES = {
  startNode: StartNode,
  taskNode: TaskNode,
  approvalNode: ApprovalNode,
  automatedNode: AutomatedNode,
  endNode: EndNode,
};

const DEFAULT_DATA: Record<NodeType, WorkflowNodeData> = {
  startNode: { type: "startNode", title: "Start", metadata: [] },
  taskNode: { type: "taskNode", title: "New Task", description: "", assignee: "", dueDate: "", customFields: [] },
  approvalNode: { type: "approvalNode", title: "Approval Required", approverRole: "Manager", autoApproveThreshold: 80 },
  automatedNode: { type: "automatedNode", title: "Automated Step", actionId: "", actionParams: {} },
  endNode: { type: "endNode", endMessage: "Workflow complete", showSummary: false },
};

let nodeCounter = 100;

type WorkflowNode = Node & { data: WorkflowNodeData };

export function WorkflowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode } = useWorkflowStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<{ screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number } } | null>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow") as NodeType;
      if (!type || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const pos = rfInstance?.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      }) ?? { x: e.clientX - bounds.left, y: e.clientY - bounds.top };

      const id = `${type}-${++nodeCounter}`;
      const newNode: WorkflowNode = {
        id,
        type,
        position: pos,
        data: { ...DEFAULT_DATA[type] },
      };

      addNode(newNode);
      setSelectedNode(id);
    },
    [rfInstance, addNode, setSelectedNode]
  );

  return (
    <div ref={reactFlowWrapper} style={{ flex: 1, height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NODE_TYPES}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        onInit={setRfInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#2a2d3e" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              startNode: "#22c55e",
              taskNode: "#6366f1",
              approvalNode: "#f59e0b",
              automatedNode: "#06b6d4",
              endNode: "#ef4444",
            };
            return colors[node.type ?? ""] ?? "#6b7280";
          }}
          maskColor="rgba(15,17,23,0.8)"
        />
      </ReactFlow>
    </div>
  );
}