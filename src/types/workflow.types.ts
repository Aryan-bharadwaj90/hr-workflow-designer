export type NodeType =
  | "startNode"
  | "taskNode"
  | "approvalNode"
  | "automatedNode"
  | "endNode";

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface StartNodeData {
  type: "startNode";
  title: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData {
  type: "taskNode";
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData {
  type: "approvalNode";
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeData {
  type: "automatedNode";
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData {
  type: "endNode";
  endMessage: string;
  showSummary: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export type SimulationStepStatus = "success" | "warning" | "error" | "info";

export interface SimulationStep {
  nodeId: string;
  nodeType: NodeType;
  label: string;
  status: SimulationStepStatus;
  message: string;
  timestamp: string;
}

export interface SimulationResult {
  success: boolean;
  totalSteps: number;
  steps: SimulationStep[];
  errors: string[];
}

export interface SerializedWorkflow {
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: WorkflowNodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
}