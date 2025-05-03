import NodePanel from './components/NodePanel/NodePanel';
import FlowCanvas from './components/FlowCanvas/FlowCanvas';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <NodePanel />
      <FlowCanvas />
    </div>
  );
}