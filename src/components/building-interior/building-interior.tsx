'use client';

import { useGastownStore, useSelectedProject, useProjectAgents, useProjectBeads } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  GitBranch,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  FileText,
  Activity,
  MessageSquare,
  ExternalLink,
  Pause,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent, Bead } from '@/types/gastown';

const statusColors = {
  idle: 'bg-slate-500',
  working: 'bg-emerald-500',
  blocked: 'bg-amber-500',
  error: 'bg-red-500',
  in_progress: 'bg-emerald-500',
  pending: 'bg-slate-400',
  completed: 'bg-emerald-600',
};

const agentStatusIcons = {
  idle: Pause,
  working: Zap,
  blocked: AlertCircle,
  error: XCircle,
};

const beadStatusIcons = {
  pending: Clock,
  in_progress: Zap,
  completed: CheckCircle2,
  blocked: AlertCircle,
};

function AgentSprite({ agent }: { agent: Agent }) {
  const StatusIcon = agentStatusIcons[agent.status] || Pause;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative p-3 rounded-lg border-2 transition-all cursor-pointer',
        'hover:shadow-lg',
        agent.status === 'working' && 'border-emerald-500/50 bg-emerald-950/30',
        agent.status === 'blocked' && 'border-amber-500/50 bg-amber-950/30',
        agent.status === 'error' && 'border-red-500/50 bg-red-950/30',
        agent.status === 'idle' && 'border-slate-600/50 bg-slate-900/30'
      )}
    >
      {/* Agent Avatar */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            statusColors[agent.status]
          )}
        >
          <StatusIcon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{agent.name}</div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              {agent.type}
            </Badge>
            <span className="text-[10px] text-muted-foreground capitalize">
              {agent.status}
            </span>
          </div>
        </div>
      </div>

      {/* Status Reason */}
      {agent.statusReason && (
        <p className="text-xs text-muted-foreground mt-2 truncate">
          {agent.statusReason}
        </p>
      )}

      {/* Activity Indicator */}
      {agent.status === 'working' && (
        <motion.div
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

function BeadCard({ bead }: { bead: Bead }) {
  const StatusIcon = beadStatusIcons[bead.status] || Clock;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'p-3 rounded-lg border transition-all',
        bead.status === 'in_progress' && 'border-emerald-500/50 bg-emerald-950/20',
        bead.status === 'blocked' && 'border-amber-500/50 bg-amber-950/20',
        bead.status === 'completed' && 'border-slate-600/50 bg-slate-900/20',
        bead.status === 'pending' && 'border-slate-700/50 bg-slate-900/10'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-8 h-8 rounded flex items-center justify-center shrink-0',
            statusColors[bead.status]
          )}
        >
          <StatusIcon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{bead.title}</div>
          {bead.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {bead.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-[10px] h-4 px-1 capitalize">
              {bead.status.replace('_', ' ')}
            </Badge>
            {bead.priority > 0 && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                P{bead.priority}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {bead.statusReason && (
        <p className="text-xs text-amber-400 mt-2 pl-11">
          ⚠ {bead.statusReason}
        </p>
      )}
    </motion.div>
  );
}

function RoomCard({ name, branchName, status, headSha }: { name: string; branchName: string; status: string; headSha?: string | null }) {
  return (
    <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-900/30">
      <div className="flex items-center gap-2">
        <div className={cn(
          'w-3 h-3 rounded',
          status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'
        )} />
        <div className="font-medium text-sm">{name}</div>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <GitBranch className="h-3 w-3" />
        <code className="text-[10px] bg-slate-800 px-1 rounded">{branchName}</code>
      </div>
      {headSha && (
        <div className="text-[10px] text-muted-foreground mt-1 font-mono">
          {headSha.slice(0, 7)}
        </div>
      )}
    </div>
  );
}

export function BuildingInterior() {
  const { selectProject, setView, worktrees, selectAgent, beads, agents, artifacts, events } = useGastownStore();
  const project = useSelectedProject();
  const projectAgents = agents.filter(a => a.projectId === project?.id);
  const projectBeads = beads.filter(b => b.projectId === project?.id);
  const projectWorktrees = worktrees.filter(w => w.projectId === project?.id);
  const projectArtifacts = artifacts.filter(a => projectBeads.some(b => b.id === a.beadId));
  const projectEvents = events.filter(e => e.entityId === project?.id || e.payload?.projectId === project?.id).slice(0, 10);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Building Selected</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select a project from the Town Map to view its interior
          </p>
          <Button className="mt-4" onClick={() => setView('town_map')}>
            Back to Town Map
          </Button>
        </div>
      </div>
    );
  }

  const completedBeads = projectBeads.filter(b => b.status === 'completed').length;
  const totalBeads = projectBeads.length;
  const progress = totalBeads > 0 ? (completedBeads / totalBeads) * 100 : 0;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectProject(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Town Map
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">{project.name}</h1>
              <Badge
                variant="outline"
                className={cn(
                  'capitalize',
                  project.status === 'working' && 'border-emerald-500 text-emerald-500',
                  project.status === 'blocked' && 'border-amber-500 text-amber-500',
                  project.status === 'error' && 'border-red-500 text-red-500',
                  project.status === 'awaiting_approval' && 'border-violet-500 text-violet-500'
                )}
              >
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {project.repoProvider || 'Repo'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{project.repoId || 'View repository'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completedBeads}/{totalBeads} beads completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Agents & Rooms */}
          <div className="space-y-6">
            {/* Agents Section */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary" />
                  Agents ({projectAgents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projectAgents.length > 0 ? (
                  projectAgents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => selectAgent(agent.id)}
                      className="cursor-pointer"
                    >
                      <AgentSprite agent={agent} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No active agents</p>
                )}
              </CardContent>
            </Card>

            {/* Rooms Section */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitBranch className="h-4 w-4 text-primary" />
                  Rooms (Worktrees)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {projectWorktrees.length > 0 ? (
                  projectWorktrees.map((wt) => (
                    <RoomCard
                      key={wt.id}
                      name={wt.name}
                      branchName={wt.branchName}
                      status={wt.status}
                      headSha={wt.headSha}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No active worktrees</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Quest Log (Beads) */}
          <div>
            <Card className="bg-slate-900/50 border-slate-800 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" />
                  Quest Log (Tasks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {projectBeads.length > 0 ? (
                      projectBeads
                        .sort((a, b) => {
                          const order = { in_progress: 0, blocked: 1, pending: 2, completed: 3 };
                          return order[a.status] - order[b.status];
                        })
                        .map((bead) => <BeadCard key={bead.id} bead={bead} />)
                    ) : (
                      <p className="text-sm text-muted-foreground">No active tasks</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Artifacts & Events */}
          <div>
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="events" className="text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="artifacts" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Artifacts
                </TabsTrigger>
              </TabsList>
              <TabsContent value="events" className="mt-4">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="pt-4">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {projectEvents.length > 0 ? (
                          projectEvents.map((event) => (
                            <div
                              key={event.id}
                              className="p-2 rounded bg-slate-800/50 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] h-4 px-1">
                                  {event.eventType.split('.')[0]}
                                </Badge>
                                <span className="text-muted-foreground">
                                  {event.eventType.split('.')[1]}
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1">
                                {new Date(event.occurredAt).toLocaleTimeString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No recent events</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="artifacts" className="mt-4">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="pt-4">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {projectArtifacts.length > 0 ? (
                          projectArtifacts.map((artifact) => (
                            <div
                              key={artifact.id}
                              className="p-3 rounded bg-slate-800/50 hover:bg-slate-800/70 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium truncate">
                                  {artifact.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                  {artifact.type}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(artifact.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No artifacts yet</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
