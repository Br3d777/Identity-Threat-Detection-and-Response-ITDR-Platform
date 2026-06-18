import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Shield, 
  ShieldAlert, 
  Zap, 
  Radio, 
  RefreshCw, 
  Key, 
  Database, 
  Server, 
  Laptop, 
  HelpCircle, 
  Activity, 
  Play, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  UserCheck, 
  Globe, 
  Lock, 
  Unlock, 
  Users, 
  Terminal, 
  ArrowRight,
  User,
  ExternalLink,
  Cpu
} from "lucide-react";
import { motion } from "motion/react";
import { 
  GraphNode, 
  GraphLink, 
  IngestionLog, 
  IdentityIncident, 
  RemediationAction, 
  CopilotResponse 
} from "./types";

export default function App() {
  // --- STATE MANAGEMENT ---
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [incidents, setIncidents] = useState<IdentityIncident[]>([]);
  const [logs, setLogs] = useState<IngestionLog[]>([]);
  const [remediations, setRemediations] = useState<RemediationAction[]>([]);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string>("ur-bob");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"investigator" | "playbook" | "logs">("investigator");
  const [isSimulating, setIsSimulating] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Gemini Copilot AI State
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);
  const [copilotResult, setCopilotResult] = useState<{
    response: CopilotResponse;
    info: string;
  } | null>(null);
  const [copilotError, setCopilotError] = useState<string | null>(null);

  // Live Auto-append Feed State
  const [autoPipeOnline, setAutoPipeOnline] = useState<boolean>(true);
  
  // --- LOAD INITIAL DATA ---
  const fetchAllData = useCallback(async () => {
    try {
      const [graphRes, incRes, logsRes, remRes] = await Promise.all([
        fetch("/api/itdr/graph"),
        fetch("/api/itdr/incidents"),
        fetch("/api/itdr/logs"),
        fetch("/api/itdr/remediations"),
      ]);
      
      const graphData = await graphRes.json();
      const incData = await incRes.json();
      const logsData = await logsRes.json();
      const remData = await remRes.json();
      
      setNodes(graphData.nodes || []);
      setLinks(graphData.links || []);
      setIncidents(incData || []);
      setLogs(logsData || []);
      setRemediations(remData || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load ITDR telemetry profile:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- KAFKA SIMULATED APACE STREAM (AUTOPLAY NOISE LOGS) ---
  useEffect(() => {
    if (!autoPipeOnline) return;

    const noiseEventTypes = [
      "Okta SSO Sign-in Verified",
      "OAuth Client Credentials Exchanged",
      "Microsoft Graph API Queried",
      "MFA Challenge Prompted",
      "Directory Object Read",
      "Token Refresh Granted"
    ];
    
    const noiseNames = [
      { name: "Jane Miller", email: "jane.miller@corporate.com", prov: "okta" as const },
      { name: "Bob Jenkins", email: "bob.jenkins@corporate.com", prov: "okta" as const },
      { name: "Carlos Estrada", email: "carlos.estrada@corporate.com", prov: "azure" as const },
      { name: "Service-SQLAdmin", email: "admin-service@corporate.com", prov: "azure" as const }
    ];

    const ips = ["73.14.92.110", "198.51.100.45", "162.210.196.22", "172.56.21.3", "192.168.1.5"];
    const locs = ["New York, USA", "Seattle, USA", "Dallas, USA", "Chicago, USA"];

    const interval = setInterval(() => {
      const randomUser = noiseNames[Math.floor(Math.random() * noiseNames.length)];
      const randomIp = ips[Math.floor(Math.random() * ips.length)];
      const randomLoc = locs[Math.floor(Math.random() * locs.length)];
      const randomType = noiseEventTypes[Math.floor(Math.random() * noiseEventTypes.length)];
      
      const newLog: IngestionLog = {
        id: `auto-${Math.floor(Math.random() * 100000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        provider: randomUser.prov,
        eventType: randomType,
        userPrincipalName: randomUser.email,
        ipAddress: randomIp,
        location: randomLoc,
        status: "success",
        details: `Simulated live telemetry chunk received from Apache Kafka broker feed.`
      };

      setLogs(prev => [newLog, ...prev.slice(0, 39)]);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoPipeOnline]);

  // --- TRIGGER ATTACK SIMULATION ---
  const launchSimulation = async (attackType: string) => {
    setIsSimulating(attackType);
    setCopilotResult(null); // Reset previous copilot analysis
    setCopilotError(null);
    
    try {
      const response = await fetch("/api/itdr/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attackType })
      });
      
      const data = await response.json();
      await fetchAllData();
      
      // Auto-focus on compromised node
      if (attackType === "token_theft") setSelectedNodeId("ur-bob");
      if (attackType === "impossible_travel") setSelectedNodeId("ur-jane");
      if (attackType === "privilege_escalation") setSelectedNodeId("ur-admin");
      if (attackType === "mfa_fatigue") setSelectedNodeId("ur-sales");
      
    } catch (error) {
      console.error("Attack simulation failed:", error);
    } finally {
      setIsSimulating(null);
    }
  };

  // --- TRIGGER PLAYBOOK REMEDIATION ---
  const executeRemediation = async (userId: string, actionType: "force_reset" | "revoke_sessions" | "suspend_user") => {
    try {
      const response = await fetch("/api/itdr/remediations"); // Trigger active fetch check
      const resRem = await fetch("/api/itdr/remediations", {
        method: "POST",
        // Not used, just checking structure or calling /api/itdr/remediate
      });

      const actualAction = await fetch("/api/itdr/remediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, actionType })
      });

      if (actualAction.ok) {
        setCopilotResult(null); // Clear analysis of healed threat
        setCopilotError(null);
        await fetchAllData();
      }
    } catch (error) {
      console.error("Mitigation dispatch failed:", error);
    }
  };

  // --- RESET ALL STATE TO BASELINE ---
  const resetPlatform = async () => {
    try {
      const response = await fetch("/api/itdr/reset", { method: "POST" });
      if (response.ok) {
        setCopilotResult(null);
        setCopilotError(null);
        setSelectedNodeId("ur-bob");
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- RUN GEMINI SECURITY COPILOT ANALYSIS ---
  const invokeAICopilot = async (userId: string) => {
    setIsCopilotLoading(true);
    setCopilotResult(null);
    setCopilotError(null);

    // Find if user has active incident
    const userIncident = incidents.find(i => i.userId === userId && i.status === "active") 
      || incidents.find(i => i.userId === userId)
      || incidents[0];

    try {
      const reqPayload = {
        userId,
        incidentId: userIncident?.id || ""
      };

      const response = await fetch("/api/itdr/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });

      if (!response.ok) {
        throw new Error("Gemini AI Copilot returned an error code.");
      }

      const data = await response.json();
      setCopilotResult({
        response: data.response,
        info: data.info
      });
    } catch (error: any) {
      setCopilotError(error.message || "An error occurred with the AI agent.");
    } finally {
      setIsCopilotLoading(false);
    }
  };

  // --- HELPER GRAPH COORDINATES RESOLVER ---
  const getNodeCoordinates = (nodeId: string): { x: number; y: number } => {
    const coords: Record<string, { x: number; y: number }> = {
      // Users Column (x = 80)
      "ur-jane": { x: 80, y: 55 },
      "ur-bob": { x: 80, y: 155 },
      "ur-sales": { x: 80, y: 255 },
      "ur-admin": { x: 80, y: 355 },
      
      // Devices Column (x = 300)
      "dv-macbook-jane": { x: 300, y: 55 },
      "dv-terminal-bob": { x: 300, y: 155 },
      "dv-sales-phone": { x: 300, y: 255 },
      "dv-server-cron": { x: 300, y: 355 },
      
      // Groups Column (x = 520)
      "gp-domain-admins": { x: 520, y: 95 },
      "gp-aws-owners": { x: 520, y: 195 },
      "gp-sales-staff": { x: 520, y: 295 },
      "gp-global-administrators": { x: 520, y: 395 },
      
      // Roles Column (x = 740)
      "rl-global-admin": { x: 740, y: 130 },
      "rl-aws-root-role": { x: 740, y: 250 },
      "rl-sales-lead-role": { x: 740, y: 370 },
      
      // Applications Column (x = 940)
      "ap-azure-portal": { x: 940, y: 55 },
      "ap-aws-prod": { x: 940, y: 155 },
      "ap-okta-admin": { x: 940, y: 255 },
      "ap-salesforce": { x: 940, y: 355 }
    };
    return coords[nodeId] || { x: 500, y: 220 };
  };

  // --- COMPUTE ACTIVE RELATIONSHIP BLAST RADIUS (Downstream connection map) ---
  const getDownstreamBlastRadius = useCallback((startId: string) => {
    const visited = new Set<string>();
    const highlightedNodes = new Set<string>();
    const highlightedLinks: { source: string; target: string }[] = [];

    const queue: { id: string; depth: number }[] = [{ id: startId, depth: 0 }];
    visited.add(startId);
    highlightedNodes.add(startId);

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;

      // Find links where current node is source
      const outgoing = links.filter(l => l.source === id);
      for (const link of outgoing) {
        if (!visited.has(link.target)) {
          visited.add(link.target);
          highlightedNodes.add(link.target);
          highlightedLinks.push({ source: link.source, target: link.target });
          queue.push({ id: link.target, depth: depth + 1 });
        }
      }
    }

    // Also trace devices or links connected back to the user
    const otherConnections = links.filter(l => l.target === startId);
    for (const link of otherConnections) {
      highlightedNodes.add(link.source);
      highlightedLinks.push({ source: link.source, target: link.target });
    }

    return { highlightedNodes, highlightedLinks };
  }, [links]);

  const activeFocusId = hoveredNodeId || selectedNodeId;
  const { highlightedNodes, highlightedLinks } = getDownstreamBlastRadius(activeFocusId);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const activeIncidentForSelected = incidents.find(i => i.userId === selectedNodeId);

  // Compute stats
  const totalIncidentCount = incidents.filter(i => i.status === "active").length;
  const criticalIncidentCount = incidents.filter(i => i.status === "active" && i.severity === "critical").length;
  const suspendedCount = nodes.filter(n => n.status === "suspended").length;
  const compromisedCount = nodes.filter(n => n.status === "compromised").length;

  // Determine App-wide Threat state representation
  const threatLevel = compromisedCount > 1 ? "CRITICAL" : compromisedCount === 1 ? "HIGH RISK" : "STABLE";

  return (
    <div id="itdr-workspace" className="min-h-screen bg-[#070b13] text-zinc-100 font-sans antialiased selection:bg-crimson selection:text-white flex flex-col">
      
      {/* HEADER BAR */}
      <header id="itdr-header" className="border-b border-[#1b2b4a] bg-[#0c1524]/95 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#a31d24]/10 rounded-lg border border-[#ef4444]/30 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-display font-semibold tracking-wide text-white flex items-center gap-2">
              ITDR Orchestration Platform <span className="text-xs px-2 py-0.5 bg-[#1b2b4a] border border-[#2b4c7e] rounded font-mono text-cyan-400 capitalize">v1.4 - Live Simulation</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">Identity Threat Detection & Response • Azure AD & Okta Telemetry Collector</p>
          </div>
        </div>

        {/* STATUS BAR METRICS */}
        <div className="flex flex-wrap items-center gap-3 md:gap-6 font-mono text-xs">
          <div className="bg-[#0e1b2f] border border-[#1d355a] px-3.5 py-1.5 rounded flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-zinc-400">Kafka Pipes:</span>
            <span className="text-emerald-400 font-medium">942 ev/s</span>
          </div>

          <div className="bg-[#0e1b2f] border border-[#1d355a] px-3.5 py-1.5 rounded flex items-center gap-2">
            <span className="text-zinc-400">Threat Profile:</span>
            <span className={`font-bold px-1.5 py-0.2 text-[10px] rounded uppercase ${
              threatLevel === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800" :
              threatLevel === "HIGH RISK" ? "bg-amber-950 text-amber-400 border border-amber-800" :
              "bg-emerald-950 text-emerald-400 border border-emerald-800"
            }`}>
              {threatLevel}
            </span>
          </div>

          <div className="bg-[#0e1b2f] border border-[#1d355a] px-3.5 py-1.5 rounded flex items-center gap-2">
            <span className="text-zinc-400">Compromised User Nodes:</span>
            <span className={`font-bold ${compromisedCount > 0 ? "text-red-500 font-semibold" : "text-zinc-300"}`}>
              {compromisedCount}
            </span>
          </div>

          <button 
            id="btn-simulation-reset"
            onClick={resetPlatform} 
            className="px-3.5 py-1.5 bg-[#182337] hover:bg-[#20314f] border border-[#2b3c58] text-white hover:text-cyan-400 rounded transition duration-150 active:scale-95 flex items-center gap-2 font-sans cursor-pointer focus:outline-none"
            title="Reset simulation baseline"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400 hover:rotate-18 pointer-events-none" />
            <span>Reset Demo</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD GRID CONTAINER */}
      <main id="itdr-dashboard-grid" className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto">
        
        {/* LEFT COLUMN: SIMULATORS & KAFKA LOGS (4 COLS) */}
        <section id="column-threat-simulation" className="xl:col-span-4 flex flex-col gap-6">
          
          {/* SIMULATED ATTACKS TRIGGERS */}
          <div className="bg-[#0c1524] border border-[#1b2b4a] rounded-xl p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4 justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-red-500" />
                <h2 className="font-display font-medium text-white text-sm tracking-wide">Red Team Threat Simulator</h2>
              </div>
              <span className="text-[10px] bg-red-950/40 text-red-400 px-2 py-0.5 border border-red-900/60 font-mono rounded">
                SEC_LABS
              </span>
            </div>
            
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Dispatch simulated attacks into the live directory environment. Heuristic correlation alerts and visual relationships will instantly render across the platform.
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              
              {/* Token Theft */}
              <button
                id="btn-sim-token-theft"
                disabled={!!isSimulating}
                onClick={() => launchSimulation("token_theft")}
                className="w-full text-left p-3 rounded-lg border border-[#1e2536] bg-[#0f1828] hover:bg-[#153435]/30 hover:border-cyan-500/30 transition group flex justify-between items-center cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-cyan-950 text-cyan-400 group-hover:bg-cyan-900/60">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300">Okta Session Token Theft</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Hijacks cookies from Bob Jenkins (Cloud Eng)</div>
                  </div>
                </div>
                <Zap className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
              </button>

              {/* Impossible Travel */}
              <button
                id="btn-sim-impossible-travel"
                disabled={!!isSimulating}
                onClick={() => launchSimulation("impossible_travel")}
                className="w-full text-left p-3 rounded-lg border border-[#1e2536] bg-[#0f1828] hover:bg-[#341d26]/30 hover:border-red-500/30 transition group flex justify-between items-center cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-red-950 text-red-400 group-hover:bg-red-900/60">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-red-300">Impossible Travel Anomaly</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Two country logins in 5 min (Jane Miller)</div>
                  </div>
                </div>
                <Zap className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition" />
              </button>

              {/* Service account escalation */}
              <button
                id="btn-sim-privilege-escalation"
                disabled={!!isSimulating}
                onClick={() => launchSimulation("privilege_escalation")}
                className="w-full text-left p-3 rounded-lg border border-[#1e2536] bg-[#0f1828] hover:bg-[#3d3119]/35 hover:border-amber-500/30 transition group flex justify-between items-center cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-amber-950 text-amber-400 group-hover:bg-amber-900/60">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-amber-300">Privilege Escalation</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Admin Server abusing Tenant Client Credentials</div>
                  </div>
                </div>
                <Zap className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
              </button>

              {/* MFA Fatigue Approval */}
              <button
                id="btn-sim-mfa-fatigue"
                disabled={!!isSimulating}
                onClick={() => launchSimulation("mfa_fatigue")}
                className="w-full text-left p-3 rounded-lg border border-[#1e2536] bg-[#0f1828] hover:bg-[#201d3a]/30 hover:border-violet-500/30 transition group flex justify-between items-center cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-violet-950 text-violet-400 group-hover:bg-violet-900/60">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-violet-300">Force Push fatigue approval</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Triggers Carlos Estrada MFA prompt acceptance</div>
                  </div>
                </div>
                <Zap className="w-3.5 h-3.5 text-zinc-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition" />
              </button>

            </div>
          </div>

          {/* TELEMETRY NORMALIZATION WORKSPACE STREAM (APACHE KAFKA TOPIC) */}
          <div className="bg-[#0c1524] border border-[#1b2b4a] rounded-xl p-5 flex-1 flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h2 className="font-display font-medium text-white text-sm tracking-wide">Normalized Kafka Telemetry Stream</h2>
              </div>
              
              {/* Streaming state controller */}
              <button 
                id="btn-toggle-kafka-stream"
                onClick={() => setAutoPipeOnline(!autoPipeOnline)}
                className={`text-[9px] px-2 py-0.5 font-mono rounded cursor-pointer border ${
                  autoPipeOnline 
                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-800" 
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {autoPipeOnline ? "RECEIVER: ACTIVE" : "RECEIVER: PAUSED"}
              </button>
            </div>
            
            <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
              Ingesting stream from Entra ID API (Graph logs) & Okta System logs. Data normalized into identity schemas.
            </p>

            {/* LOG STREAM OUTPUT */}
            <div id="kafka-log-terminal" className="bg-[#050911] border border-[#17253d] rounded-lg p-3 flex-1 overflow-y-auto font-mono text-[11px] space-y-2.5 max-h-[480px]">
              {logs.map((log) => {
                const isSystemSim = log.eventType.includes("Simulation") || log.eventType.includes("Session Hijacked") || log.eventType.includes("Anomalous") || log.eventType.includes("Consent") || log.eventType.includes("Approved");
                const isFail = log.status === "failure" || isSystemSim;
                const isTrigger = log.status === "triggered";

                return (
                  <div key={log.id} className="pb-2 border-b border-zinc-950 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] px-1 rounded uppercase font-semibold ${
                        log.provider === "okta" ? "bg-cyan-950/80 text-cyan-400 border border-cyan-900/60" : "bg-blue-950/80 text-blue-400 border border-blue-900/60"
                      }`}>
                        {log.provider}
                      </span>
                      <span className="text-zinc-500 font-normal text-[9px]">{log.timestamp.split(' ')[1]}</span>
                    </div>

                    <div className="mt-1 font-semibold text-zinc-300">
                      {log.eventType}
                    </div>

                    <div className="text-[10px] text-zinc-400 mt-0.5 truncate gap-1">
                      User: <span className="text-zinc-300">{log.userPrincipalName}</span> • 
                      IP: <span className="text-zinc-300">{log.ipAddress}</span> (<span className="text-zinc-400">{log.location}</span>)
                    </div>

                    <p className={`mt-1 pl-2 border-l text-[10px] leading-relaxed ${
                      isFail ? "text-red-400/90 border-red-800" :
                      isTrigger ? "text-amber-400/90 border-amber-800" :
                      "text-zinc-500 border-zinc-800"
                    }`}>
                      {log.details}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </section>

        {/* MIDDLE COLUMN: THE SVG IDENTITY GRAPH NETWORK (5 COLS) */}
        <section id="column-identity-graph" className="xl:col-span-8 flex flex-col gap-6">
          
          <div className="bg-[#0c1524] border border-[#1b2b4a] rounded-xl p-5 flex flex-col flex-1">
            
            {/* Header of the graph workspace */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2b4a]/80 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-display font-medium text-white text-base tracking-wide">Identity Relationship & Blast Radius Map</h2>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Click on any user/resource node to calculate **active downstream Blast Radius** path (lit in crimson/gold).
                </p>
              </div>

              {/* Quick Status Explanations */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 bg-[#0a1a2e] px-2 py-1 rounded border border-[#183a66]">
                  <span className="w-2 h-2 rounded bg-cyan-400"></span>
                  <span className="text-zinc-300">Azure/Okta Hub</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#2d0f14] px-2 py-1 rounded border border-[#6b1e29]">
                  <span className="w-2 h-2 rounded bg-red-500"></span>
                  <span className="text-zinc-300">Compromised</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0f241d] px-2 py-1 rounded border border-emerald-800">
                  <span className="w-2 h-2 rounded bg-emerald-400"></span>
                  <span className="text-zinc-300">Remediated</span>
                </div>
              </div>
            </div>

            {/* GRAPH COLUMNS LABELS */}
            <div id="graph-columns-labels" className="grid grid-cols-5 text-center text-[10px] font-mono tracking-widest text-[#5d7daa] uppercase font-bold py-1 bg-zinc-950/45 rounded-lg border border-[#15243f] mb-3">
              <div>Users</div>
              <div>Devices</div>
              <div>Groups</div>
              <div>Roles</div>
              <div>App Access</div>
            </div>

            {/* THE INTERACTIVE SVG GRAPH BODY */}
            <div className="bg-[#040810] border border-[#16253c] rounded-xl relative overflow-hidden flex-1 flex items-center justify-center min-h-[460px]">
              
              {/* Backdrop grid simulation */}
              <div className="absolute inset-0 bg-[radial-gradient(#14213d_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

              {/* Absolute label of inspected focus node */}
              <div className="absolute top-3 left-4 text-xs font-mono bg-zinc-950/80 border border-[#1a385f] px-3 py-1.5 rounded-md flex items-center gap-2 text-zinc-300">
                <span className="text-zinc-500">Inspecting:</span>
                <span className="text-cyan-400 font-semibold">{selectedNode?.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                  selectedNode?.status === "compromised" ? "bg-red-950 text-red-400" :
                  selectedNode?.status === "suspended" ? "bg-zinc-800 text-zinc-400" :
                  selectedNode?.status === "password_reset_required" ? "bg-amber-950 text-amber-400" :
                  "bg-emerald-950 text-emerald-400"
                }`}>
                  {selectedNode?.status}
                </span>
              </div>

              {/* GRAPH CANVAS SVG */}
              <svg 
                viewBox="0 0 1000 420" 
                className="w-full h-full max-w-[960px] max-h-[400px] select-none relative z-10 p-2"
              >
                
                {/* 1. DRAW CONNECTION PATHS FIRST */}
                <g id="graph-links-layer">
                  {links.map((link, idx) => {
                    const sourceCoords = getNodeCoordinates(link.source);
                    const targetCoords = getNodeCoordinates(link.target);
                    
                    // Check if this relation is active in the highlighted blast radius
                    const isLinkHighlighted = highlightedLinks.some(
                      hl => hl.source === link.source && hl.target === link.target
                    );

                    // Check if the source node itself is compromised
                    const sourceNode = nodes.find(n => n.id === link.source);
                    const isCompromisedPath = sourceNode?.status === "compromised" && isLinkHighlighted;

                    // Compute clean curved line d parameters (s-bezier curve)
                    const controlXOffset = Math.abs(targetCoords.x - sourceCoords.x) * 0.45;
                    const dParam = `M ${sourceCoords.x} ${sourceCoords.y} C ${sourceCoords.x + controlXOffset} ${sourceCoords.y}, ${targetCoords.x - controlXOffset} ${targetCoords.y}, ${targetCoords.x} ${targetCoords.y}`;

                    return (
                      <g key={`${link.source}-${link.target}-${idx}`}>
                        
                        {/* Background structural thick track */}
                        <path
                          d={dParam}
                          fill="none"
                          stroke={
                            isCompromisedPath ? "#f87171" : 
                            isLinkHighlighted ? "#fbbf24" : 
                            "#13213a"
                          }
                          strokeWidth={isLinkHighlighted ? 2.5 : 1.2}
                          strokeOpacity={isLinkHighlighted ? 0.9 : 0.35}
                          className="transition-all duration-350"
                        />
                        
                        {/* Interactive glow march line */}
                        {isLinkHighlighted && (
                          <path
                            d={dParam}
                            fill="none"
                            stroke={isCompromisedPath ? "#ef4444" : "#f1c40f"}
                            strokeWidth={3}
                            strokeDasharray="6 8"
                            strokeLinecap="round"
                            strokeOpacity={0.8}
                            className="pointer-events-none"
                            style={{
                              animation: "dash-march 20s linear infinite",
                            }}
                          />
                        )}

                        {/* Text relationship label on hover of link */}
                        {isLinkHighlighted && (
                          <text
                            x={(sourceCoords.x + targetCoords.x) / 2}
                            y={(sourceCoords.y + targetCoords.y) / 2 - 4}
                            textAnchor="middle"
                            fill={isCompromisedPath ? "#f87171" : "#fbbf24"}
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                            className="bg-black drop-shadow-md transition-all pointer-events-none"
                          >
                            {link.relationship}
                          </text>
                        )}

                      </g>
                    );
                  })}
                </g>

                {/* 2. DRAW ENTITY NODES */}
                <g id="graph-nodes-layer">
                  {nodes.map((node) => {
                    const { x, y } = getNodeCoordinates(node.id);
                    const isSelected = selectedNodeId === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const isNodeInBlastRadius = highlightedNodes.has(node.id);
                    
                    // Determine visual color signature based on Category and status
                    const isCompromised = node.status === "compromised";
                    const isSuspended = node.status === "suspended";
                    
                    let nodeFill = "#111827";
                    let nodeBorder = "#1d355a";
                    let nodeTextGlow = "text-zinc-300";

                    if (isCompromised) {
                      nodeBorder = "#ef4444";
                      nodeFill = "#220005";
                    } else if (isSuspended) {
                      nodeBorder = "#4b5563";
                      nodeFill = "#111827";
                    } else if (node.status === "password_reset_required") {
                      nodeBorder = "#f59e0b";
                      nodeFill = "#241804";
                    } else if (isNodeInBlastRadius) {
                      const hostUser = nodes.find(n => n.id === activeFocusId);
                      nodeBorder = hostUser?.status === "compromised" ? "#f87171" : "#facc15";
                      nodeFill = "#0c1b33";
                    }

                    // Hover offset or border size increase
                    const radiusValue = 18;
                    const borderStrokeWidth = isSelected ? 3 : isHovered ? 2.5 : isNodeInBlastRadius ? 2 : 1.2;

                    return (
                      <g 
                        key={node.id}
                        transform={`translate(${x}, ${y})`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          setCopilotResult(null); // Reset analysis on selection switch
                          setCopilotError(null);
                        }}
                      >
                        {/* PULSING COMPROMISE RADIAL BEACON BACKGROUND */}
                        {isCompromised && (
                          <circle
                            r={radiusValue + 12}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="1.5"
                            className="animate-ping opacity-25"
                            style={{ transformOrigin: "0px 0px" }}
                          />
                        )}

                        {/* Blast Radius Gold Glow ring */}
                        {isNodeInBlastRadius && (
                          <circle
                            r={radiusValue + 6}
                            fill="none"
                            stroke={nodes.find(n => n.id === activeFocusId)?.status === "compromised" ? "#ef4444" : "#fbbf24"}
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                            className="animate-spin"
                            style={{ animationDuration: "14s", transformOrigin: "0px 0px" }}
                          />
                        )}

                        {/* Primary Circle Container */}
                        <circle
                          r={radiusValue}
                          fill={nodeFill}
                          stroke={nodeBorder}
                          strokeWidth={borderStrokeWidth}
                          className="transition-all duration-200"
                        />

                        {/* NODE INNER CATEGORY ICON */}
                        <g transform="translate(-8, -8) scale(0.65)" className="text-zinc-300">
                          {node.type === "user" && (
                            <User className={isCompromised ? "text-red-500" : isNodeInBlastRadius ? "text-yellow-400" : "text-zinc-300"} />
                          )}
                          {node.type === "device" && (
                            <Laptop className={isCompromised ? "text-red-500" : isNodeInBlastRadius ? "text-yellow-400" : "text-cyan-400"} />
                          )}
                          {node.type === "group" && (
                            <Users className={isCompromised ? "text-red-500" : isNodeInBlastRadius ? "text-yellow-400" : "text-purple-400"} />
                          )}
                          {node.type === "role" && (
                            <Key className={isCompromised ? "text-red-500" : isNodeInBlastRadius ? "text-yellow-400" : "text-amber-400"} />
                          )}
                          {node.type === "application" && (
                            <Server className={isCompromised ? "text-red-500" : isNodeInBlastRadius ? "text-yellow-400" : "text-blue-400"} />
                          )}
                        </g>

                        {/* Text labels below / beside node */}
                        <text
                          y={radiusValue + 13}
                          textAnchor="middle"
                          fill={
                            isCompromised ? "#f87171" : 
                            isSelected ? "#22d3ee" : 
                            isNodeInBlastRadius ? "#facc15" : 
                            "#cbd5e1"
                          }
                          fontSize={isSelected ? "9.5" : "8"}
                          fontFamily="sans-serif"
                          fontWeight={isSelected || isNodeInBlastRadius ? "600" : "400"}
                          className="pointer-events-none drop-shadow-md select-none tracking-wide"
                        >
                          {node.name.length > 15 ? `${node.name.slice(0, 13)}..` : node.name}
                        </text>

                        {/* Secondary context label for category style info */}
                        <text
                          y={radiusValue + 22}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="7"
                          fontFamily="monospace"
                          className="pointer-events-none select-none"
                        >
                          {node.type.toUpperCase()}
                        </text>

                        {/* Small Mini-risk Bubble indicator in node margin */}
                        {node.type === "user" && node.riskScore > 0 && (
                          <g transform="translate(10, -12)">
                            <circle r="7" fill="#090d16" stroke={isCompromised ? "#ef4444" : "#eab308"} strokeWidth="1" />
                            <text
                              textAnchor="middle"
                              y="2.5"
                              fill={isCompromised ? "#ef4444" : "#eab308"}
                              fontSize="6.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              {node.riskScore}
                            </text>
                          </g>
                        )}

                      </g>
                    );
                  })}
                </g>

              </svg>

              {/* Marching keyframe definition needed inline inside style block for rendering */}
              <style>{`
                @keyframes dash-march {
                  to {
                    stroke-dashoffset: -120;
                  }
                }
              `}</style>
            </div>

            {/* DIRECTORY INSPECTION BOX FOR SELECTED NODE */}
            <div id="inspector-bottom-pane" className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border border-[#1a2d4d] bg-[#0d1726]/80 backdrop-blur-sm self-stretch text-xs">
              <div className="flex flex-col gap-1 md:border-r md:border-[#1a2d4d] pr-2">
                <span className="text-zinc-500 font-mono uppercase text-[9px] tracking-wider">Identity Entity</span>
                <span className="text-white text-sm font-semibold truncate flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  {selectedNode?.name}
                </span>
                <span className="text-zinc-400 truncate text-[10px] font-mono">{selectedNode?.id}</span>
              </div>

              <div className="flex flex-col gap-1 md:border-r md:border-[#1a2d4d] px-2">
                <span className="text-zinc-500 font-mono uppercase text-[9px] tracking-wider">Classification Detail</span>
                <span className="text-zinc-200 capitalize font-medium">{selectedNode?.type}</span>
                <span className="text-zinc-400 font-mono text-[10px]">{selectedNode?.email || "Directory Object Metadata"}</span>
              </div>

              <div className="flex flex-col gap-1 md:border-r md:border-[#1a2d4d] px-2 text-[11px]">
                <span className="text-zinc-500 font-mono uppercase text-[9px] tracking-wider">Security Telemetry</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-zinc-400">Risk Score:</span>
                  <span className={`font-bold font-mono px-1 rounded text-xs ${
                    selectedNode && selectedNode.riskScore > 70 ? "text-red-400 bg-red-950/40" :
                    selectedNode && selectedNode.riskScore > 30 ? "text-amber-400 bg-amber-950/40" :
                    "text-emerald-400 bg-emerald-950/40"
                  }`}>
                    {selectedNode?.riskScore}/100
                  </span>
                </div>
                <span className="text-zinc-400 block text-[10px] truncate">
                  Loc: {selectedNode?.location || "N/A - Federated Group Link"}
                </span>
              </div>

              <div className="flex flex-col gap-1 pl-2 justify-center">
                <span className="text-zinc-500 font-mono uppercase text-[9px] tracking-wider">Active Blast Radius</span>
                <span className="text-zinc-200 font-medium">
                  Direct reach: <strong className="text-yellow-400 font-mono">{highlightedNodes.size - 1}</strong> resources
                </span>
                <span className="text-[10px] text-zinc-400 truncate block">
                  Hover/Click to highlight access vectors
                </span>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* LOWER PANEL: INVESTIGATOR, AUTORESPONSE PLAYBOOK AND COPILOT AI (FULL WIDTH SPLIT) */}
      <section id="copilot-and-response-center" className="px-6 pb-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto">
        
        {/* DETECTED ALERTS LISTING (4 COLS) */}
        <div className="xl:col-span-4 bg-[#0c1524] border border-[#1b2b4a] rounded-xl p-5 flex flex-col h-full min-h-[440px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1b2b4a]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h3 className="font-display font-medium text-white text-sm tracking-wide">Threat & Detection Alerts</h3>
            </div>
            <span className="font-mono text-[10px] bg-[#1a2b4b] px-2 py-0.5 rounded text-cyan-400 font-semibold border border-cyan-900/40">
              {incidents.filter(i => i.status === "active").length} ACTIVE
            </span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {incidents.map((incident) => {
              const isCompromised = nodes.find(n => n.id === incident.userId)?.status === "compromised";
              const targetNode = nodes.find(n => n.id === incident.userId);
              const isMitigated = incident.status === "mitigated";

              return (
                <div 
                  key={incident.id} 
                  onClick={() => setSelectedNodeId(incident.userId)}
                  className={`p-3.5 rounded-xl border transition duration-150 cursor-pointer ${
                    selectedNodeId === incident.userId ? "border-[#1e3458] bg-[#0c1a2e]" : "border-[#1c2c46] hover:border-[#253f65]"
                  } ${
                    isMitigated 
                      ? "border-emerald-950 bg-emerald-950/10 opacity-70 hover:opacity-100" 
                      : incident.severity === "critical"
                      ? "border-red-950 hover:border-red-800 bg-[#1a0609]/60 hover:bg-[#230a10]/60"
                      : "border-amber-950 hover:border-amber-800 bg-[#160e03]/60 hover:bg-[#211604]/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] px-1.5 py-0.5 font-mono uppercase rounded font-bold ${
                      isMitigated
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/80"
                        : incident.severity === "critical"
                        ? "bg-red-950 text-red-400 border border-red-800/80"
                        : "bg-amber-950 text-amber-500 border border-amber-800/80"
                    }`}>
                      {isMitigated ? "MITIGATED" : incident.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{incident.detectedAt.split(' ')[1] || incident.detectedAt}</span>
                  </div>

                  <h4 className="text-zinc-200 text-xs font-semibold">{incident.title}</h4>
                  
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Target IAM account: <strong className="text-zinc-200">{targetNode?.name || incident.userId}</strong>
                  </div>

                  <p className="text-[10.5px] text-zinc-400 mt-1.5 leading-relaxed bg-[#050911]/40 p-2 rounded border border-zinc-950">
                    {incident.description}
                  </p>

                  <div className="text-[9.5px] font-mono text-zinc-500 mt-2 truncate bg-zinc-950 py-1 px-1.5 rounded block">
                    Forensic evidence: {incident.evidence}
                  </div>
                </div>
              );
            })}
            {incidents.length === 0 && (
              <div className="text-center text-zinc-500 py-12 text-xs">
                No telemetry alerts flagged currently. System healthy.
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE/RIGHT: INVESTIGATOR INSPECTOR & AI COPILOT ANALYST (8 COLS) */}
        <div id="inspector-tabs-and-playbook" className="xl:col-span-8 bg-[#0c1524] border border-[#1b2b4a] rounded-xl p-5 flex flex-col h-full min-h-[440px]">
          
          {/* TAB HEADERS */}
          <div className="flex items-center justify-between border-b border-[#1b2b4a] pb-3 mb-4 flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                id="tab-investigator"
                onClick={() => setActiveTab("investigator")}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === "investigator" 
                    ? "bg-[#25395a] text-white font-semibold border-b-2 border-cyan-500" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-[#15233c]"
                }`}
              >
                1. Blast Radius Analysis
              </button>
              <button
                id="tab-playbook"
                onClick={() => setActiveTab("playbook")}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === "playbook" 
                    ? "bg-[#25395a] text-white font-semibold border-b-2 border-cyan-500" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-[#15233c]"
                }`}
              >
                2. Response Orchestration Playbook
              </button>
            </div>

            <div className="text-[11px] font-mono bg-[#070d17] border border-[#1d355a] px-3 py-1.5 rounded text-zinc-400">
              Inspecting User: <strong className="text-cyan-400">{selectedNode?.name}</strong>
            </div>
          </div>

          {/* TAB CONTENT: INVESTIGATOR (BLAST RADIUS & GEMINI AI ANALYST) */}
          {activeTab === "investigator" && (
            <div className="flex-1 flex flex-col gap-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Visual Direct & Indirect Relationships summary */}
                <div className="p-4 bg-[#0a111e] border border-[#15263d] rounded-xl text-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-medium text-white mb-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-400" />
                      Incident Scope Blast Radius Tree
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      If compromised, an attacker inherits access to all linked directory objects. Downstream escalation vectors are mapped below:
                    </p>
                  </div>

                  <div className="space-y-2 mt-2 bg-zinc-950/60 p-3 rounded-lg border border-zinc-900/60 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500">Resource Category</span>
                      <span className="text-zinc-400">Linked Identity Element</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-zinc-400 text-[10px]">Managed Device login:</span>
                      <span className="text-cyan-400 text-right truncate max-w-[180px]">
                        {links.find(l => l.source === selectedNodeId && l.relationship === "LOGGED_IN_FROM")?.target || "None verified"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-zinc-400 text-[10px]">Primary IdP Group membership:</span>
                      <span className="text-purple-400 text-right truncate max-w-[180px]">
                        {links.find(l => l.source === selectedNodeId && l.relationship === "MEMBER_OF")?.target || "None"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-zinc-400 text-[10px]">Inherited AWS/Azure role:</span>
                      <span className="text-amber-400 text-right truncate max-w-[180px]">
                        {(() => {
                          const group = links.find(l => l.source === selectedNodeId && l.relationship === "MEMBER_OF")?.target;
                          const role = links.find(l => l.source === group && l.relationship === "HAS_ROLE")?.target;
                          return role || "None";
                        })()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-zinc-400 text-[10px]">Access to Critical App infrastructure:</span>
                      <span className="text-blue-400 text-right truncate max-w-[180px]">
                        {(() => {
                          const group = links.find(l => l.source === selectedNodeId && l.relationship === "MEMBER_OF")?.target;
                          const role = links.find(l => l.source === group && l.relationship === "HAS_ROLE")?.target;
                          const appAccess = links.find(l => l.source === role)?.target;
                          return appAccess || "None";
                        })()}
                      </span>
                    </div>

                  </div>

                  <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2 flex items-center justify-between">
                    <span>*Calculated automatically using dynamic graphs</span>
                    <button 
                      onClick={() => setActiveTab("playbook")}
                      className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Remediate now <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Directory Information Inspect card */}
                <div className="p-4 bg-[#0a111e] border border-[#15263d] rounded-xl text-xs space-y-3 text-[11px]">
                  <h4 className="font-display font-medium text-white flex items-center gap-1.5 border-b border-[#1b2b4a]/75 pb-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Azure/Okta Hub Directory Specs
                  </h4>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-3 font-mono">
                    <div>
                      <div className="text-[9px] text-[#5c7da9] uppercase">UserPrincipalName</div>
                      <div className="text-zinc-200 text-xs truncate">{selectedNode?.email || "N/A - System Group"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#5c7da9] uppercase">Department</div>
                      <div className="text-zinc-200 text-xs truncate">{selectedNode?.department || "Infrastructure"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#5c7da9] uppercase">Registered MFA Challenge</div>
                      <div className="text-zinc-200 text-xs truncate flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        {selectedNode?.mfaMethod || "N/A - Direct Object"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#5c7da9] uppercase">Anomalous IP Origin</div>
                      <div className="text-zinc-200 text-xs truncate">{selectedNode?.ipAddress || "No Active IP"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#5c7da9] uppercase">Last Reported Location</div>
                      <div className="text-zinc-200 text-xs truncate">{selectedNode?.location || "Data Center"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#5c7da9] uppercase">Last Directory Sync</div>
                      <div className="text-zinc-200 text-xs truncate font-serif">{selectedNode?.lastLogin || "2026-06-18 09:00:00"}</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* GEMINI AI SECURITY COPILOT ANALYST PANE */}
              <div className="border border-[#203a62] bg-[#0c1b33]/45 rounded-xl p-5 mt-2 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1.5 bg-[#ef4444]/10 text-[#ef4444] border-b border-l border-[#ef4444]/30 rounded-bl text-[8px] font-mono tracking-widest uppercase">
                  Gemini Analyst Engine Enabled
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 sm:p-3 bg-gradient-to-tr from-[#2563eb] to-[#a855f7] rounded-xl border border-blue-500/30 text-white flex-shrink-0">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-medium text-white text-sm tracking-wide">
                      Consult Gemini Security Copilot Analyst
                    </h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      Consult Google Gemini AI model automatically passing telemetry metadata, target directory pathways, and compromise scope. Explains impossible travel velocities, session token vulnerabilities, and calculates realblast radius impacts instantly.
                    </p>
                  </div>
                </div>

                {/* Trigger Button or Display Output */}
                {!copilotResult && !isCopilotLoading && (
                  <div className="flex items-center gap-3 mt-1.5">
                    <button
                      id="btn-invoke-copilot"
                      onClick={() => invokeAICopilot(selectedNodeId)}
                      className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs rounded-lg shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition flex items-center gap-2 cursor-pointer focus:outline-none"
                    >
                      <Sparkles className="w-4.5 h-4.5" />
                      <span>Execute AI Blast-Radius Forensic Investigation</span>
                    </button>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      (Analyzes: {selectedNode?.name})
                    </span>
                  </div>
                )}

                {isCopilotLoading && (
                  <div className="p-8 bg-[#040914] border border-cyan-900/40 rounded-xl flex flex-col items-center justify-center text-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-cyan-400 border-b-indigo-500 animate-spin"></div>
                      <Sparkles className="w-5 h-5 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-cyan-400 animate-pulse">Running Gemini Guardrail Analytics & Multi-Hop Path Extraction...</p>
                      <p className="text-[10px] text-zinc-400 mt-1 italic">Reconstructing Session Integrity Token Chains</p>
                    </div>
                  </div>
                )}

                {copilotError && (
                  <div className="p-4 bg-red-950/20 border border-red-800/50 rounded-lg text-xs flex items-center gap-2 text-red-400 font-mono">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Error query Copilot AI: {copilotError}</span>
                  </div>
                )}

                {copilotResult && (
                  <div className="bg-[#050c18] border border-blue-900/30 rounded-xl p-4.5 space-y-4 text-xs select-text">
                    
                    {/* Visual AI Metrics Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-zinc-950 p-2 rounded border border-zinc-900 text-center flex flex-col gap-0.5">
                        <span className="text-zinc-500 text-[9px] font-mono uppercase">Calculated Risk Tier</span>
                        <span className={`text-xs font-bold ${
                          copilotResult.response.blastRadiusMetrics.riskTier === "Critical" ? "text-red-500" : "text-amber-500"
                        }`}>{copilotResult.response.blastRadiusMetrics.riskTier} Risk</span>
                      </div>

                      <div className="bg-zinc-950 p-2 rounded border border-zinc-900 text-center flex flex-col gap-0.5">
                        <span className="text-zinc-500 text-[9px] font-mono uppercase">Escalation Scope (1-Hop)</span>
                        <span className="text-xs font-bold text-yellow-400">{copilotResult.response.blastRadiusMetrics.directAccessCount} Connected</span>
                      </div>

                      <div className="bg-zinc-950 p-2 rounded border border-zinc-900 text-center flex flex-col gap-0.5">
                        <span className="text-zinc-500 text-[9px] font-mono uppercase">Multi-Hop Reachable</span>
                        <span className="text-xs font-bold text-teal-400">{copilotResult.response.blastRadiusMetrics.indirectAccessCount} Entities</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-[11.5px] leading-relaxed">
                      <div>
                        <strong className="text-white block mb-1">Executive Threat Summary:</strong>
                        <p className="text-zinc-300 bg-zinc-950/40 p-3 rounded border border-zinc-900/60 font-sans leading-relaxed">
                          {copilotResult.response.summary}
                        </p>
                      </div>

                      <div>
                        <strong className="text-white block mb-1">Attack Vector & Mechanics Report:</strong>
                        <p className="text-zinc-300 bg-zinc-950/40 p-3 rounded border border-zinc-900/60 font-sans leading-relaxed">
                          {copilotResult.response.attackVectorExplanation}
                        </p>
                      </div>

                      <div>
                        <strong className="text-white block mb-1">High Risk App Licenses & Groups:</strong>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {copilotResult.response.blastRadiusMetrics.criticalAssetsRisk.map((asset, i) => (
                            <span key={i} className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-mono rounded">
                              ⚠️ {asset}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-900/60">
                        <strong className="text-white block mb-2">Automated Execution Containment Playbook:</strong>
                        <ol className="list-decimal list-inside space-y-1.5 pl-1.5 text-zinc-300">
                          {copilotResult.response.remediationPlaybook.map((step, i) => (
                            <li key={i} className="font-sans text-[11px] leading-relaxed"><span className="text-zinc-400">{step}</span></li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    {/* Developer/System notice */}
                    <div className="text-[9.5px] font-mono text-zinc-500 flex items-center justify-between border-t border-[#11233e] pt-2 italic mt-1 bg-zinc-950 p-1.5 rounded">
                      <span>{copilotResult.info}</span>
                      <button 
                        onClick={() => invokeAICopilot(selectedNodeId)}
                        className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-1 font-mono"
                      >
                        Re-Analyze <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB CONTENT: PLAYBOOK CONSOLE (ORCHESTRATE COMMANDS) */}
          {activeTab === "playbook" && (
            <div className="flex-1 flex flex-col justify-between gap-5 text-xs">
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 bg-[#0a111e] border border-zinc-800 p-4 rounded-xl">
                  <div className="p-2 bg-yellow-950/40 border border-yellow-800 text-yellow-500 rounded">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-xs">Interactive SOC Playbook controls</h4>
                    <p className="text-[10.5px] text-zinc-400 mt-1 leading-relaxed">
                      Select any mitigation command below to issue instructions back to the Identity Provider (Okta/Entra AD API). Executing these processes will immediately secure the node, recalculate directory risk values, and mitigate outstanding alerts.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Playbook 1: Force Password Reset */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 bg-[#0a111e]/80 transition duration-150 ${
                    selectedNode?.status === "password_reset_required" ? "border-amber-800" : "border-zinc-800"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[9px] text-[#557eb5] uppercase tracking-wider">COMMAND: RESET_PW</span>
                        <Unlock className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                      <h5 className="text-zinc-200 text-xs font-semibold">Force NextPassword Reset</h5>
                      <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">
                        Immediately invalidates local directory credentials. Forces user to update login profile. Lowers user risk score.
                      </p>
                    </div>
                    <button
                      id="btn-playbook-force-reset"
                      onClick={() => executeRemediation(selectedNodeId, "force_reset")}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Execute Command</span>
                    </button>
                  </div>

                  {/* Playbook 2: Revoke Active Sessions */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 bg-[#0a111e]/80 transition duration-150 ${
                    selectedNode?.status === "secured" ? "border-emerald-800" : "border-zinc-800"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[9px] text-[#557eb5] uppercase tracking-wider">COMMAND: KILL_TOKENS</span>
                        <Lock className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                      <h5 className="text-zinc-200 text-xs font-semibold">Revoke Session Tokens</h5>
                      <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">
                        Calls Okta/Entra API to trigger instant OAuth token revocation and destroy browser cookie footprints. Secures hijacked node.
                      </p>
                    </div>
                    <button
                      id="btn-playbook-revoke-sessions"
                      onClick={() => executeRemediation(selectedNodeId, "revoke_sessions")}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Revoke Sessions</span>
                    </button>
                  </div>

                  {/* Playbook 3: Suspend User */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 bg-[#0a111e]/80 transition duration-150 ${
                    selectedNode?.status === "suspended" ? "border-red-950 bg-red-950/10" : "border-zinc-800"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[9px] text-[#557eb5] uppercase tracking-wider">COMMAND: HALT_PRINCIPAL</span>
                        <Unlock className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                      <h5 className="text-zinc-200 text-xs font-semibold">Suspend Account Login</h5>
                      <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">
                        Hard suspension. Fully disables login gateway, cutting off all active and incoming connection requests instantly.
                      </p>
                    </div>
                    <button
                      id="btn-playbook-suspend-user"
                      onClick={() => executeRemediation(selectedNodeId, "suspend_user")}
                      className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-medium text-xs rounded transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Suspend Principal</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* REMEDIATION ACTION HISTORIC FEED */}
              <div className="mt-4 flex-1 flex flex-col justify-end bg-zinc-950/70 rounded-xl p-4.5 border border-zinc-900/80">
                <div className="flex items-center gap-2 mb-2 text-zinc-400 font-mono text-[10px] uppercase border-b border-zinc-900 pb-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mitigation Dispatch Audit Trails</span>
                </div>

                <div className="space-y-1.5 font-mono text-[10.5px] max-h-[140px] overflow-y-auto">
                  {remediations.map((rem) => {
                    const nodeInstance = nodes.find(n => n.id === rem.userId);
                    return (
                      <div key={rem.id} className="flex gap-2 text-zinc-400">
                        <span className="text-emerald-400 text-[9.5px]">[{rem.timestamp.split(' ')[1] || rem.timestamp}]</span>
                        <span>Dispatch Mitigate command:</span>
                        <strong className="text-zinc-200">{rem.actionType.toUpperCase()}</strong>
                        <span>on</span>
                        <strong className="text-cyan-400">{nodeInstance?.name || rem.userId}</strong>
                        <span>•</span>
                        <span className="text-zinc-400">{rem.details}</span>
                        <span className="text-emerald-500 ml-auto font-semibold">{rem.status.toUpperCase()}</span>
                      </div>
                    );
                  })}
                  {remediations.length === 0 && (
                    <div className="text-[10px] text-zinc-500 italic py-3 text-center">
                      No automated responses invoked in current telemetry session. Run simulation to begin threat audit workflows.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </section>

      {/* FOOTER */}
      <footer id="itdr-footer" className="mt-auto border-t border-[#1b2b4a] bg-[#070b13] py-4.5 text-center font-mono text-[10px] text-zinc-500">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3.5">
          <span>Identity Threat Detection & Response • Cyber Security Center • Restricted Session</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              All Systems Operational
            </span>
            <span>•</span>
            <span>Enterprise AD/Okta Fed Module Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
