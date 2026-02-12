'use client';

import { useGastownStore, useSelectedAgent } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Swords,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  MessageSquare,
  Send,
  FileText,
  Activity,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockToolCalls, mockTerminalOptions, mockBeads } from '@/lib/mock-data';
import type { TerminalOption, ToolCall, Bead } from '@/types/gastown';
import { useState } from 'react';

const statusColors = {
  idle: 'bg-slate-500',
  working: 'bg-emerald-500',
  blocked: 'bg-amber-500',
  error: 'bg-red-500',
};

const toolStatusIcons = {
  pending: Clock,
  running: Zap,
  completed: CheckCircle2,
  failed: XCircle,
};

function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const StatusIcon = toolStatusIcons[toolCall.status] || Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-3 rounded-lg border transition-all',
        toolCall.status === 'running' && 'border-primary/50 bg-primary/5',
        toolCall.status === 'completed' && 'border-emerald-500/50 bg-emerald-950/20',
        toolCall.status === 'failed' && 'border-red-500/50 bg-red-950/20',
        toolCall.status === 'pending' && 'border-slate-700/50 bg-slate-900/30'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-6 h-6 rounded flex items-center justify-center',
              toolCall.status === 'running' && 'bg-primary animate-pulse',
              toolCall.status === 'completed' && 'bg-emerald-500',
              toolCall.status === 'failed' && 'bg-red-500',
              toolCall.status === 'pending' && 'bg-slate-600'
            )}
          >
            <StatusIcon className="h-3 w-3 text-white" />
          </div>
          <code className="text-sm font-mono">{toolCall.name}</code>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {new Date(toolCall.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Inputs */}
      <div className="bg-slate-900/50 rounded p-2 mb-2">
        <div className="text-[10px] text-muted-foreground mb-1">Inputs:</div>
        <pre className="text-xs text-slate-300 overflow-x-auto">
          {JSON.stringify(toolCall.inputs, null, 2)}
        </pre>
      </div>

      {/* Outputs */}
      {toolCall.outputs && (
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-[10px] text-muted-foreground mb-1">Outputs:</div>
          <pre className="text-xs text-emerald-300 overflow-x-auto">
            {JSON.stringify(toolCall.outputs, null, 2)}
          </pre>
        </div>
      )}

      {/* Correlation ID */}
      <div className="mt-2 text-[10px] text-muted-foreground font-mono">
        corr: {toolCall.correlationId}
      </div>
    </motion.div>
  );
}

function OptionButton({ option, disabled }: { option: TerminalOption; disabled?: boolean }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={option.type === 'mutation' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'justify-start text-xs h-8',
              option.type === 'mutation' && 'bg-primary hover:bg-primary/90',
              option.type === 'inspection' && 'text-slate-300'
            )}
            disabled={disabled}
          >
            {option.type === 'mutation' ? (
              <Play className="h-3 w-3 mr-2" />
            ) : (
              <FileText className="h-3 w-3 mr-2" />
            )}
            {option.label}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="text-xs">
            <div className="font-medium">{option.label}</div>
            <div className="text-muted-foreground">{option.type} action</div>
            {option.prerequisite && (
              <div className="text-amber-400 mt-1">Requires: {option.prerequisite}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function MeterCard({ label, value, max = 100, color = 'primary' }: { label: string; value: number; max?: number; color?: string }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="p-3 rounded-lg bg-slate-800/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

export function BattleTerminal() {
  const { selectAgent, selectedAgentId, agents, beads, setView, userRole } = useGastownStore();
  const agent = agents.find(a => a.id === selectedAgentId);
  const agentBeads = beads.filter(b => b.agentId === selectedAgentId);
  const currentBead = agentBeads.find(b => b.status === 'in_progress') || agentBeads[0];

  const [inputValue, setInputValue] = useState('');

  // Mock data for tool calls
  const toolCalls = mockToolCalls;
  const options = mockTerminalOptions;

  // Mock meters
  const meters = {
    progress: 65,
    tests: 92,
    risk: 15,
    confidence: 85,
    tokens: 12500,
    cost: 2.35,
  };

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-slate-950">
        <div className="text-center">
          <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Agent Selected</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select an agent from a Building Interior to interact
          </p>
          <Button className="mt-4" onClick={() => setView('town_map')}>
            Back to Town Map
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = agent.status === 'working' ? Zap : agent.status === 'blocked' ? AlertCircle : agent.status === 'error' ? XCircle : Pause;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectAgent(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Building
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Swords className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">{agent.name}</h1>
              <Badge
                variant="outline"
                className={cn(
                  'capitalize',
                  agent.status === 'working' && 'border-emerald-500 text-emerald-500',
                  agent.status === 'blocked' && 'border-amber-500 text-amber-500',
                  agent.status === 'error' && 'border-red-500 text-red-500'
                )}
              >
                {agent.status}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {agent.type}
              </Badge>
            </div>
            {agent.statusReason && (
              <p className="text-sm text-muted-foreground mt-1">{agent.statusReason}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 divide-x divide-slate-800">
        {/* Left Panel - Arena & Input */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Arena - Current Bead */}
          <div className="flex-1 p-6">
            <Card className="bg-slate-900/50 border-slate-800 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" />
                  Current Quest
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentBead ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <h3 className="font-medium text-lg mb-2">{currentBead.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentBead.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize',
                            currentBead.status === 'in_progress' && 'border-emerald-500 text-emerald-500',
                            currentBead.status === 'blocked' && 'border-amber-500 text-amber-500',
                            currentBead.status === 'pending' && 'border-slate-500'
                          )}
                        >
                          {currentBead.status.replace('_', ' ')}
                        </Badge>
                        {currentBead.priority > 0 && (
                          <Badge variant="secondary">Priority {currentBead.priority}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Meters */}
                    <div className="grid grid-cols-3 gap-3">
                      <MeterCard label="Progress" value={meters.progress} color="primary" />
                      <MeterCard label="Tests" value={meters.tests} color="emerald" />
                      <MeterCard label="Confidence" value={meters.confidence} color="violet" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                        <div className="text-2xl font-bold text-primary">{meters.tokens.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Tokens Used</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                        <div className="text-2xl font-bold text-emerald-500">${meters.cost.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Estimated Cost</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">No active quest</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-800 p-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter command or message... (Ctrl+Enter to send)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="min-h-[60px] bg-slate-900/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    // Handle send
                    setInputValue('');
                  }
                }}
              />
              <Button className="self-end" disabled={userRole === 'viewer'}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ctrl+Enter to send • Commands available based on role
            </p>
          </div>
        </div>

        {/* Right Panel - Options & Tool Calls */}
        <div className="flex flex-col bg-slate-900/30">
          {/* Options */}
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Actions
            </h3>
            <div className="space-y-2">
              {/* Inspection Options */}
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase">Inspection</div>
                {options.filter(o => o.type === 'inspection').map(option => (
                  <OptionButton key={option.id} option={option} />
                ))}
              </div>

              {/* Mutation Options */}
              <div className="space-y-1 mt-3">
                <div className="text-[10px] text-muted-foreground uppercase">Commands</div>
                {options.filter(o => o.type === 'mutation').map(option => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    disabled={userRole === 'viewer' || (option.prerequisite === 'all_checks_passed' && meters.tests < 100)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Proof River - Tool Calls */}
          <div className="flex-1 p-4 overflow-hidden">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Proof River
            </h3>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                <AnimatePresence>
                  {toolCalls.map((tc) => (
                    <ToolCallCard key={tc.id} toolCall={tc} />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
