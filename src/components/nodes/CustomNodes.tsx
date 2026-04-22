import { Handle, Position, type NodeProps } from "@xyflow/react";
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from "../../types/workflow.types";

interface NodeShellProps {
  color: string;
  icon: string;
  label: string;
  subtitle?: string;
  children?: React.ReactNode;
  hasSource?: boolean;
  hasTarget?: boolean;
}

function NodeShell({
  color,
  icon,
  label,
  subtitle,
  children,
  hasSource = true,
  hasTarget = true,
}: NodeShellProps) {
  return (
    <div
      className="min-w-[200px] rounded-xl border shadow-xl"
      style={{ borderColor: color + "55", background: "#1a1d27" }}
    >
      {hasTarget && (
        <Handle type="target" position={Position.Top} style={{ background: color }} />
      )}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl"
        style={{ background: color + "22", borderBottom: `1px solid ${color}33` }}
      >
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-xs font-semibold" style={{ color }}>
            {label}
          </p>
          {subtitle && (
            <p className="text-xs truncate max-w-[160px]" style={{ color: "#6b7280" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="px-3 py-2 text-xs" style={{ color: "#9ca3af" }}>
          {children}
        </div>
      )}
      {hasSource && (
        <Handle type="source" position={Position.Bottom} style={{ background: color }} />
      )}
    </div>
  );
}

export function StartNode({ data }: NodeProps) {
  const d = data as unknown as StartNodeData;
  return (
    <NodeShell color="#22c55e" icon="▶" label="START" subtitle={d.title} hasTarget={false}>
      {d.metadata.length > 0 && (
        <div className="space-y-0.5">
          {d.metadata.slice(0, 2).map((m, i) => (
            <p key={i} style={{ fontFamily: "monospace", fontSize: "10px" }}>
              {m.key}: <span style={{ color: "#d1d5db" }}>{m.value}</span>
            </p>
          ))}
        </div>
      )}
    </NodeShell>
  );
}

export function TaskNode({ data }: NodeProps) {
  const d = data as unknown as TaskNodeData;
  return (
    <NodeShell color="#6366f1" icon="✓" label="TASK" subtitle={d.title}>
      <div className="space-y-0.5">
        {d.assignee && (
          <p><span style={{ color: "#d1d5db" }}>{d.assignee}</span></p>
        )}
        {d.dueDate && (
          <p><span style={{ color: "#d1d5db" }}>{d.dueDate}</span></p>
        )}
        {d.description && (
          <p className="truncate max-w-[160px]" style={{ fontSize: "10px", color: "#6b7280" }}>
            {d.description}
          </p>
        )}
      </div>
    </NodeShell>
  );
}

export function ApprovalNode({ data }: NodeProps) {
  const d = data as unknown as ApprovalNodeData;
  return (
    <NodeShell color="#f59e0b" icon="⚖" label="APPROVAL" subtitle={d.title}>
      <div className="space-y-0.5">
        {d.approverRole && (
          <p><span style={{ color: "#d1d5db" }}>{d.approverRole}</span></p>
        )}
        {d.autoApproveThreshold !== undefined && (
          <p>Auto at <span style={{ color: "#fbbf24" }}>{d.autoApproveThreshold}%</span></p>
        )}
      </div>
    </NodeShell>
  );
}

export function AutomatedNode({ data }: NodeProps) {
  const d = data as unknown as AutomatedNodeData;
  return (
    <NodeShell color="#06b6d4" icon="⚙" label="AUTOMATED" subtitle={d.title}>
      {d.actionId && (
        <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#22d3ee" }} className="truncate">
          {d.actionId}
        </p>
      )}
    </NodeShell>
  );
}

export function EndNode({ data }: NodeProps) {
  const d = data as unknown as EndNodeData;
  return (
    <NodeShell
      color="#ef4444"
      icon="■"
      label="END"
      subtitle={d.endMessage || "Workflow complete"}
      hasSource={false}
    >
      {d.showSummary && (
        <p style={{ fontSize: "10px", color: "#f87171" }}>📋 Summary enabled</p>
      )}
    </NodeShell>
  );
}