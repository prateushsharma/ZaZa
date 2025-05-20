// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  BsRobot, 
  BsWallet2, 
  BsTerminal, 
  BsGear, 
  BsArrowRepeat, 
  BsPlay, 
  BsStop,
  BsClipboard,
  BsArrowLeft,
  BsSpeedometer2,
  BsCloudCheck,
  BsDatabase,
  BsHddNetwork,
  BsPeople,
  BsShieldCheck,
  BsCpu,
  BsCashCoin,
  BsBarChart,
  BsCodeSlash,
  BsLightning,
  BsHash,
  BsInfoCircle,
  BsExclamationTriangle,
  BsCheckCircle,
  BsCaretRightFill
} from 'react-icons/bs';
import '../styles/Dashboard.css';
import { useAgentStore } from '../store/agentStore';
import { useAuth } from '../contexts/AuthContext';
import AgentDetail from './dashboard/AgentDetail';
import AgentLogs from './dashboard/AgentLogs';
import AgentMetrics from './dashboard/AgentMetrics';
import AgentSettings from './dashboard/AgentSettings';
import Leaderboard from './dashboard/Leaderboard';
import DeploymentMonitor from './dashboard/DeploymentMonitor';

const Dashboard = ({ onSwitchToBuilder }) => {
  const [activeSection, setActiveSection] = useState('agents');
  const [selectedView, setSelectedView] = useState('detail'); // 'detail', 'logs', 'metrics', 'settings'
  const [agentName, setAgentName] = useState('');
  const [agentData, setAgentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeploymentMonitor, setShowDeploymentMonitor] = useState(false);
  const [savedMonitoringData, setSavedMonitoringData] = useState(null);
  
  const { 
    startAgent, 
    stopAgent, 
    createWallet, 
    getAgentLogs
  } = useAgentStore();
  
  const { uid, walletAddress } = useAuth();
  
  // Fetch agent data using the /fetch_data API
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/fetch_data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: walletAddress
          }),
        });
        
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
          const userAgent = result.data[0];
          
          // Extract agent name from the graph data
          const agentNode = userAgent.graph.nodes.find(node => node.type === 'agentNode');
          if (agentNode) {
            setAgentName(agentNode.data.name || 'Unnamed Agent');
          }
          
          // Store the full agent data
          setAgentData({
            id: userAgent.uid,
            uid: userAgent.uid,
            name: agentNode?.data.name || 'Unnamed Agent',
            description: agentNode?.data.description || '',
            status: 'stopped', // Default status
            walletStatus: 'active',
            walletAddress: walletAddress,
            balance: '0.00',
            created: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            graph: userAgent.graph
          });
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgentData();
  }, [walletAddress]);

  // Handle agent deployment
  const handleDeploy = async (agent) => {
    // Show deployment monitor instead of the old modal
    setShowDeploymentMonitor(true);
  };

  // Handle stopping monitoring
  const handleStopMonitoring = (monitoringData) => {
    setSavedMonitoringData(monitoringData);
    setShowDeploymentMonitor(false);
    
    // Update agent status
    if (agentData) {
      setAgentData({ ...agentData, status: 'stopped' });
      stopAgent(agentData.id);
    }
  };

  const handleCreateWallet = async (agentId) => {
    await createWallet(agentId);
  };

  const renderContent = () => {
    if (activeSection === 'agents') {
      return (
        <div className="dashboard-single-agent">
          {isLoading ? (
            <div className="dashboard-loading">
              <div className="spinner"></div>
              <p>Loading agent data...</p>
            </div>
          ) : !agentData ? (
            <div className="no-agent-found">
              <BsRobot className="big-icon" />
              <h3>No Agent Found</h3>
              <p>Create an agent first in the Flow Builder.</p>
              <button 
                className="create-agent-btn"
                onClick={onSwitchToBuilder}
              >
                Create New Agent
              </button>
            </div>
          ) : (
            <div className="agent-detail-container">
              <div className="agent-detail-header">
                <div className="agent-header-info">
                  <h2>{agentName}</h2>
                  <div className={`agent-header-status ${agentData.status}`}>
                    {agentData.status.charAt(0).toUpperCase() + agentData.status.slice(1)}
                  </div>
                </div>
                <div className="agent-detail-tabs">
                  <button 
                    className={`tab-btn ${selectedView === 'detail' ? 'active' : ''}`}
                    onClick={() => setSelectedView('detail')}
                  >
                    <BsInfoCircle /> Overview
                  </button>
                  <button 
                    className={`tab-btn ${selectedView === 'logs' ? 'active' : ''}`}
                    onClick={() => setSelectedView('logs')}
                  >
                    <BsTerminal /> Logs
                  </button>
                  <button 
                    className={`tab-btn ${selectedView === 'metrics' ? 'active' : ''}`}
                    onClick={() => setSelectedView('metrics')}
                  >
                    <BsBarChart /> Metrics
                  </button>
                  <button 
                    className={`tab-btn ${selectedView === 'settings' ? 'active' : ''}`}
                    onClick={() => setSelectedView('settings')}
                  >
                    <BsGear /> Settings
                  </button>
                </div>
              </div>
              
              <div className="agent-detail-content">
                {selectedView === 'detail' && (
                  <AgentDetail 
                    agent={agentData} 
                    onStartAgent={startAgent}
                    onStopAgent={stopAgent}
                    onCreateWallet={handleCreateWallet}
                    onDeploy={handleDeploy}
                  />
                )}
                
                {selectedView === 'logs' && (
                  <AgentLogs 
                    agent={agentData}
                    getAgentLogs={getAgentLogs}
                    savedMonitoringData={savedMonitoringData}
                  />
                )}
                
                {selectedView === 'metrics' && (
                  <AgentMetrics agent={agentData} />
                )}
                
                {selectedView === 'settings' && (
                  <AgentSettings agent={agentData} />
                )}
              </div>
            </div>
          )}
        </div>
      );
    } else if (activeSection === 'leaderboard') {
      return <Leaderboard />;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <button className="back-btn" onClick={onSwitchToBuilder}>
          <BsArrowLeft /> Back to Flow Builder
        </button>
        <h1>DeFAI Agent Deployer</h1>
        <div className="status-indicators">
          <div className="status-item">
            <span className="status-label">SUI/USDC:</span>
            <span className="status-value">$0.942</span>
          </div>
          <div className="status-item">
            <span className="status-label">Agent:</span>
            <span className="status-value">{agentName || 'Not Created'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">MCP Status:</span>
            <span className="status-value online">
              <span className="status-dot"></span> Online
            </span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-navbar">
        <div 
          className={`nav-item ${activeSection === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveSection('agents')}
        >
          <BsRobot /> Agent
        </div>
        <div 
          className={`nav-item ${activeSection === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveSection('leaderboard')}
        >
          <BsBarChart /> Leaderboard
        </div>
      </div>
      
      <div className="dashboard-content">
        {renderContent()}
      </div>

      {/* Deployment Monitor Popup */}
      {showDeploymentMonitor && (
        <DeploymentMonitor
          agent={agentData}
          onClose={() => setShowDeploymentMonitor(false)}
          onStop={handleStopMonitoring}
        />
      )}
    </div>
  );
};

export default Dashboard;