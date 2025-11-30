// WorkflowStudio.tsx
import React, { useEffect, useRef, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Plus, Play, Save, Settings, Trash2, GitBranch, Database, Mail,
  Code, Bell, X, Check, Globe, Calendar, Zap, Filter, AlertCircle,
  Upload, FilePlus, Paperclip, FileChartPie, UserPlus
} from "lucide-react";

// ---------------------------
//  Redux: workflows slice
// ---------------------------

interface WorkflowNode {
  id: number;
  type: string;
  label: string;
  x: number;
  y: number;
  icon: string;
  config: Record<string, any>;
}
interface Connection {
  from: number;
  to: number;
  label?: string;
}
interface Workflow {
  id: number;
  name: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  createdAt: string;
}
interface WorkflowsState {
  items: Workflow[];
}

const STORAGE_KEY = "workflows_v1";
const initialList: Workflow[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const workflowsSlice = createSlice({
  name: "workflows",
  initialState: { items: initialList } as WorkflowsState,
  reducers: {
    setWorkflows(state, action: PayloadAction<Workflow[]>) {
      state.items = action.payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    },
    addWorkflow(state, action: PayloadAction<Workflow>) {
      state.items.push(action.payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    },
    removeWorkflow(state, action: PayloadAction<number>) {
      state.items = state.items.filter(w => w.id !== action.payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    },
    overwriteWorkflows(state, action: PayloadAction<Workflow[]>) {
      state.items = action.payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    },
  },
});
const { addWorkflow, removeWorkflow, setWorkflows, overwriteWorkflows } = workflowsSlice.actions;

const store = configureStore({
  reducer: { workflows: workflowsSlice.reducer }
});
// Exporting RootState and AppDispatch for typed useSelector/useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ---------------------------
//  Utility: Icons & node types
// ---------------------------

const iconMap: Record<string, React.FC<any>> = {
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
  upload: Upload,
  paperclip: Paperclip,
  "file-plus": FilePlus,
  "file-chart-pie": FileChartPie,
  "user-plus": UserPlus,
  plus: Plus,
};
const getIcon = (name: string) => iconMap[name] || Code;
const getNodeColor = (type: string) =>
  ({ trigger: "bg-green-500", action: "bg-blue-500", condition: "bg-yellow-500", database: "bg-purple-500" } as any)[type] || "bg-gray-500";

const NODE_TYPES = [
  { type: "trigger", label: "Webhook", icon: "webhook", color: "bg-green-500", description: "Start workflow from HTTP request" },
  { type: "trigger", label: "Schedule", icon: "calendar", color: "bg-green-600", description: "Run on a CRON schedule" },
  { type: "trigger", label: "File Upload", icon: "upload", color: "bg-green-600", description: "Start when a file is uploaded" },
  { type: "trigger", label: "Form Submit", icon: "paperclip", color: "bg-green-600", description: "Start on form submission" },
  { type: "trigger", label: "Record Created", icon: "file-plus", color: "bg-green-600", description: "Start when a new record is created" },

  { type: "action", label: "HTTP Request", icon: "globe", color: "bg-blue-500", description: "Make external API calls" },
  { type: "action", label: "Transform Data", icon: "code", color: "bg-blue-600", description: "Parse or modify data (JavaScript)" },
  { type: "action", label: "Send Email", icon: "mail", color: "bg-indigo-500", description: "Send email notifications" },
  { type: "action", label: "Delay", icon: "zap", color: "bg-orange-500", description: "Pause workflow for some time" },
  { type: "action", label: "Send Notification", icon: "bell", color: "bg-blue-700", description: "Send a Slack or chat notification" },
  { type: "action", label: "Filter", icon: "filter", color: "bg-yellow-600", description: "Filter data based on a condition" },
  { type: "action", label: "Generate Report", icon: "file-chart-pie", color: "bg-blue-600", description: "Generate a report" },
  { type: "action", label: "Enroll & Send", icon: "user-plus", color: "bg-blue-600", description: "Enroll a user and send notification" },
  { type: "condition", label: "If/Else", icon: "branch", color: "bg-yellow-500", description: "Branch workflow on a condition" },
  { type: "database", label: "Database", icon: "database", color: "bg-purple-500", description: "Query or update a database table" },
  { type: "action", label: "+4", icon: "plus", color: "bg-blue-600", description: "Add four to a value" },
];

// ---------------------------
//  App wrapper (Redux Provider)
// ---------------------------

function WorkflowStudioWrapper() {
  return (
    <Provider store={store}>
      <WorkflowStudio />
    </Provider>
  );
}

// ---------------------------
//  Main app (Builder | Workflows tabs)
// ---------------------------

function WorkflowStudio() {
  const [tab, setTab] = useState<"builder"|"workflows">("builder");
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const load = params.get("load");
      if (load) setTab("builder");
    } catch (e) { /* ignore */ }
  }, []);
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex border-b bg-white">
        <button
          onClick={() => setTab("builder")}
          className={`px-6 py-3 font-medium ${tab === "builder" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >Builder</button>
        <button
          onClick={() => setTab("workflows")}
          className={`px-6 py-3 font-medium ${tab === "workflows" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >Workflows</button>
      </div>
      <div className="flex-1 overflow-hidden">
        {tab === "builder" && <WorkflowBuilder />}
        {tab === "workflows" && <WorkflowsList />}
      </div>
    </div>
  );
}

// ---------------------------
//  WorkflowBuilder Component
// ---------------------------

function WorkflowBuilder() {
  const dispatch = useDispatch<AppDispatch>();
  const savedWorkflows = useSelector((s: RootState) => s.workflows.items);
  // Default nodes with new ones included
  const defaultNodes: WorkflowNode[] = [
    { id: 1, type: "trigger", label: "Webhook Trigger", x: 250, y: 50, icon: "webhook", config: { url: "https://api.example.com/webhook", method: "POST" } },
    { id: 2, type: "action", label: "Parse JSON", x: 250, y: 170, icon: "code", config: { script: "//input.payloadParser\nreturn { payload: input.payload }", language: "javascript" } },
    { id: 3, type: "condition", label: "Check Status", x: 250, y: 290, icon: "branch", config: { field: "status", operator: "equals", value: "active" } },
    { id: 4, type: "action", label: "Send Email", x: 120, y: 420, icon: "mail", config: { to: "user@example.com", subject: "Status Update", body: "Hello!" } },
    { id: 5, type: "action", label: "Update Database", x: 380, y: 420, icon: "database", config: { table: "users", operation: "update", query: "WHERE id = {{id}}" } },
    { id: 6, type: "action", label: "Send Notification", x: 250, y: 550, icon: "bell", config: { channel: "slack", message: "Process completed" } },
    { id: 7, type: "trigger", label: "File Uploaded", x: 400, y: 50, icon: "upload", config: { fileUrl: "" } },
    { id: 8, type: "action", label: "User Enrolled", x: 400, y: 170, icon: "user-plus", config: { userId: "" } },
    { id: 9, type: "action", label: "Add 4", x: 400, y: 290, icon: "plus", config: { value: 4 } },
  ];
  const [nodes, setNodes] = useState<WorkflowNode[]>(defaultNodes);
  const [connections, setConnections] = useState<Connection[]>([
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4, label: "true" },
    { from: 3, to: 5, label: "false" },
    { from: 4, to: 6 },
    { from: 5, to: 6 },
    { from: 6, to: 7 },
    { from: 7, to: 8 },
    { from: 8, to: 9 },
  ]);
  // Selection and dragging state
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Runtime logs and simulation state
  const [runMode, setRunMode] = useState("A3");
  const [logs, setLogs] = useState<{ time: string; text: string; sample?: any; input?: any }[]>([]);
  const [running, setRunning] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);

  // Config modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configNode, setConfigNode] = useState<WorkflowNode | null>(null);
  const builderRef = useRef<HTMLDivElement>(null);

  // Utility to log messages
  const pushLog = (text: string, meta: any = {}) => {
    setLogs((l) => [...l, { time: new Date().toISOString(), text, ...meta }]);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, nodeId: number) => {
    if (e.button !== 0) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDraggingNode(nodeId);
    setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
    setSelectedNode(nodeId);
  };
  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (draggingNode === null) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    setNodes((prev) => prev.map((n) => (n.id === draggingNode ? { ...n, x: newX, y: newY } : n)));
  };
  const handleMouseUp = () => {
    setDraggingNode(null);
  };
  useEffect(() => {
    if (draggingNode !== null) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingNode, dragOffset]);

  // Add, delete, and configure nodes
  const addNode = (typeObj: { type: string; label: string; icon: string; color: string; description: string }) => {
    const defaultConfigs: Record<string, any> = {
      webhook: { url: "", method: "POST" },
      calendar: { schedule: "0 9 * * *", timezone: "UTC" },
      globe: { url: "", method: "GET", headers: {}, body: "" },
      code: { script: "// input is available as `input`\nreturn input;", language: "javascript" },
      mail: { to: "", subject: "", body: "" },
      branch: { field: "", operator: "equals", value: "" },
      filter: { field: "", operator: "contains", value: "" },
      database: { table: "", operation: "select", query: "" },
      zap: { duration: 60, unit: "seconds" },
      bell: { channel: "slack", message: "" },
    };

    const id = Math.max(0, ...nodes.map((n) => n.id)) + 1;
    const newNode: WorkflowNode = {
      id,
      type: typeObj.type,
      label: typeObj.label,
      x: 300 + (nodes.length % 3) * 150,
      y: 100 + Math.floor(nodes.length / 3) * 150,
      icon: typeObj.icon,
      config: defaultConfigs[typeObj.icon] || {},
    };
    setNodes((s) => [...s, newNode]);
  };
  const deleteNode = (id: number | null = selectedNode) => {
    if (id === null) return;
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setConnections((cs) => cs.filter((c) => c.from !== id && c.to !== id));
    setSelectedNode(null);
  };
  const openConfigModal = (id: number | null = selectedNode) => {
    if (id === null) return;
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    setConfigNode(JSON.parse(JSON.stringify(node)));
    setShowConfigModal(true);
  };
  const saveNodeConfig = () => {
    if (!configNode) return;
    setNodes((ns) => ns.map((n) => (n.id === configNode.id ? configNode : n)));
    setShowConfigModal(false);
    setConfigNode(null);
  };
  const updateConfigField = (field: string, value: any) => {
    setConfigNode((c) => (c ? { ...c, config: { ...c.config, [field]: value } } : null));
  };

  // Connection handlers
  const startConnection = (id: number) => {
    setConnecting(id);
  };
  const endConnection = (id: number) => {
    if (connecting && connecting !== id) {
      const exists = connections.some((c) => c.from === connecting && c.to === id);
      if (!exists) setConnections((cs) => [...cs, { from: connecting, to: id }]);
    }
    setConnecting(null);
  };
  const deleteConnection = (from: number, to: number) => {
    setConnections((cs) => cs.filter((c) => !(c.from === from && c.to === to)));
  };

  // Draw connections as SVG paths
  const drawConnections = () => {
    return connections.map((conn, idx) => {
      const from = nodes.find((n) => n.id === conn.from);
      const to = nodes.find((n) => n.id === conn.to);
      if (!from || !to) return null;
      const startX = from.x + 60,
        startY = from.y + 50,
        endX = to.x + 60,
        endY = to.y,
        midY = (startY + endY) / 2;
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
              y={midY - 6}
              fill="#64748b"
              fontSize="12"
              textAnchor="middle"
            >
              {conn.label}
            </text>
          )}
        </g>
      );
    });
  };

  // Helper to get start nodes (triggers) and next nodes
  const getStartNodes = () => nodes.filter((n) => n.type === "trigger");
  const getNextNodes = (nodeId: number, label: string | null = null) =>
    connections
      .filter((c) => c.from === nodeId && (label === null || c.label === label))
      .map((c) => nodes.find((n) => n.id === c.to))
      .filter(Boolean) as WorkflowNode[];

  // Evaluate custom script
  const evaluateScript = (script: string, input: any = {}) => {
    try {
      const fn = new Function("input", `"use strict";\n${script}`);
      const out = fn(input);
      return { success: true, output: out };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  };

  // A1: simple sequential log mode
  const runA1 = async () => {
    pushLog("Starting A1: Simple Log Execution");
    const starts = getStartNodes();
    if (!starts.length) {
      pushLog("No trigger node found");
      return;
    }
    setRunning(true);
    for (const start of starts) {
      let current: WorkflowNode | null = start;
      const visited = new Set<number>();
      while (current) {
        if (visited.has(current.id)) {
          pushLog(`Loop at ${current.label}`);
          break;
        }
        visited.add(current.id);
        pushLog(`Executing: ${current.label}`);
        await new Promise((r) => setTimeout(r, 300));
        const outs = getNextNodes(current.id);
        current = outs[0] || null;
      }
    }
    pushLog("A1 complete");
    setRunning(false);
  };

  // A2: sequential animation mode
  const runA2 = async () => {
    pushLog("Starting A2");
    const starts = getStartNodes();
    if (!starts.length) {
      pushLog("No trigger");
      return;
    }
    setRunning(true);
    const seq: number[] = [];
    const visited = new Set<number>();
    const q = [...starts];
    while (q.length) {
      const n = q.shift();
      if (!n || visited.has(n.id)) continue;
      visited.add(n.id);
      seq.push(n.id);
      q.push(...getNextNodes(n.id));
    }
    for (const id of seq) {
      setActiveNodeId(id);
      const node = nodes.find((x) => x.id === id);
      pushLog(`Step: ${node?.label}`);
      await new Promise((r) => setTimeout(r, 700));
    }
    setActiveNodeId(null);
    pushLog("A2 complete");
    setRunning(false);
  };

  // A3: simulation with data
  const runA3 = async () => {
    pushLog("Starting A3");
    const starts = getStartNodes();
    if (!starts.length) {
      pushLog("No trigger");
      return;
    }
    setRunning(true);
    const queue: { node: WorkflowNode; data: any }[] = starts.map((s) => ({
      node: s,
      data: { payload: { id: Date.now(), status: "active", name: "Sample" } },
    }));
    const seen = new Set<string>();
    while (queue.length) {
      const { node, data } = queue.shift()!;
      const key = `${node.id}-${JSON.stringify(data)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      setActiveNodeId(node.id);
      pushLog(`Simulating: ${node.label}`);
      let out: any = data;

      if (node.icon === "upload") {
        out = { payload: { id: Date.now(), name: "file.txt", size: 1234 } };
        pushLog("File upload trigger fired", { sample: out });
      } else if (node.icon === "paperclip") {
        pushLog("Form submitted trigger");
      } else if (node.icon === "file-plus") {
        pushLog("Record created trigger");
      } else if (node.icon === "webhook") {
        out = { payload: { id: Date.now(), status: "active", source: "webhook" } };
        pushLog("Webhook generated sample", { sample: out });
      } else if (node.icon === "globe") {
        const url = node.config.url || "";
        const method = node.config.method || "GET";
        pushLog(`HTTP ${method} to ${url}`);
      } else if (node.icon === "code") {
        const res = evaluateScript(node.config.script || "", data);
        if (res.success) {
          out = res.output || data;
          pushLog("Code output", { sample: out });
        } else {
          pushLog(`Code error: ${res.error}`);
        }
      } else if (node.icon === "mail") {
        pushLog(`Email to ${node.config.to || "(none)"}`);
      } else if (node.icon === "bell") {
        pushLog(`Notification via ${node.config.channel || "(none)"}`);
      } else if (node.icon === "database") {
        out = { ...data, dbResult: { matched: 1, affected: node.config.operation === "update" ? 1 : 0 } };
        pushLog("DB simulated", { sample: out });
      } else if (node.icon === "file-chart-pie") {
        pushLog("Report generated");
      } else if (node.icon === "user-plus") {
        pushLog("Enroll & Send action executed");
      } else if (node.icon === "plus") {
        const original = data.payload?.value || 0;
        const added = original + (node.config.value || 4);
        out = { payload: { ...data.payload, value: added } };
        pushLog(`Added 4: new value = ${added}`);
      }

      // Handle condition branching
      if (node.type === "condition") {
        const { field, operator, value } = node.config;
        const actual = data.payload?.[field];
        let cond = false;
        if (operator === "equals") cond = actual == value;
        if (operator === "not equals") cond = actual != value;
        if (operator === "contains") cond = String(actual).includes(String(value));
        pushLog(`Condition ${field} ${operator} ${value} => ${cond}`);

        const trueNext = connections.find(c => c.from === node.id && c.label === "true");
        const falseNext = connections.find(c => c.from === node.id && c.label === "false");
        if (cond && trueNext) {
          const nextNode = nodes.find(n => n.id === trueNext.to);
          if (nextNode) queue.push({ node: nextNode, data: out });
        } else if (!cond && falseNext) {
          const nextNode = nodes.find(n => n.id === falseNext.to);
          if (nextNode) queue.push({ node: nextNode, data: out });
        } else {
          getNextNodes(node.id).forEach(o => queue.push({ node: o, data: out }));
        }
        await new Promise(r => setTimeout(r, 350));
        setActiveNodeId(null);
        continue;
      }

      // Default: enqueue next nodes
      getNextNodes(node.id).forEach(o => queue.push({ node: o, data: out }));
      await new Promise(r => setTimeout(r, 350));
      setActiveNodeId(null);
    }
    pushLog("A3 complete");
    setRunning(false);
  };

  // Run workflow based on selected mode
  const runWorkflow = () => {
    if (running) {
      pushLog("Run already in progress");
      return;
    }
    setLogs([]);
    if (runMode === "A1") runA1();
    else if (runMode === "A2") runA2();
    else runA3();
  };

  // Save workflow to Redux store
  const saveWorkflow = (name: string = "My Workflow") => {
    const wf: Workflow = { id: Date.now(), name, nodes, connections, createdAt: new Date().toISOString() };
    dispatch(addWorkflow(wf));
    pushLog(`Saved workflow "${name}"`);
    window.history.replaceState({}, "", "/");
  };

  // Configuration form rendering
  const renderConfigForm = () => {
    if (!configNode) return null;
    const icon = configNode.icon;
    switch (icon) {
      case "webhook":
        return (
          <>
            <label className="block text-sm">Webhook URL</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.url || ""}
              onChange={(e) => updateConfigField("url", e.target.value)}
            />
            <label className="block text-sm mt-2">Method</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.method || "POST"}
              onChange={(e) => updateConfigField("method", e.target.value)}
            >
              <option>POST</option>
              <option>GET</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
          </>
        );
      case "mail":
        return (
          <>
            <label className="block text-sm">To</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.to || ""}
              onChange={(e) => updateConfigField("to", e.target.value)}
            />
            <label className="block text-sm mt-2">Subject</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.subject || ""}
              onChange={(e) => updateConfigField("subject", e.target.value)}
            />
            <label className="block text-sm mt-2">Body</label>
            <textarea
              rows={4}
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.body || ""}
              onChange={(e) => updateConfigField("body", e.target.value)}
            />
          </>
        );
      case "database":
        return (
          <>
            <label className="block text-sm">Table</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.table || ""}
              onChange={(e) => updateConfigField("table", e.target.value)}
            />
            <label className="block text-sm mt-2">Operation</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.operation || "select"}
              onChange={(e) => updateConfigField("operation", e.target.value)}
            >
              <option>select</option>
              <option>create</option>
              <option>insert</option>
              <option>update</option>
              <option>delete</option>
            </select>
            <label className="block text-sm mt-2">Query</label>
            <textarea
              rows={3}
              className="w-full border px-2 py-1 rounded font-mono"
              value={configNode.config.query || ""}
              onChange={(e) => updateConfigField("query", e.target.value)}
            />
          </>
        );
      case "code":
        return (
          <>
            <label className="block text-sm">Language</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.language || "javascript"}
              onChange={(e) => updateConfigField("language", e.target.value)}
            >
              <option>javascript</option>
            </select>
            <label className="block text-sm mt-2">Script</label>
            <textarea
              rows={8}
              className="w-full border px-2 py-1 rounded font-mono"
              value={configNode.config.script || ""}
              onChange={(e) => updateConfigField("script", e.target.value)}
            />
          </>
        );
      case "branch":
        return (
          <>
            <label className="block text-sm">Field</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.field || ""}
              onChange={(e) => updateConfigField("field", e.target.value)}
            />
            <label className="block text-sm mt-2">Operator</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.operator || "equals"}
              onChange={(e) => updateConfigField("operator", e.target.value)}
            >
              <option>equals</option>
              <option>not equals</option>
              <option>contains</option>
            </select>
            <label className="block text-sm mt-2">Value</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.value || ""}
              onChange={(e) => updateConfigField("value", e.target.value)}
            />
          </>
        );
      case "filter":
        return (
          <>
            <label className="block text-sm">Field</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.field || ""}
              onChange={(e) => updateConfigField("field", e.target.value)}
            />
            <label className="block text-sm mt-2">Operator</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.operator || "contains"}
              onChange={(e) => updateConfigField("operator", e.target.value)}
            >
              <option>equals</option>
              <option>not equals</option>
              <option>contains</option>
            </select>
            <label className="block text-sm mt-2">Value</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.value || ""}
              onChange={(e) => updateConfigField("value", e.target.value)}
            />
          </>
        );
      case "zap":
        return (
          <>
            <label className="block text-sm">Duration</label>
            <input
              type="number"
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.duration || 0}
              onChange={(e) => updateConfigField("duration", Number(e.target.value))}
            />
            <label className="block text-sm mt-2">Unit</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.unit || "seconds"}
              onChange={(e) => updateConfigField("unit", e.target.value)}
            >
              <option>seconds</option>
              <option>minutes</option>
              <option>hours</option>
            </select>
          </>
        );
      case "bell":
        return (
          <>
            <label className="block text-sm">Channel</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.channel || ""}
              onChange={(e) => updateConfigField("channel", e.target.value)}
            />
            <label className="block text-sm mt-2">Message</label>
            <textarea
              rows={3}
              className="w-full border px-2 py-1 rounded"
              value={configNode.config.message || ""}
              onChange={(e) => updateConfigField("message", e.target.value)}
            />
          </>
        );
      default:
        return <div className="text-sm text-gray-500">No configuration available.</div>;
    }
  };

  // Metrics for UI
  const totalNodes = nodes.length;
  const totalConnections = connections.length;

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") deleteNode();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const name = prompt("Workflow name:", "My Workflow") || "My Workflow";
        saveWorkflow(name);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nodes, selectedNode, connections]);

  // Render UI
  return (
    <div className="flex h-full">
      {/* Left pane: Toolbox and controls */}
      <div className="w-80 bg-white border-r overflow-auto">
        <div className="p-4">
          <h2 className="text-lg font-bold">Workflow Builder</h2>
          <p className="text-xs text-gray-500">Redux + no-code visual editor (TypeScript)</p>
          <div className="mt-4 space-y-2">
            <button
              onClick={runWorkflow}
              disabled={running}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded flex items-center justify-center gap-2"
            >
              <Play size={16} /> Run Workflow
            </button>
            <button
              onClick={() => saveWorkflow(prompt("Workflow name:", "My Workflow") || "My Workflow")}
              className="w-full bg-green-600 text-white px-3 py-2 rounded flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save Workflow
            </button>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium">Run Mode</label>
            <div className="mt-2 flex gap-2">
              {["A1", "A2", "A3"].map((m) => (
                <button
                  key={m}
                  onClick={() => setRunMode(m as any)}
                  className={`px-2 py-1 rounded border ${runMode === m ? "bg-blue-100" : ""}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              A1 = logs • A2 = animation • A3 = simulation
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Plus size={14} /> Add Nodes
            </h3>
            <div className="space-y-2">
              {NODE_TYPES.map((t, i) => {
                const Icon = getIcon(t.icon);
                return (
                  <button
                    key={i}
                    onClick={() => addNode(t)}
                    className="w-full flex gap-3 items-center p-2 border rounded hover:bg-gray-50"
                  >
                    <div className={`${t.color} p-1 rounded text-white`}>
                      <Icon size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{t.label}</div>
                      <div className="text-xs text-gray-500">{t.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Node Actions for selection */}
          {selectedNode && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold text-sm mb-2">Node Actions</h3>
              <button
                onClick={() => openConfigModal()}
                className="w-full p-2 border rounded mb-2 flex items-center gap-2"
              >
                <Settings size={14} /> Configure
              </button>
              <button
                onClick={() => deleteNode()}
                className="w-full p-2 border rounded text-red-600 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
          <div className="mt-6 bg-blue-50 p-3 rounded text-xs text-blue-700 border border-blue-100">
            <AlertCircle size={14} className="inline mr-2" />
            Click the bottom green dot of a node to start a connection, then click the top blue dot of another node to connect.
          </div>
          <div className="mt-6 text-xs text-gray-600 space-y-1">
            <div>Nodes: {totalNodes}</div>
            <div>Connections: {totalConnections}</div>
            <div>Logs: {logs.length}</div>
          </div>
        </div>
      </div>

      {/* Canvas with SVG connections */}
      <div className="flex-1 relative overflow-hidden" ref={builderRef}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
            </marker>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#eef2f7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {drawConnections()}
        </svg>

        {nodes.map((node) => {
          const Icon = getIcon(node.icon);
          const isActive = activeNodeId === node.id;
          const isSelected = selectedNode === node.id;
          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`absolute transition-all ${isSelected ? "ring-2 ring-blue-500 shadow-xl scale-105" : "shadow-md"} ${isActive ? "animate-pulse" : ""}`}
              style={{ left: node.x, top: node.y, width: 140 }}
            >
              <div className={`bg-white rounded-xl border p-3 relative ${isActive ? "border-green-400" : ""}`}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`${getNodeColor(node.type)} p-2 text-white rounded`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-semibold text-center">{node.label}</span>
                </div>
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); endConnection(node.id); }}
                />
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-500 border-2 border-white rounded-full cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); startConnection(node.id); }}
                />
              </div>
            </div>
          );
        })}

        {/* Logs Panel */}
        <div className="absolute right-4 top-4 w-96 bg-white border rounded shadow flex flex-col max-h-[75vh]">
          <div className="px-4 py-2 border-b flex justify-between items-center">
            <span className="text-sm font-semibold">Execution Logs</span>
            <span className="text-xs text-gray-500">{running ? "Running..." : "Idle"}</span>
          </div>
          <div className="p-3 overflow-auto text-xs">
            {logs.length === 0 && (
              <div className="text-gray-400">Run the workflow to generate logs here.</div>
            )}
            {logs.map((l, i) => (
              <div key={i} className="mb-2">
                <div className="text-[11px] text-gray-400">
                  {new Date(l.time).toLocaleTimeString()}
                </div>
                <div className="text-sm">{l.text}</div>
                {l.sample && (
                  <pre className="bg-gray-50 p-2 my-1 rounded overflow-auto">
                    {JSON.stringify(l.sample, null, 2)}
                  </pre>
                )}
                {l.input && (
                  <pre className="bg-gray-50 p-2 my-1 rounded overflow-auto">
                    {JSON.stringify(l.input, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Modal */}
        {showConfigModal && configNode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-auto">
              <div className="p-6 border-b flex justify-between">
                <div>
                  <h3 className="text-lg font-bold">Configure Node</h3>
                  <p className="text-sm text-gray-500">{configNode.label}</p>
                </div>
                <button onClick={() => setShowConfigModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Common configuration */}
                <div>
                  <label className="block text-sm font-medium">Node Label</label>
                  <input
                    className="w-full border px-2 py-1 rounded"
                    value={configNode.label}
                    onChange={(e) => setConfigNode({ ...configNode, label: e.target.value })}
                  />
                </div>
                {/* Render node-specific form */}
                {renderConfigForm()}
              </div>
              <div className="p-6 border-t flex gap-3">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 border rounded px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNodeConfig}
                  className="flex-1 bg-blue-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}

// WorkflowsList component

function WorkflowsList() {
  const dispatch = useDispatch<AppDispatch>();
  const workflows = useSelector((s: RootState) => s.workflows.items);
  const [localListVersion, setLocalListVersion] = useState(0);

  useEffect(() => { setLocalListVersion(v => v + 1); }, [workflows.length]);

  const loadIntoBuilder = (wf: Workflow) => {
    window.location.href = `/builder?load=${wf.id}`;
  };
  const deleteWF = (id: number) => {
    if (!confirm("Delete this workflow?")) return;
    dispatch(removeWorkflow(id));
  };
  const viewJSON = (wf: Workflow) => {
    alert(JSON.stringify(wf, null, 2));
  };

  return (
    <div className="p-6 bg-gray-50 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Saved Workflows</h1>
        {workflows.length === 0 && (
          <div className="text-gray-500">No workflows saved yet.</div>
        )}
        <div className="space-y-3 mt-4">
          {workflows.slice().reverse().map((wf) => (
            <div
              key={wf.id}
              className="p-4 bg-white rounded shadow flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{wf.name}</div>
                <div className="text-xs text-gray-500">
                  Nodes: {wf.nodes?.length || 0} • Connections: {wf.connections?.length || 0} • Saved:{" "}
                  {new Date(wf.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => loadIntoBuilder(wf)} className="px-3 py-1 border rounded text-sm">
                  Load
                </button>
                <button onClick={() => viewJSON(wf)} className="px-3 py-1 border rounded text-sm">
                  View JSON
                </button>
                <button
                  onClick={() => deleteWF(wf.id)}
                  className="px-3 py-1 border rounded text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { WorkflowStudio };
export default WorkflowStudioWrapper;
