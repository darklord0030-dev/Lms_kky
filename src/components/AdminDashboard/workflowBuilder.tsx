import React, { useState, useRef, useEffect } from 'react';
import { Plus, Play, Save, Settings, Trash2, GitBranch, Database, Mail, Code, FileText, Bell, X, Check, Globe, Calendar, Zap, Filter, AlertCircle } from 'lucide-react';

const WorkflowBuilder = () => {
  const [nodes, setNodes] = useState([
    { id: 1, type: 'trigger', label: 'Webhook Trigger', x: 250, y: 50, icon: 'webhook', config: { url: 'https://api.example.com/webhook', method: 'POST' } },
    { id: 2, type: 'action', label: 'Parse JSON', x: 250, y: 170, icon: 'code', config: { field: 'data.payload' } },
    { id: 3, type: 'condition', label: 'Check Status', x: 250, y: 290, icon: 'branch', config: { field: 'status', operator: 'equals', value: 'active' } },
    { id: 4, type: 'action', label: 'Send Email', x: 120, y: 420, icon: 'mail', config: { to: 'user@example.com', subject: 'Status Update' } },
    { id: 5, type: 'action', label: 'Update Database', x: 380, y: 420, icon: 'database', config: { table: 'users', operation: 'update' } },
    { id: 6, type: 'action', label: 'Send Notification', x: 250, y: 550, icon: 'bell', config: { channel: 'slack', message: 'Process completed' } },
  ]);
  // workfow
  const [connections, setConnections] = useState([
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4, label: 'true' },
    { from: 3, to: 5, label: 'false' },
    { from: 4, to: 6 },
    { from: 5, to: 6 },
  ]);
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configNode, setConfigNode] = useState(null);
  const canvasRef = useRef(null);

  const nodeTypes = [
    { type: 'trigger', label: 'Webhook', icon: 'webhook', color: 'bg-green-500', description: 'Start workflow from HTTP request' },
    { type: 'trigger', label: 'Schedule', icon: 'calendar', color: 'bg-green-600', description: 'Run on schedule' },
    { type: 'action', label: 'HTTP Request', icon: 'globe', color: 'bg-blue-500', description: 'Make API calls' },
    { type: 'action', label: 'Transform Data', icon: 'code', color: 'bg-blue-600', description: 'Parse and modify data' },
    { type: 'action', label: 'Send Email', icon: 'mail', color: 'bg-indigo-500', description: 'Send email notifications' },
    { type: 'condition', label: 'If/Else', icon: 'branch', color: 'bg-yellow-500', description: 'Branch based on condition' },
    { type: 'condition', label: 'Filter', icon: 'filter', color: 'bg-yellow-600', description: 'Filter data items' },
    { type: 'database', label: 'Database', icon: 'database', color: 'bg-purple-500', description: 'Query or update database' },
    { type: 'action', label: 'Delay', icon: 'zap', color: 'bg-orange-500', description: 'Wait before continuing' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      webhook: Bell,
      code: Code,
      branch: GitBranch,
      mail: Mail,
      database: Database,
      bell: Bell,
      calendar: Calendar,
      globe: Globe,
      filter: Filter,
      zap: Zap,
    };
    return icons[iconName] || Code;
  };

  const getNodeColor = (type) => {
    const colors = {
      trigger: 'bg-green-500',
      action: 'bg-blue-500',
      condition: 'bg-yellow-500',
      database: 'bg-purple-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const handleMouseDown = (e, nodeId) => {
    if (e.button !== 0) return;
    const node = nodes.find(n => n.id === nodeId);
    setDraggingNode(nodeId);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
    setSelectedNode(nodeId);
  };

  const handleMouseMove = (e) => {
    if (draggingNode) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setNodes(nodes.map(node => 
        node.id === draggingNode 
          ? { ...node, x: newX, y: newY }
          : node
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const addNode = (type) => {
    const defaultConfigs = {
      webhook: { url: '', method: 'POST' },
      calendar: { schedule: '0 9 * * *', timezone: 'UTC' },
      globe: { url: '', method: 'GET', headers: {} },
      code: { script: '', language: 'javascript' },
      mail: { to: '', subject: '', body: '' },
      branch: { field: '', operator: 'equals', value: '' },
      filter: { field: '', condition: 'contains', value: '' },
      database: { table: '', operation: 'select', query: '' },
      zap: { duration: 60, unit: 'seconds' },
    };

    const newNode = {
      id: Math.max(...nodes.map(n => n.id), 0) + 1,
      type: type.type,
      label: type.label,
      x: 300 + (nodes.length % 3) * 150,
      y: 100 + Math.floor(nodes.length / 3) * 150,
      icon: type.icon,
      config: defaultConfigs[type.icon] || {},
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = () => {
    if (selectedNode) {
      setNodes(nodes.filter(n => n.id !== selectedNode));
      setConnections(connections.filter(c => c.from !== selectedNode && c.to !== selectedNode));
      setSelectedNode(null);
    }
  };

  const openConfigModal = () => {
    if (selectedNode) {
      const node = nodes.find(n => n.id === selectedNode);
      setConfigNode({ ...node });
      setShowConfigModal(true);
    }
  };

  const saveNodeConfig = () => {
    if (configNode) {
      setNodes(nodes.map(n => n.id === configNode.id ? configNode : n));
      setShowConfigModal(false);
      setConfigNode(null);
    }
  };

  const updateConfigField = (field, value) => {
    setConfigNode({
      ...configNode,
      config: {
        ...configNode.config,
        [field]: value
      }
    });
  };

  const startConnection = (nodeId) => {
    setConnecting(nodeId);
  };

  const endConnection = (nodeId) => {
    if (connecting && connecting !== nodeId) {
      const existingConnection = connections.find(
        c => c.from === connecting && c.to === nodeId
      );
      if (!existingConnection) {
        setConnections([...connections, { from: connecting, to: nodeId }]);
      }
    }
    setConnecting(null);
  };

  const deleteConnection = (from, to) => {
    setConnections(connections.filter(c => !(c.from === from && c.to === to)));
  };

  const drawConnections = () => {
    return connections.map((conn, idx) => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) return null;

      const startX = fromNode.x + 60;
      const startY = fromNode.y + 50;
      const endX = toNode.x + 60;
      const endY = toNode.y;

      const midY = (startY + endY) / 2;

      return (
        <g key={idx}>
          <path
            d={`M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`}
            stroke="#94a3b8"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
            className="cursor-pointer hover:stroke-red-500"
            onClick={() => deleteConnection(conn.from, conn.to)}
          />
          {conn.label && (
            <text
              x={(startX + endX) / 2}
              y={midY - 5}
              fill="#64748b"
              fontSize="12"
              textAnchor="middle"
              className="select-none pointer-events-none"
            >
              {conn.label}
            </text>
          )}
        </g>
      );
    });
  };

  const renderConfigForm = () => {
    if (!configNode) return null;

    const renderFields = () => {
      switch (configNode.icon) {
        case 'webhook':
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                <input
                  type="text"
                  value={configNode.config.url}
                  onChange={(e) => updateConfigField('url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://api.example.com/webhook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <select
                  value={configNode.config.method}
                  onChange={(e) => updateConfigField('method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>POST</option>
                  <option>GET</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>
            </>
          );
        case 'mail':
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Email</label>
                <input
                  type="email"
                  value={configNode.config.to}
                  onChange={(e) => updateConfigField('to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={configNode.config.subject}
                  onChange={(e) => updateConfigField('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea
                  value={configNode.config.body}
                  onChange={(e) => updateConfigField('body', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Email body content"
                />
              </div>
            </>
          );
        case 'database':
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                <input
                  type="text"
                  value={configNode.config.table}
                  onChange={(e) => updateConfigField('table', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="users"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
                <select
                  value={configNode.config.operation}
                  onChange={(e) => updateConfigField('operation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>select</option>
                  <option>insert</option>
                  <option>update</option>
                  <option>delete</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Query</label>
                <textarea
                  value={configNode.config.query}
                  onChange={(e) => updateConfigField('query', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows="3"
                  placeholder="WHERE id = {{id}}"
                />
              </div>
            </>
          );
        case 'branch':
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field to Check</label>
                <input
                  type="text"
                  value={configNode.config.field}
                  onChange={(e) => updateConfigField('field', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="status"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                <select
                  value={configNode.config.operator}
                  onChange={(e) => updateConfigField('operator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>equals</option>
                  <option>not equals</option>
                  <option>greater than</option>
                  <option>less than</option>
                  <option>contains</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input
                  type="text"
                  value={configNode.config.value}
                  onChange={(e) => updateConfigField('value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="active"
                />
              </div>
            </>
          );
        case 'code':
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={configNode.config.language}
                  onChange={(e) => updateConfigField('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>javascript</option>
                  <option>python</option>
                  <option>json</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Script</label>
                <textarea
                  value={configNode.config.script}
                  onChange={(e) => updateConfigField('script', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows="6"
                  placeholder="// Transform your data here&#10;return data.map(item => ({&#10;  ...item,&#10;  processed: true&#10;}));"
                />
              </div>
            </>
          );
        default:
          return (
            <div className="text-center py-4 text-gray-500">
              No configuration options available for this node type.
            </div>
          );
      }
    };

    return renderFields();
  };

  useEffect(() => {
    if (draggingNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingNode, dragOffset]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Workflow Builder</h2>
            <p className="text-xs text-gray-500">Design and automate your processes</p>
          </div>

          <div className="space-y-2 mb-6">
            <button className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium">
              <Play size={16} />
              Run Workflow
            </button>
            <button className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium">
              <Save size={16} />
              Save Workflow
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Plus size={16} />
              Add Nodes
            </h3>
            <div className="space-y-2">
              {nodeTypes.map((type, idx) => {
                const Icon = getIcon(type.icon);
                return (
                  <button
                    key={idx}
                    onClick={() => addNode(type)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition text-left"
                  >
                    <div className={`${type.color} p-2 rounded-lg text-white shrink-0`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">{type.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedNode && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Node Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={openConfigModal}
                  className="w-full flex items-center gap-2 p-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
                >
                  <Settings size={16} />
                  Configure Node
                </button>
                <button 
                  onClick={deleteNode}
                  className="w-full flex items-center gap-2 p-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                >
                  <Trash2 size={16} />
                  Delete Node
                </button>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800">
                    Click bottom dot to start connection, top dot to receive connections
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100" ref={canvasRef}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
            </marker>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#e2e8f0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {drawConnections()}
        </svg>

        {nodes.map((node) => {
          const Icon = getIcon(node.icon);
          const isSelected = selectedNode === node.id;
          const isHovered = hoveredNode === node.id;
          
          return (
            <div
              key={node.id}
              className={`absolute cursor-move transition-all ${
                isSelected ? 'ring-2 ring-blue-500 shadow-xl scale-105' : 'shadow-md'
              } ${isHovered ? 'shadow-lg' : ''}`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: '120px',
              }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="bg-white rounded-xl border-2 border-gray-200 p-3 hover:border-blue-400 transition">
                <div className="flex flex-col items-center gap-2">
                  <div className={`${getNodeColor(node.type)} p-2.5 rounded-lg text-white shadow-md`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-semibold text-gray-800 text-center leading-tight">
                    {node.label}
                  </span>
                </div>
                
                {/* Connection points */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-pointer hover:scale-125 hover:bg-blue-600 transition shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    endConnection(node.id);
                  }}
                  title="Input connection"
                />
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer hover:scale-125 hover:bg-green-600 transition shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    startConnection(node.id);
                  }}
                  title="Output connection"
                />
              </div>
            </div>
          );
        })}

        {connecting && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <GitBranch size={16} />
            Click on another node to connect
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="font-semibold mb-2">Stats</div>
            <div>Total Nodes: {nodes.length}</div>
            <div>Connections: {connections.length}</div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Configure Node</h3>
                <p className="text-sm text-gray-500 mt-1">{configNode?.label}</p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Node Label</label>
                <input
                  type="text"
                  value={configNode?.label || ''}
                  onChange={(e) => setConfigNode({ ...configNode, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter node name"
                />
              </div>
              
              {renderConfigForm()}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveNodeConfig}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;