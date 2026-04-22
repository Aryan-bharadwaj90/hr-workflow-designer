import { NodeSidebar } from "./components/sidebar/NodeSidebar";
import { WorkflowCanvas } from "./components/canvas/WorkflowCanvas";
import { NodeEditPanel } from "./components/panel/NodeEditPanel";
import { Toolbar } from "./components/toolbar/Toolbar";
import { SandboxPanel } from "./components/sandbox/SandboxPanel";
import { useWorkflowStore } from "./store/workflowStore";

function App() {
  const isSandboxOpen = useWorkflowStore((s) => s.isSandboxOpen);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Toolbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <NodeSidebar />
        <WorkflowCanvas />
        <NodeEditPanel />
      </div>
      {isSandboxOpen && <SandboxPanel />}
    </div>
  );
}

export default App;