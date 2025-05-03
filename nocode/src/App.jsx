// src/App.jsx
import './styles/App.css';
import './styles/sidebar.css';
import './styles/nodes.css';
import NodeSidebar from './components/NodeSidebar';
import FlowCanvas from './components/FlowCanvas';
import useFlowBuilder from './hooks/useFlowBuilder';

export default function App() {
  const {
    nodes,
    connections,
    selectedNode,
    isRunning,
    addNode,
    handleNodeClick,
    handleNodeMouseDown,
    handleDeleteConnection,
    handleConfigChange,
    runFlow
  } = useFlowBuilder();

  return (
    <div className="app-container">
      <NodeSidebar 
        onAddNode={addNode} 
        selectedNode={selectedNode}
        onConfigChange={handleConfigChange}
      />
      <FlowCanvas
        nodes={nodes}
        connections={connections}
        selectedNode={selectedNode}
        onNodeClick={handleNodeClick}
        onNodeMouseDown={handleNodeMouseDown}
        onMouseUp={() => {}}
        onConnectNodes={(from, to) => handleConnectNodes(from, to)}
        onDeleteConnection={handleDeleteConnection}
        onRunFlow={runFlow}
        isRunning={isRunning}
      />
    </div>
  );
}