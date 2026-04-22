import type { NodeType } from "../../types/workflow.types";

interface NodeDef {
  type: NodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const NODE_DEFS: NodeDef[] = [
  {
    type: "startNode",
    label: "Start",
    icon: "▶",
    color: "#22c55e",
    description: "Workflow entry point",
  },
  {
    type: "taskNode",
    label: "Task",
    icon: "✓",
    color: "#6366f1",
    description: "Human task assignment",
  },
  {
    type: "approvalNode",
    label: "Approval",
    icon: "⚖",
    color: "#f59e0b",
    description: "Manager/HR approval step",
  },
  {
    type: "automatedNode",
    label: "Automated",
    icon: "⚙",
    color: "#06b6d4",
    description: "System-triggered action",
  },
  {
    type: "endNode",
    label: "End",
    icon: "■",
    color: "#ef4444",
    description: "Workflow completion",
  },
];

export function NodeSidebar() {
  const onDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      className="flex flex-col h-full"
      style={{ width: "224px", background: "#1a1d27", borderRight: "1px solid #2a2d3e" }}
    >
      <div style={{ padding: "16px", borderBottom: "1px solid #2a2d3e" }}>
        <h1 style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.1em" }}>
          HR WORKFLOW
        </h1>
        <p style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
          Drag nodes to canvas
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
          Node Types
        </p>
        {NODE_DEFS.map((def) => (
          <div
            key={def.type}
            draggable
            onDragStart={(e) => onDragStart(e, def.type)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px",
              borderRadius: "8px",
              border: `1px solid ${def.color}44`,
              background: `${def.color}11`,
              cursor: "grab",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${def.color}22`,
                color: def.color,
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              {def.icon}
            </div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>{def.label}</p>
              <p style={{ fontSize: "10px", color: "#6b7280" }}>{def.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid #2a2d3e" }}>
        <p style={{ fontSize: "10px", color: "#6b7280", textAlign: "center" }}>
          Click a node to edit its properties
        </p>
      </div>
    </aside>
  );
}