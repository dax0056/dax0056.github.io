import React, { useState, useEffect, useRef } from 'react';
import { LAB_SCENARIOS, AVAILABLE_TOOLS } from '../data/labData';
import type { LabScenario, LabStage, AgentToolInfo, DiffLine } from '../data/labData';
import {
  Play,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  FileCode2,
  Layers,
  GitPullRequest,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Lock,
  Share2,
  ArrowLeft,
  Database,
  Wrench,
  Sliders,
  Send,
  ChevronDown,
  ChevronUp,
  GitCompare,
  Clock,
  Info,
  Code2,
  Activity,
  Eye,
  X
} from 'lucide-react';

interface AgentLabStandaloneProps {
  onNavigateHome: () => void;
  initialScenarioId?: string;
}

// ─── Security Boundary Panel ──────────────────────────────────────────────────
const SecurityBoundaryPanel: React.FC = () => (
  <div className="rounded-xl border border-slate-800 bg-obsidian-900/80 p-4">
    <div className="flex items-center gap-2 mb-3">
      <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
      <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Security Boundary</span>
    </div>
    <div className="space-y-1.5">
      {[
        'No Shell Access',
        'No File Access',
        'No API Keys',
        'No Remote Execution',
        'Simulation Only'
      ].map(claim => (
        <div key={claim} className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>{claim}</span>
        </div>
      ))}
    </div>
    <div className="mt-3 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-600">
      Verified in source code: 0 eval, 0 exec, 0 subprocess
    </div>
  </div>
);

// ─── Agent Trace Timeline ─────────────────────────────────────────────────────
const AgentTraceTimeline: React.FC<{
  stages: LabStage[];
  currentIndex: number;
  onStageClick: (i: number) => void;
  onReplay: () => void;
  isFinished: boolean;
}> = ({ stages, currentIndex, onStageClick, onReplay, isFinished }) => {
  const timeLabels = ['00:00', '00:01', '00:02', '00:03', '00:04', '00:05', '00:06'];
  return (
    <div className="rounded-xl border border-slate-800 bg-obsidian-900/80 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">Agent Trace</span>
        </div>
        {isFinished && (
          <button
            onClick={onReplay}
            className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 bg-cyan-950/30 px-2 py-0.5 rounded"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Replay</span>
          </button>
        )}
      </div>
      <div className="space-y-1">
        {stages.map((stage, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={stage.id}
              onClick={() => onStageClick(idx)}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-all hover:bg-slate-800/50 ${
                isCurrent ? 'bg-cyan-950/30' : ''
              }`}
            >
              <span className={`text-[10px] font-mono shrink-0 w-10 ${
                isPassed ? 'text-emerald-400' : isCurrent ? 'text-cyan-400' : 'text-slate-600'
              }`}>{timeLabels[idx] || '00:0' + idx}</span>
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                isPassed ? 'bg-emerald-500' : isCurrent ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'
              }`} />
              <span className={`text-[11px] font-mono truncate ${
                isPassed ? 'text-emerald-400' : isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-600'
              }`}>{stage.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Code Diff Viewer ─────────────────────────────────────────────────────────
const CodeDiffViewer: React.FC<{ diffLines: DiffLine[] }> = ({ diffLines }) => (
  <div className="rounded-xl overflow-hidden border border-slate-800 bg-obsidian-950">
    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-obsidian-900">
      <GitCompare className="h-3.5 w-3.5 text-cyan-400" />
      <span className="text-[11px] font-mono font-bold text-cyan-400">Code Diff</span>
      <span className="ml-auto text-[10px] font-mono text-slate-500">View Diff</span>
    </div>
    <div className="p-2 font-mono text-[11px] overflow-x-auto">
      {diffLines.map((line, i) => (
        <div
          key={i}
          className={`px-2 py-0.5 leading-relaxed ${
            line.type === 'header' ? 'text-slate-500 italic' :
            line.type === 'add' ? 'bg-emerald-950/40 text-emerald-300' :
            line.type === 'remove' ? 'bg-red-950/40 text-red-300' :
            'text-slate-400'
          }`}
        >
          {line.content}
        </div>
      ))}
    </div>
    <div className="border-t border-slate-800 px-3 py-2 bg-obsidian-900">
      <div className="flex items-center gap-3 text-[10px] font-mono">
        <span className="text-emerald-400">Approval Gate →</span>
        <span className="text-cyan-400">AST Validation →</span>
        <span className="text-emerald-400 font-bold">Verified</span>
      </div>
    </div>
  </div>
);

// ─── Verification Center ──────────────────────────────────────────────────────
const VerificationCenter: React.FC<{
  checks?: LabStage['verificationChecks'];
  status: string;
}> = ({ checks, status }) => {
  const items = checks ? [
    { label: 'Syntax', value: checks.syntax, color: 'text-cyan-400' },
    { label: 'Policy', value: checks.policy, color: 'text-blue-400' },
    { label: 'Sandbox', value: checks.sandbox, color: 'text-purple-400' },
    { label: 'Integrity', value: checks.integrity, color: 'text-emerald-400' },
  ] : [
    { label: 'Syntax', value: 'Pending', color: 'text-slate-500' },
    { label: 'Policy', value: 'Pending', color: 'text-slate-500' },
    { label: 'Sandbox', value: 'Pending', color: 'text-slate-500' },
    { label: 'Integrity', value: 'Pending', color: 'text-slate-500' },
  ];

  const isVerified = checks?.passed;

  return (
    <div className="rounded-xl border border-slate-800 bg-obsidian-900/80 p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Verification Center</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {items.map(item => (
          <div key={item.label} className={`rounded-lg border p-2 ${
            checks?.passed ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-slate-800 bg-obsidian-950'
          }`}>
            <div className="text-[10px] font-mono text-slate-500 mb-0.5">{item.label}</div>
            <div className={`text-[10px] font-mono leading-tight ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>
      <div className={`flex items-center justify-center gap-2 rounded-lg py-2 border text-xs font-mono font-bold transition-all ${
        isVerified
          ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
          : 'border-slate-800 bg-obsidian-950 text-slate-500'
      }`}>
        {isVerified ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>VERIFIED</span>
          </>
        ) : (
          <>
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>{status.toUpperCase()}</span>
          </>
        )}
      </div>
      {isVerified && (
        <div className="mt-2 text-center text-[10px] font-mono text-slate-500">
          Validated in simulation
        </div>
      )}
    </div>
  );
};

// ─── Reasoning Trace Panel ────────────────────────────────────────────────────
const ReasoningTracePanel: React.FC<{
  steps?: Array<{ label: string; detail: string }>;
  whyDecision?: string;
}> = ({ steps, whyDecision }) => {
  const [openWhy, setOpenWhy] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!steps?.length) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-obsidian-900/80 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-3.5 w-3.5 text-cyan-400" />
        <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">Decision Trace</span>
      </div>
      <div className="space-y-1.5 mb-3">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full text-left rounded-lg border border-slate-800 hover:border-slate-700 bg-obsidian-950 p-2 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0" />
              <span className="text-[11px] font-mono text-slate-200 flex-1">{step.label}</span>
              {expanded === i ? <ChevronUp className="h-3 w-3 text-slate-500" /> : <ChevronDown className="h-3 w-3 text-slate-500" />}
            </div>
            {expanded === i && (
              <p className="mt-1.5 text-[10px] text-slate-400 leading-relaxed pl-3.5">{step.detail}</p>
            )}
          </button>
        ))}
      </div>
      {whyDecision && (
        <div>
          <button
            onClick={() => setOpenWhy(!openWhy)}
            className="w-full flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
          >
            <Info className="h-3 w-3" />
            <span>Why did DAX choose this path?</span>
            {openWhy ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
          </button>
          {openWhy && (
            <p className="mt-2 text-[11px] text-slate-300 leading-relaxed p-2 rounded-lg bg-obsidian-950 border border-slate-800">
              {whyDecision}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Agent Memory Inspector ───────────────────────────────────────────────────
const AgentMemoryInspector: React.FC<{
  memory?: LabStage['memorySnapshot'];
  isReset: boolean;
}> = ({ memory, isReset }) => (
  <div className="rounded-xl border border-slate-800 bg-obsidian-900/80 p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Database className="h-3.5 w-3.5 text-blue-400" />
        <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider">Agent Memory</span>
      </div>
      {isReset && (
        <span className="text-[10px] font-mono text-amber-400/80">Memory Cleared on Reset</span>
      )}
    </div>
    {memory ? (
      <div className="space-y-2">
        <div className="rounded-lg bg-obsidian-950 border border-slate-800 p-2">
          <div className="text-[10px] font-mono text-slate-500 mb-0.5">Working Context</div>
          <div className="text-[11px] font-mono text-slate-200">{memory.workingContext}</div>
        </div>
        <div className="rounded-lg bg-obsidian-950 border border-slate-800 p-2">
          <div className="text-[10px] font-mono text-slate-500 mb-0.5">Task State</div>
          <div className="text-[11px] font-mono text-emerald-400 font-semibold">{memory.taskState}</div>
        </div>
        <div className="rounded-lg bg-obsidian-950 border border-slate-800 p-2">
          <div className="text-[10px] font-mono text-slate-500 mb-0.5">Previous Step</div>
          <div className="text-[11px] font-mono text-slate-300">{memory.previousStep}</div>
        </div>
        {memory.relevantKnowledge?.length > 0 && (
          <div className="rounded-lg bg-obsidian-950 border border-slate-800 p-2">
            <div className="text-[10px] font-mono text-slate-500 mb-1">Relevant Context</div>
            <div className="space-y-0.5">
              {memory.relevantKnowledge.slice(0, 3).map((k, i) => (
                <div key={i} className="text-[10px] font-mono text-slate-400 flex items-start gap-1">
                  <span className="text-slate-600 shrink-0">›</span>
                  <span>{k}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="text-[11px] font-mono text-slate-600 italic">No memory context loaded</div>
    )}
  </div>
);

// ─── Result Card ──────────────────────────────────────────────────────────────
const ResultCard: React.FC<{ scenario: LabScenario }> = ({ scenario }) => (
  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 shadow-lg">
    <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 mb-3">
      <CheckCircle2 className="h-4 w-4" />
      <span>DAX Agent Result</span>
    </div>
    <div className="space-y-1.5 text-[11px] font-mono">
      <div><span className="text-slate-500">Goal: </span><span className="text-slate-200">{scenario.goalStatement}</span></div>
      <div><span className="text-slate-500">Approach: </span><span className="text-slate-200">{scenario.approachStatement}</span></div>
      <div><span className="text-slate-500">Tools: </span><span className="text-cyan-300">{scenario.toolsUsedList.join(', ')}</span></div>
      <div><span className="text-slate-500">Verification: </span><span className="text-slate-200">{scenario.verificationDetails}</span></div>
      <div className="pt-1 border-t border-emerald-500/20">
        <div className="flex items-center gap-4">
          <div><span className="text-slate-500">Verification: </span><span className="text-emerald-400 font-bold">PASSED</span></div>
          <div><span className="text-slate-500">Mode: </span><span className="text-cyan-300">Simulation</span></div>
          <div><span className="text-slate-500">Data: </span><span className="text-blue-300">Local Only</span></div>
        </div>
      </div>
    </div>
    <div className="mt-3 pt-2 border-t border-emerald-500/20 text-emerald-300 text-[11px] font-mono font-semibold">
      {scenario.outcomeStatement}
    </div>
  </div>
);

// ─── Tool Modal ───────────────────────────────────────────────────────────────
const ToolModal: React.FC<{ tool: AgentToolInfo; onClose: () => void }> = ({ tool, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-sm"
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-obsidian-900 p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white">{tool.name}</h3>
          <span className="text-[11px] font-mono text-cyan-400">{tool.category}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3 text-xs font-mono">
        <div>
          <div className="text-slate-500 mb-1">Description:</div>
          <div className="text-slate-300">{tool.description}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-1">Simulated Tool Input:</div>
          <pre className="p-2.5 rounded-lg bg-obsidian-950 border border-slate-800 text-cyan-300 overflow-x-auto text-[11px] whitespace-pre-wrap">{tool.simulatedInput}</pre>
        </div>
        <div>
          <div className="text-slate-500 mb-1">Simulated Output:</div>
          <pre className="p-2.5 rounded-lg bg-obsidian-950 border border-slate-800 text-emerald-300 overflow-x-auto text-[11px] whitespace-pre-wrap">{tool.simulatedOutput}</pre>
        </div>
        <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20">
          <div className="text-emerald-400 font-semibold">{tool.verificationCheck}</div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Developer Mode Panel ─────────────────────────────────────────────────────
const DevModePanel: React.FC<{ stage: LabStage; scenario: LabScenario }> = ({ stage, scenario }) => (
  <div className="rounded-xl border border-emerald-500/30 bg-obsidian-950 p-4 text-xs font-mono space-y-2">
    <div className="text-emerald-400 font-bold flex items-center gap-1.5 mb-2">
      <Sliders className="h-3.5 w-3.5" />
      <span>Developer Mode Telemetry</span>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
      <div><span className="text-slate-500">Agent State: </span><span className="text-slate-200">{stage.status}</span></div>
      <div><span className="text-slate-500">Current Stage: </span><span className="text-cyan-300">{stage.name}</span></div>
      <div><span className="text-slate-500">Active Tool: </span><span className="text-cyan-300">{stage.activeToolId || 'Internal Router'}</span></div>
      <div><span className="text-slate-500">Verification: </span><span className="text-emerald-400">{stage.verificationStatus}</span></div>
      <div><span className="text-slate-500">Scenario: </span><span className="text-slate-300">{scenario.id}</span></div>
      <div><span className="text-slate-500">Event: </span><span className="text-slate-300">{stage.event}</span></div>
    </div>
    <div className="pt-2 border-t border-slate-800 space-y-1">
      <div><span className="text-slate-500">Simulated Input: </span><span className="text-slate-300">{stage.badge}</span></div>
      <div><span className="text-slate-500">Decision Summary: </span><span className="text-slate-300">{stage.summary}</span></div>
    </div>
    <div className="text-slate-600 text-[10px] pt-1 border-t border-slate-800">
      No chain-of-thought data • No internal secrets • No private workspace references
    </div>
  </div>
);

// ─── Scenario Icon Helper ─────────────────────────────────────────────────────
function getScenarioIcon(icon: string) {
  switch (icon) {
    case 'FileCode2': return <FileCode2 className="h-3.5 w-3.5" />;
    case 'GitPullRequest': return <GitPullRequest className="h-3.5 w-3.5" />;
    case 'Layers': return <Layers className="h-3.5 w-3.5" />;
    case 'ShieldCheck': return <ShieldCheck className="h-3.5 w-3.5" />;
    case 'Terminal': return <Terminal className="h-3.5 w-3.5" />;
    default: return <Cpu className="h-3.5 w-3.5" />;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const AgentLabStandalone: React.FC<AgentLabStandaloneProps> = ({ onNavigateHome, initialScenarioId }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(initialScenarioId || 'analyze-code');
  const [customGoalPrompt, setCustomGoalPrompt] = useState<string>('');
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [devMode, setDevMode] = useState<boolean>(false);
  const [selectedToolModal, setSelectedToolModal] = useState<AgentToolInfo | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [isReset, setIsReset] = useState<boolean>(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const currentScenario: LabScenario = LAB_SCENARIOS.find(s => s.id === selectedScenarioId) || LAB_SCENARIOS[0];
  const currentStage: LabStage = currentScenario.stages[currentStageIndex];

  // Initialize prompt on scenario change
  useEffect(() => {
    if (initialScenarioId && LAB_SCENARIOS.some(s => s.id === initialScenarioId)) {
      setSelectedScenarioId(initialScenarioId);
      const target = LAB_SCENARIOS.find(s => s.id === initialScenarioId);
      if (target) setCustomGoalPrompt(target.defaultPrompt);
      setCurrentStageIndex(0);
    } else {
      setCustomGoalPrompt(currentScenario.defaultPrompt);
    }
  }, [initialScenarioId]);

  // Auto-play simulation progression
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStageIndex(prev => {
          if (prev < currentScenario.stages.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1600);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isPlaying, currentScenario]);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStageIndex]);

  const handleScenarioChange = (id: string) => {
    setSelectedScenarioId(id);
    const sc = LAB_SCENARIOS.find(s => s.id === id);
    if (sc) setCustomGoalPrompt(sc.defaultPrompt);
    setCurrentStageIndex(0);
    setIsPlaying(false);
    setIsReset(false);
    if (window.history?.pushState) {
      window.history.pushState(null, '', `/lab?scenario=${id}`);
    }
  };

  const handleRunAgent = () => {
    setCurrentStageIndex(0);
    setIsPlaying(true);
    setIsReset(false);
  };

  const handleReset = () => {
    setCurrentStageIndex(0);
    setIsPlaying(false);
    setIsReset(true);
    setTimeout(() => setIsReset(false), 2000);
  };

  const handlePlayToggle = () => {
    if (currentStageIndex === currentScenario.stages.length - 1) {
      setCurrentStageIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (currentStageIndex < currentScenario.stages.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(prev => prev - 1);
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/lab?scenario=${selectedScenarioId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    if (currentStage.codeSnippet) {
      navigator.clipboard.writeText(currentStage.codeSnippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  const cumulativeLogs = currentScenario.stages
    .slice(0, currentStageIndex + 1)
    .flatMap(st => st.consoleLogs);

  const progressPercent = ((currentStageIndex + 1) / currentScenario.stages.length) * 100;
  const isFinished = currentStageIndex === currentScenario.stages.length - 1;

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300 font-sans">

      {/* ─── Top Header Bar ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-obsidian-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-obsidian-850 px-3 py-1.5 text-xs font-mono text-slate-300 hover:border-slate-700 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Portfolio</span>
            </button>
            <span className="text-slate-700 hidden sm:inline">/</span>
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="text-sm font-bold text-white tracking-tight">DAX Agent</span>
              <span className="text-[10px] font-mono text-slate-500 border border-slate-800 rounded px-1.5 py-0.5">SAFE CLIENT-SIDE SIMULATION</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDevMode(!devMode)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-mono transition-all ${
                devMode
                  ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                  : 'border-slate-800 bg-obsidian-900 text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Toggle Developer Mode"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dev Mode</span>
              <span className={`h-1.5 w-1.5 rounded-full ${devMode ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </button>

            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 px-3 py-1.5 text-xs font-mono font-medium text-cyan-300 hover:border-cyan-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            <a
              href="https://github.com/dax0056"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-obsidian-850 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-white transition-all"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6">

          {/* ─── Hero Title ─── */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-[11px] font-mono text-cyan-300">
                <Zap className="h-3 w-3 text-cyan-400 animate-pulse" />
                <span>SIMULATION MODE</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-obsidian-900 px-3 py-1 text-[11px] font-mono text-slate-400">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span>SAFE CLIENT-SIDE DEMO</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">DAX Agent</h1>
            <p className="text-sm text-slate-400 font-mono">Plan. Act. Verify.</p>
            <p className="text-xs text-slate-500 mt-1">
              A local-first AI agent experience. No API keys. No remote execution. No data leaves your browser.
            </p>
          </div>

          {/* ─── Goal Input Bar ─── */}
          <div className="rounded-2xl border border-slate-800 bg-obsidian-900/90 shadow-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <label htmlFor="goal-input" className="text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="h-3 w-3" />
                <span>What should DAX Agent do?</span>
              </label>
              <span className="text-[10px] font-mono text-slate-600 hidden sm:inline">
                Pure client-side simulation • No API calls
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <input
                id="goal-input"
                type="text"
                value={customGoalPrompt}
                onChange={e => setCustomGoalPrompt(e.target.value)}
                placeholder="e.g. Analyze this Python function and identify possible issues."
                className="flex-1 rounded-xl border border-slate-700 bg-obsidian-950 px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                aria-label="Goal input for DAX Agent"
              />
              <button
                onClick={handleRunAgent}
                disabled={isPlaying}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-70 px-6 py-2.5 text-sm font-bold text-obsidian-950 transition-all shadow-lg shadow-cyan-950/50 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 shrink-0"
              >
                <Send className="h-4 w-4" />
                <span>{isPlaying ? 'Running…' : 'Run DAX Agent'}</span>
              </button>
            </div>

            {/* Scenario Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1" role="tablist">
              <span className="text-[10px] font-mono text-slate-600 shrink-0">Scenarios:</span>
              {LAB_SCENARIOS.map(sc => (
                <button
                  key={sc.id}
                  role="tab"
                  aria-selected={sc.id === selectedScenarioId}
                  onClick={() => handleScenarioChange(sc.id)}
                  className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all shrink-0 ${
                    sc.id === selectedScenarioId
                      ? 'border-cyan-500/60 bg-cyan-950/50 text-cyan-300 font-semibold'
                      : 'border-slate-800 bg-obsidian-950 text-slate-500 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {getScenarioIcon(sc.icon)}
                  <span>{sc.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Control Room Layout ─── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-6">

            {/* ── Left Sidebar ── */}
            <div className="xl:col-span-3 flex flex-col gap-4">
              <SecurityBoundaryPanel />
              <AgentMemoryInspector memory={currentStage.memorySnapshot} isReset={isReset} />
              <AgentTraceTimeline
                stages={currentScenario.stages}
                currentIndex={currentStageIndex}
                onStageClick={i => { setCurrentStageIndex(i); setIsPlaying(false); }}
                onReplay={() => { setCurrentStageIndex(0); setIsPlaying(true); }}
                isFinished={isFinished}
              />
            </div>

            {/* ── Center: Pipeline + Stage ── */}
            <div className="xl:col-span-6 flex flex-col gap-4">

              {/* Pipeline + Controls */}
              <div className="rounded-2xl border border-slate-800 bg-obsidian-900/90 shadow-xl overflow-hidden backdrop-blur-sm">
                {/* Controls bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-obsidian-850">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-semibold text-white">
                      <span className="text-cyan-400">{currentScenario.title}</span>
                      <span className="text-slate-500 text-[11px] ml-2">Stage {currentStageIndex + 1}/7</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={handlePrev} disabled={currentStageIndex === 0}
                      className="p-1.5 rounded-lg border border-slate-700 bg-obsidian-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 text-xs"
                      aria-label="Previous stage">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={handlePlayToggle}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                        isPlaying ? 'bg-amber-500 text-obsidian-950 hover:bg-amber-400' : 'bg-cyan-500 text-obsidian-950 hover:bg-cyan-400'
                      }`}>
                      <Play className={`h-3.5 w-3.5 ${isPlaying ? 'fill-obsidian-950' : ''}`} />
                      <span>{isPlaying ? 'Pause' : isFinished ? 'Replay' : 'Continue'}</span>
                    </button>
                    <button onClick={handleNext} disabled={isFinished}
                      className="p-1.5 rounded-lg border border-slate-700 bg-obsidian-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 text-xs"
                      aria-label="Next stage">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button onClick={handleReset}
                      className="p-1.5 rounded-lg border border-slate-800 bg-obsidian-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      aria-label="Reset simulation">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 h-0.5">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* 7-Stage Pipeline Bar */}
                <div className="px-4 py-4 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
                  <div className="flex items-center justify-between min-w-[600px] gap-1">
                    {currentScenario.stages.map((stage, idx) => {
                      const isCurrent = idx === currentStageIndex;
                      const isPassed = idx < currentStageIndex;
                      return (
                        <React.Fragment key={stage.id}>
                          <button
                            onClick={() => { setCurrentStageIndex(idx); setIsPlaying(false); }}
                            className={`flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded ${
                              isCurrent ? 'scale-105 transition-transform' : 'opacity-70 hover:opacity-100'
                            }`}
                            aria-label={`Go to stage ${stage.name}`}
                          >
                            <div className={`flex items-center justify-center h-9 w-9 rounded-full border text-[11px] font-mono font-bold transition-all ${
                              isCurrent
                                ? 'border-cyan-400 bg-cyan-950 text-cyan-300 ring-4 ring-cyan-500/20'
                                : isPassed
                                  ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400'
                                  : 'border-slate-800 bg-obsidian-850 text-slate-500'
                            }`}>
                              {isPassed ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                            </div>
                            <span className={`text-[10px] font-mono mt-1 font-semibold text-center ${
                              isCurrent ? 'text-cyan-300' : isPassed ? 'text-emerald-400' : 'text-slate-500'
                            }`}>{stage.name}</span>
                            <span className="text-[9px] font-mono text-slate-600">{stage.duration}</span>
                          </button>
                          {idx < currentScenario.stages.length - 1 && (
                            <div className="flex-1 h-0.5 relative mx-0.5">
                              <div className="h-full bg-slate-800 w-full rounded-full" />
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 absolute top-0 left-0 transition-all duration-400 rounded-full"
                                style={{ width: isPassed ? '100%' : isCurrent ? '50%' : '0%' }}
                              />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Stage Detail */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      {currentStage.badge}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      STATUS: {currentStage.status}
                    </span>
                    {currentStage.activeToolId && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/40 text-blue-400 border border-blue-500/30">
                        Tool: {AVAILABLE_TOOLS.find(t => t.id === currentStage.activeToolId)?.name || currentStage.activeToolId}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{currentStage.name}</h2>
                  <p className="text-sm font-semibold text-cyan-300/90 mb-2">{currentStage.summary}</p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{currentStage.detail}</p>

                  {/* Code Diff Viewer (only for modify-code tools stage) */}
                  {currentStage.diffLines && currentStage.diffLines.length > 0 && (
                    <div className="mb-4">
                      <CodeDiffViewer diffLines={currentStage.diffLines} />
                    </div>
                  )}

                  {/* Reasoning Trace */}
                  {currentStage.reasoningTrace && currentStage.reasoningTrace.length > 0 && (
                    <div className="mb-4">
                      <ReasoningTracePanel
                        steps={currentStage.reasoningTrace}
                        whyDecision={currentStage.whyDecision}
                      />
                    </div>
                  )}

                  {/* Result Card when finished */}
                  {isFinished && (
                    <div className="mb-4">
                      <ResultCard scenario={currentScenario} />
                    </div>
                  )}

                  {/* Project link */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{currentStage.verificationStatus.toUpperCase()}</span>
                    </div>
                    <a
                      href={currentScenario.associatedProject.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <span>{currentScenario.associatedProject.name} ({currentScenario.associatedProject.testCount})</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  </div>

                  {/* Developer Mode Panel */}
                  {devMode && (
                    <div className="mt-4">
                      <DevModePanel stage={currentStage} scenario={currentScenario} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right Column: Console + Payload + Verification ── */}
            <div className="xl:col-span-3 flex flex-col gap-4">

              {/* Live Agent Console */}
              <div className="rounded-2xl border border-slate-800 bg-obsidian-900/90 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-obsidian-850">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1 ml-1">
                      <Terminal className="h-3 w-3 text-cyan-400" />
                      <span className="font-semibold">AGENT CONSOLE</span>
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">[SIMULATION]</span>
                </div>

                <div className="h-40 overflow-y-auto p-2.5 font-mono text-[10px] space-y-1.5 bg-obsidian-950 scrollbar-thin">
                  {cumulativeLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-1.5 leading-tight">
                      <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                      <span className={`px-1 rounded text-[9px] font-bold shrink-0 ${
                        log.level === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' :
                        log.level === 'SECURITY' ? 'bg-blue-950 text-blue-400' :
                        log.level === 'TRACE' ? 'bg-slate-800 text-slate-400' :
                        'bg-cyan-950 text-cyan-400'
                      }`}>{log.event}</span>
                      <span className="text-slate-300 break-all">{log.message}</span>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>
              </div>

              {/* Stage Payload Viewer */}
              <div className="rounded-2xl border border-slate-800 bg-obsidian-900/90 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-obsidian-850">
                  <span className="text-[10px] font-mono text-slate-500">
                    <Code2 className="h-3 w-3 inline mr-1 text-slate-400" />
                    {currentStage.id}.payload
                  </span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-slate-400 hover:text-white text-[10px] font-mono hover:bg-slate-800 transition-colors"
                    aria-label="Copy stage payload"
                  >
                    {copiedSnippet ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-slate-200 bg-obsidian-950 scrollbar-thin">
                  <pre className="whitespace-pre-wrap">{currentStage.codeSnippet}</pre>
                </div>
              </div>

              {/* Verification Center */}
              <VerificationCenter
                checks={currentStage.verificationChecks}
                status={currentStage.status}
              />
            </div>

          </div>{/* End control room grid */}

          {/* ─── Tools Catalog ─── */}
          <div className="mb-12">
            <div className="text-center mb-5">
              <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <Wrench className="h-5 w-5 text-cyan-400" />
                <span>Available Tools</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Deterministic tools callable by DAX Agent during simulation. Click any tool to inspect.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {AVAILABLE_TOOLS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedToolModal(tool)}
                  className="p-3.5 rounded-xl border border-slate-800 bg-obsidian-900/80 hover:border-cyan-500/50 hover:bg-obsidian-850 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  aria-label={`Inspect ${tool.name} tool`}
                >
                  <div className="text-[11px] font-mono font-bold text-cyan-400 mb-0.5 group-hover:text-cyan-300">{tool.name}</div>
                  <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-2">{tool.category}</div>
                  <div className="text-[10px] text-slate-400 leading-snug line-clamp-2">{tool.description}</div>
                  <div className="mt-2 flex items-center gap-1 text-[9px] font-mono text-slate-600 group-hover:text-cyan-400/70">
                    <Eye className="h-2.5 w-2.5" />
                    <span>Inspect Tool</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Project Integration ─── */}
          <div className="mb-10">
            <div className="text-center mb-5">
              <h2 className="text-xl font-bold text-white">How DAX Agent Works</h2>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Open-source reference implementations powering the architecture.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  num: '1.',
                  label: 'Intelligence',
                  project: 'Nexus Agent',
                  url: 'https://github.com/dax0056/nexus-agent',
                  tests: '7 / 7 Tests Passing',
                  desc: 'Task planning, episodic memory buffers, and multi-backend routing across Ollama, vLLM, and offline mock engines.',
                  color: 'cyan',
                  icon: <Cpu className="h-5 w-5" />
                },
                {
                  num: '2.',
                  label: 'Tools',
                  project: 'Micro Coding Agent',
                  url: 'https://github.com/dax0056/micro-coding-agent',
                  tests: '12 / 12 Tests Passing',
                  desc: 'Controlled in-memory unified diffs, approval gate hooks, and AST syntax validation to prevent code regressions.',
                  color: 'blue',
                  icon: <Layers className="h-5 w-5" />
                },
                {
                  num: '3.',
                  label: 'Verification',
                  project: 'Desktop Action Agent',
                  url: 'https://github.com/dax0056/desktop-action-agent',
                  tests: '10 / 10 Tests Passing',
                  desc: 'Strict workspace containment, process allowlists, dangerous pattern filters, and SHA-256 cryptographic audit logs.',
                  color: 'emerald',
                  icon: <ShieldCheck className="h-5 w-5" />
                }
              ].map(item => (
                <div
                  key={item.label}
                  className={`rounded-xl border border-slate-800 bg-obsidian-900/70 p-5 hover:border-${item.color}-500/40 transition-all flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-${item.color}-950/60 border border-${item.color}-500/30 text-${item.color}-400`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{item.num} {item.label}</div>
                        <div className={`text-[11px] font-mono text-${item.color}-400`}>{item.project} ({item.tests})</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-[11px] font-mono text-${item.color}-400 hover:text-${item.color}-300 font-semibold`}
                  >
                    <span>View Repository</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-800 bg-obsidian-900 py-5 text-center text-[11px] text-slate-600 font-mono">
        <div>DAX Agent • Client-Side Deterministic Simulation • No data leaves your browser • All rights reserved 2026</div>
        <div className="mt-1 text-slate-700">Zero eval · Zero exec · Zero subprocess · Zero remote API calls</div>
      </footer>

      {/* ─── Tool Modal ─── */}
      {selectedToolModal && (
        <ToolModal tool={selectedToolModal} onClose={() => setSelectedToolModal(null)} />
      )}

    </div>
  );
};
