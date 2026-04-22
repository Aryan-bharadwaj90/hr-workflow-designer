import { useWorkflowStore } from "../../store/workflowStore";
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
  KeyValuePair,
} from "../../types/workflow.types";
import { useEffect, useState } from "react";
import { getAutomations } from "../../api/mockApi";
import type { AutomationAction } from "../../types/workflow.types";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0f1117",
  border: "1px solid #2a2d3e",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "12px",
  color: "#ffffff",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  display: "block",
  marginBottom: "4px",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function KVEditor({ pairs, onChange }: { pairs: KeyValuePair[]; onChange: (pairs: KeyValuePair[]) => void }) {
  const add = () => onChange([...pairs, { key: "", value: "" }]);
  const remove = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));
  const update = (i: number, field: "key" | "value", val: string) => {
    const next = [...pairs];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {pairs.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <input style={inputStyle} placeholder="key" value={p.key} onChange={(e) => update(i, "key", e.target.value)} />
          <input style={inputStyle} placeholder="value" value={p.value} onChange={(e) => update(i, "value", e.target.value)} />
          <button
            onClick={() => remove(i)}
            style={{ color: "#ef4444", fontSize: "12px", padding: "0 6px", background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={add}
        style={{ fontSize: "10px", color: "#6366f1", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        + Add field
      </button>
    </div>
  );
}

function StartForm({ data, nodeId }: { data: StartNodeData; nodeId: string }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Field label="Workflow Title">
        <input
          style={inputStyle}
          value={data.title}
          placeholder="e.g. Employee Onboarding"
          onChange={(e) => updateNodeData(nodeId, { title: e.target.value })}
        />
      </Field>
      <Field label="Metadata">
        <KVEditor pairs={data.metadata} onChange={(metadata) => updateNodeData(nodeId, { metadata })} />
      </Field>
    </div>
  );
}

function TaskForm({ data, nodeId }: { data: TaskNodeData; nodeId: string }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Field label="Title *">
        <input style={inputStyle} value={data.title} placeholder="Task title" onChange={(e) => updateNodeData(nodeId, { title: e.target.value })} />
      </Field>
      <Field label="Description">
        <textarea
          style={{ ...inputStyle, resize: "none" }}
          rows={2}
          value={data.description}
          placeholder="What does this task involve?"
          onChange={(e) => updateNodeData(nodeId, { description: e.target.value })}
        />
      </Field>
      <Field label="Assignee">
        <input style={inputStyle} value={data.assignee} placeholder="Name or role" onChange={(e) => updateNodeData(nodeId, { assignee: e.target.value })} />
      </Field>
      <Field label="Due Date">
        <input type="date" style={inputStyle} value={data.dueDate} onChange={(e) => updateNodeData(nodeId, { dueDate: e.target.value })} />
      </Field>
      <Field label="Custom Fields">
        <KVEditor pairs={data.customFields} onChange={(customFields) => updateNodeData(nodeId, { customFields })} />
      </Field>
    </div>
  );
}

function ApprovalForm({ data, nodeId }: { data: ApprovalNodeData; nodeId: string }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Field label="Title">
        <input style={inputStyle} value={data.title} placeholder="Approval step title" onChange={(e) => updateNodeData(nodeId, { title: e.target.value })} />
      </Field>
      <Field label="Approver Role">
        <select style={inputStyle} value={data.approverRole} onChange={(e) => updateNodeData(nodeId, { approverRole: e.target.value })}>
          <option value="">Select role</option>
          <option value="Manager">Manager</option>
          <option value="HRBP">HRBP</option>
          <option value="Director">Director</option>
          <option value="VP">VP</option>
          <option value="C-Suite">C-Suite</option>
        </select>
      </Field>
      <Field label="Auto-Approve Threshold (%)">
        <input
          type="number"
          style={inputStyle}
          value={data.autoApproveThreshold}
          min={0}
          max={100}
          placeholder="e.g. 80"
          onChange={(e) => updateNodeData(nodeId, { autoApproveThreshold: Number(e.target.value) })}
        />
      </Field>
    </div>
  );
}

function AutomatedForm({ data, nodeId }: { data: AutomatedNodeData; nodeId: string }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAutomations().then((a) => {
      setActions(a);
      setLoading(false);
    });
  }, []);

  const selectedAction = actions.find((a) => a.id === data.actionId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Field label="Title">
        <input style={inputStyle} value={data.title} placeholder="Automated step title" onChange={(e) => updateNodeData(nodeId, { title: e.target.value })} />
      </Field>
      <Field label="Action">
        {loading ? (
          <p style={{ fontSize: "10px", color: "#6b7280" }}>Loading actions...</p>
        ) : (
          <select
            style={inputStyle}
            value={data.actionId}
            onChange={(e) => updateNodeData(nodeId, { actionId: e.target.value, actionParams: {} })}
          >
            <option value="">Choose an action</option>
            {actions.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        )}
      </Field>
      {selectedAction && selectedAction.params.length > 0 && (
        <Field label="Action Parameters">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {selectedAction.params.map((param) => (
              <div key={param}>
                <label style={{ ...labelStyle, marginBottom: "4px" }}>{param}</label>
                <input
                  style={inputStyle}
                  placeholder={param}
                  value={data.actionParams?.[param] ?? ""}
                  onChange={(e) =>
                    updateNodeData(nodeId, {
                      actionParams: { ...data.actionParams, [param]: e.target.value },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </Field>
      )}
    </div>
  );
}

function EndForm({ data, nodeId }: { data: EndNodeData; nodeId: string }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Field label="End Message">
        <input
          style={inputStyle}
          value={data.endMessage}
          placeholder="e.g. Onboarding Complete!"
          onChange={(e) => updateNodeData(nodeId, { endMessage: e.target.value })}
        />
      </Field>
      <Field label="Show Summary">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => updateNodeData(nodeId, { showSummary: !data.showSummary })}
            style={{
              width: "40px",
              height: "20px",
              borderRadius: "10px",
              background: data.showSummary ? "#6366f1" : "#2a2d3e",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "2px",
                left: data.showSummary ? "22px" : "2px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#ffffff",
                transition: "left 0.2s",
              }}
            />
          </button>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            {data.showSummary ? "Enabled" : "Disabled"}
          </span>
        </div>
      </Field>
    </div>
  );
}

const NODE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  startNode: { label: "Start Node", color: "#22c55e", icon: "▶" },
  taskNode: { label: "Task Node", color: "#6366f1", icon: "✓" },
  approvalNode: { label: "Approval Node", color: "#f59e0b", icon: "⚖" },
  automatedNode: { label: "Automated Node", color: "#06b6d4", icon: "⚙" },
  endNode: { label: "End Node", color: "#ef4444", icon: "■" },
};

export function NodeEditPanel() {
  const { nodes, selectedNodeId, setSelectedNode, deleteNode } = useWorkflowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside
        style={{
          width: "256px",
          height: "100%",
          background: "#1a1d27",
          borderLeft: "1px solid #2a2d3e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div style={{ fontSize: "24px", marginBottom: "12px" }}>✦</div>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>No node selected</p>
        <p style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>
          Click a node on the canvas to configure it
        </p>
      </aside>
    );
  }

  const meta = NODE_LABELS[selectedNode.type ?? ""] ?? { label: "Node", color: "#6b7280", icon: "?" };
  const data = selectedNode.data;

  return (
    <aside
      style={{
        width: "256px",
        height: "100%",
        background: "#1a1d27",
        borderLeft: "1px solid #2a2d3e",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: `1px solid ${meta.color}33`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: meta.color }}>{meta.icon}</span>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>{meta.label}</p>
            <p style={{ fontSize: "10px", color: "#6b7280", fontFamily: "monospace" }}>{selectedNode.id}</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {data.type === "startNode" && <StartForm data={data} nodeId={selectedNode.id} />}
        {data.type === "taskNode" && <TaskForm data={data} nodeId={selectedNode.id} />}
        {data.type === "approvalNode" && <ApprovalForm data={data} nodeId={selectedNode.id} />}
        {data.type === "automatedNode" && <AutomatedForm data={data} nodeId={selectedNode.id} />}
        {data.type === "endNode" && <EndForm data={data} nodeId={selectedNode.id} />}
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid #2a2d3e" }}>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          style={{
            width: "100%",
            fontSize: "12px",
            color: "#ef4444",
            border: "1px solid #ef444433",
            background: "none",
            borderRadius: "8px",
            padding: "8px",
            cursor: "pointer",
          }}
        >
          Delete Node
        </button>
      </div>
    </aside>
  );
}