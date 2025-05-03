import { useState } from 'react'
import FlowCanvas from './components/FlowCanvas/FlowCanvas'
import NodePanel from './components/NodePanel/NodePanel'
import './App.css'

function App() {
  const [selectedNode, setSelectedNode] = useState(null)

  return (
    <div className="app-container">
      <NodePanel />
      <FlowCanvas 
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
      />
      {selectedNode && (
        <div className="settings-panel">
          {/* Node-specific settings will go here */}
        </div>
      )}
    </div>
  )
}

export default App