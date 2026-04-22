import type {
  AutomationAction,
  SerializedWorkflow,
  SimulationResult,
  SimulationStep,
  NodeType,
} from "../types/workflow.types";

const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: "send_email", label: "Send Email", params: ["to", "subject"] },
  { id: "generate_doc", label: "Generate Document", params: ["template", "recipient"] },
  { id: "notify_slack", label: "Notify Slack Channel", params: ["channel", "message"] },
  { id: "update_hris", label: "Update HRIS Record", params: ["employee_id", "field", "value"] },
  { id: "create_ticket", label: "Create IT Ticket", params: ["system", "priority", "summary"] },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(300);
  return MOCK_AUTOMATIONS;
}

export async function simulateWorkflow(workflow: SerializedWorkflow): Promise<SimulationResult> {
  await delay(800);

  const steps: SimulationStep[] = [];
  const errors: string[] = [];
  const { nodes, edges } = workflow;

  const startNodes = nodes.filter((n) => n.type === "startNode");
  const endNodes = nodes.filter((n) => n.type === "endNode");

  if (startNodes.length === 0) errors.push("Workflow must have exactly one Start node.");
  if (startNodes.length > 1) errors.push("Workflow has multiple Start nodes. Only one is allowed.");
  if (endNodes.length === 0) errors.push("Workflow must have at least one End node.");

  if (nodes.length > 1) {
    const connectedNodeIds = new Set<string>();
    edges.forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });
    const orphaned = nodes.filter((n) => !connectedNodeIds.has(n.id) && n.type !== "startNode");
    orphaned.forEach((n) => {
      errors.push(`Node "${(n.data as { title?: string; endMessage?: string }).title || n.type}" is not connected.`);
    });
  }

  const adjList: Record<string, string[]> = {};
  nodes.forEach((n) => (adjList[n.id] = []));
  edges.forEach((e) => {
    if (adjList[e.source]) adjList[e.source].push(e.target);
  });

  const hasCycle = (): boolean => {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);
      for (const neighbor of adjList[nodeId] || []) {
        if (!visited.has(neighbor) && dfs(neighbor)) return true;
        if (recStack.has(neighbor)) return true;
      }
      recStack.delete(nodeId);
      return false;
    };
    return nodes.some((n) => !visited.has(n.id) && dfs(n.id));
  };

  if (hasCycle()) errors.push("Workflow contains a cycle. Cycles are not allowed.");
  if (errors.length > 0) return { success: false, totalSteps: 0, steps: [], errors };

  const startNode = startNodes[0];
  const queue: string[] = [startNode.id];
  const visited = new Set<string>();

  const getNodeLabel = (nodeId: string): string => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return nodeId;
    const d = node.data as { title?: string; endMessage?: string };
    return d.title || d.endMessage || node.type;
  };

  const getStatusForType = (type: NodeType): SimulationStep["status"] => {
    switch (type) {
      case "startNode": return "info";
      case "taskNode": return "success";
      case "approvalNode": return "warning";
      case "automatedNode": return "success";
      case "endNode": return "info";
      default: return "info";
    }
  };

  const getMessageForNode = (nodeId: string): string => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return "Processed.";
    switch (node.type) {
      case "startNode": return "Workflow initiated. Entry point reached.";
      case "taskNode": {
        const d = node.data as { assignee?: string; dueDate?: string };
        return `Task assigned to ${d.assignee || "unassigned"}${d.dueDate ? ` | Due: ${d.dueDate}` : ""}.`;
      }
      case "approvalNode": {
        const d = node.data as { approverRole?: string; autoApproveThreshold?: number };
        return `Pending approval from ${d.approverRole || "approver"}. Auto-approve threshold: ${d.autoApproveThreshold ?? "N/A"}%.`;
      }
      case "automatedNode": {
        const d = node.data as { actionId?: string };
        return `Automated action "${d.actionId || "unknown"}" triggered successfully.`;
      }
      case "endNode": {
        const d = node.data as { endMessage?: string };
        return d.endMessage || "Workflow completed.";
      }
      default: return "Step processed.";
    }
  };

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    steps.push({
      nodeId,
      nodeType: node.type as NodeType,
      label: getNodeLabel(nodeId),
      status: getStatusForType(node.type as NodeType),
      message: getMessageForNode(nodeId),
      timestamp: new Date().toLocaleTimeString(),
    });

    const nextIds = edges.filter((e) => e.source === nodeId).map((e) => e.target);
    queue.push(...nextIds);
  }

  return { success: true, totalSteps: steps.length, steps, errors: [] };
}