import { useState } from "react";
import { useWorkflowStore } from "../../store/workflowStore";
import { simulateWorkflow } from "../../api/mockApi";
import type { SimulationResult } from "../../types/workflow.types";

const STATUS_STYLES = {
  success: { color: "#22c55e", icon: "✓", bg: "rgba(34,197,94,0.08)" },
  warning: { color: "#f59e0b", icon: "⚠", bg: "rgba(245,158,11,0.08)" },
  error: { color: "#ef4444", icon: "✕", bg: "rgba(239,68,68,0.08)" },
  info: { color: "#6366f1", icon: "ℹ", bg: "rgba(99,102,241,0.08)" },
};

export function SandboxPanel() {
  const { nodes, edges, setIsSandboxOpen, exportWorkflow } = useWorkflowStore();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"simulate" | "export">("simulate");
  const [exported, setExported] = useState("");

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);
    const workflow = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as import("../../types/workflow.types").NodeType,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
    };
    const res = await simulateWorkflow(workflow);
    setResult(res);
    setLoading(false);
  };

  const handleExport = () => {
    setExported(exportWorkflow());
    setActiveTab("export");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          maxHeight: "80vh",
          background: "#1a1d27",
          borderRadius: "16px",
          border: "1px solid #2a2d3e",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #2a2d3e",
          }}
        >
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Workflow Sandbox</h2>
            <p style={{ fontSize: "10px", color: "#6b7280" }}>
              {nodes.length} nodes · {edges.length} edges
            </p>
          </div>
          <button
            onClick={() => setIsSandboxOpen(false)}
            style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "18px" }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid #2a2d3e" }}>
          {(["simulate", "export"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "12px",
                fontWeight: 600,
                background: "none",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid #6366f1" : "2px solid transparent",
                color: activeTab === tab ? "#6366f1" : "#6b7280",
                cursor: "pointer",
              }}
            >
              {tab === "simulate" ? "▶ Simulate" : "{ } Export JSON"}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {activeTab === "simulate" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <button
                onClick={handleSimulate}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  background: loading ? "#2a2d3e" : "#6366f1",
                  color: loading ? "#6b7280" : "#ffffff",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Simulating..." : "▶  Run Simulation"}
              </button>

              {result && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${result.success ? "#22c55e44" : "#ef444444"}`,
                      background: result.success ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
                    }}
                  >
                    <span style={{ fontSize: "18px", color: result.success ? "#22c55e" : "#ef4444" }}>
                      {result.success ? "✓" : "✕"}
                    </span>
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>
                        {result.success ? "Simulation Passed" : "Simulation Failed"}
                      </p>
                      <p style={{ fontSize: "10px", color: "#6b7280" }}>
                        {result.success
                          ? `${result.totalSteps} steps executed`
                          : `${result.errors.length} error(s) found`}
                      </p>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <p style={{ fontSize: "10px", fontWeight: 600, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Errors
                      </p>
                      {result.errors.map((err, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                            padding: "8px",
                            borderRadius: "8px",
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          <span style={{ color: "#ef4444", fontSize: "12px" }}>✕</span>
                          <p style={{ fontSize: "12px", color: "#fca5a5" }}>{err}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.steps.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <p style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Execution Log
                      </p>
                      {result.steps.map((step, i) => {
                        const s = STATUS_STYLES[step.status];
                        return (
                          <div
                            key={step.nodeId + i}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "12px",
                              padding: "10px",
                              borderRadius: "8px",
                              border: `1px solid ${s.color}33`,
                              background: s.bg,
                            }}
                          >
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                flexShrink: 0,
                                background: `${s.color}33`,
                                color: s.color,
                              }}
                            >
                              {s.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <p style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>{step.label}</p>
                                <span style={{ fontSize: "9px", color: "#6b7280", fontFamily: "monospace", marginLeft: "8px" }}>
                                  {step.timestamp}
                                </span>
                              </div>
                              <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>{step.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "export" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={handleExport}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  background: "#6366f1",
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Generate Export
              </button>
              {exported && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Workflow JSON
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(exported)}
                      style={{ fontSize: "10px", color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}
                    >
                      Copy
                    </button>
                  </div>
                  <pre
                    style={{
                      background: "#0f1117",
                      border: "1px solid #2a2d3e",
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "10px",
                      fontFamily: "monospace",
                      color: "#d1d5db",
                      overflow: "auto",
                      maxHeight: "280px",
                    }}
                  >
                    {exported}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}