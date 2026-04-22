import { useWorkflowStore } from "../../store/workflowStore";

export function Toolbar() {
  const { nodes, edges, setIsSandboxOpen, clearWorkflow, importWorkflow } = useWorkflowStore();

  const handleImport = () => {
    const json = prompt("Paste workflow JSON:");
    if (json) importWorkflow(json);
  };

  return (
    <header
      style={{
        height: "48px",
        background: "#1a1d27",
        borderBottom: "1px solid #2a2d3e",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: "12px",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "16px" }}>
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            background: "#6366f1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: 700,
          }}
        >
          HR
        </div>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>Workflow Designer</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "10px", color: "#6b7280" }}>
        <span>{nodes.length} nodes</span>
        <span>·</span>
        <span>{edges.length} edges</span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={handleImport}
          style={{
            padding: "6px 12px",
            fontSize: "11px",
            color: "#6b7280",
            border: "1px solid #2a2d3e",
            borderRadius: "8px",
            background: "none",
            cursor: "pointer",
          }}
        >
          Import
        </button>
        <button
          onClick={clearWorkflow}
          style={{
            padding: "6px 12px",
            fontSize: "11px",
            color: "#6b7280",
            border: "1px solid #2a2d3e",
            borderRadius: "8px",
            background: "none",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
        <button
          onClick={() => setIsSandboxOpen(true)}
          style={{
            padding: "6px 16px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#ffffff",
            background: "#6366f1",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ▶ Test Workflow
        </button>
      </div>
    </header>
  );
}