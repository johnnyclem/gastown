'use client';

import { useGastownStore, useProjectAgents } from '@/lib/store';
import { getProjectStatusColor, getStatusGlow } from '@/lib/mock-data';
import type { Project } from '@/types/gastown';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Building2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Zap,
} from 'lucide-react';

interface BuildingTileProps {
  project: Project;
  index: number;
}

const statusIcons = {
  idle: Pause,
  working: Zap,
  blocked: AlertCircle,
  error: XCircle,
  awaiting_approval: Clock,
};

const statusLabels = {
  idle: 'Idle',
  working: 'Working',
  blocked: 'Blocked',
  error: 'Error',
  awaiting_approval: 'Awaiting Approval',
};

export function BuildingTile({ project, index }: BuildingTileProps) {
  const { selectProject, agents } = useGastownStore();
  const projectAgents = agents.filter((a) => a.projectId === project.id);
  const StatusIcon = statusIcons[project.status];

  const lanternColor = getProjectStatusColor(project.status);
  const glowClass = getStatusGlow(project.status);

  // Calculate building position for isometric-like layout
  const row = Math.floor(index / 4);
  const col = index % 4;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={cn(
                'cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg',
                'border-2',
                project.status === 'error' && 'border-red-500/50',
                project.status === 'blocked' && 'border-amber-500/50',
                project.status === 'working' && 'border-emerald-500/50',
                project.status === 'awaiting_approval' && 'border-violet-500/50'
              )}
              onClick={() => selectProject(project.id)}
            >
              <CardContent className="p-4">
                {/* Building Visual */}
                <div className="relative mb-3">
                  {/* Building Structure */}
                  <div className="relative mx-auto w-16 h-20">
                    {/* Base */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-slate-700 to-slate-600 rounded-b-sm" />

                    {/* Building Body */}
                    <div
                      className={cn(
                        'absolute bottom-2 left-1 right-1 h-14 rounded-t-sm',
                        'bg-gradient-to-b from-slate-500 to-slate-600',
                        'shadow-lg',
                        glowClass
                      )}
                      style={{
                        boxShadow: project.status !== 'idle'
                          ? `0 0 20px ${project.status === 'error' ? 'rgba(239, 68, 68, 0.5)' : project.status === 'blocked' ? 'rgba(245, 158, 11, 0.5)' : project.status === 'working' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(139, 92, 246, 0.5)'}`
                          : undefined
                      }}
                    />

                    {/* Windows */}
                    <div className="absolute bottom-4 left-2 right-2 grid grid-cols-3 gap-0.5">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1.5 rounded-sm',
                            Math.random() > 0.3
                              ? project.status === 'working'
                                ? 'bg-yellow-300/80'
                                : 'bg-yellow-200/40'
                              : 'bg-slate-700/50'
                          )}
                        />
                      ))}
                    </div>

                    {/* Lantern / Status Light */}
                    <div
                      className={cn(
                        'absolute -top-1 left-1/2 -translate-x-1/2',
                        'w-3 h-3 rounded-full',
                        lanternColor,
                        project.status !== 'idle' && 'animate-pulse',
                        'ring-2 ring-white/20'
                      )}
                    />

                    {/* Roof */}
                    <div className="absolute bottom-16 left-0 right-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-slate-700" />
                  </div>

                  {/* Activity Indicator */}
                  {project.status === 'working' && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-2 h-2 bg-emerald-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Project Name */}
                <div className="text-center">
                  <h3 className="font-medium text-xs truncate">{project.name}</h3>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <StatusIcon
                      className={cn(
                        'h-3 w-3',
                        project.status === 'error' && 'text-red-500',
                        project.status === 'blocked' && 'text-amber-500',
                        project.status === 'working' && 'text-emerald-500',
                        project.status === 'awaiting_approval' && 'text-violet-500'
                      )}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {statusLabels[project.status]}
                    </span>
                  </div>

                  {/* Agent Count */}
                  {projectAgents.length > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div className="flex -space-x-1">
                        {projectAgents.slice(0, 3).map((agent, i) => (
                          <div
                            key={agent.id}
                            className={cn(
                              'w-4 h-4 rounded-full border border-background',
                              agent.status === 'working' ? 'bg-emerald-500' :
                              agent.status === 'blocked' ? 'bg-amber-500' :
                              agent.status === 'error' ? 'bg-red-500' : 'bg-slate-400'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {projectAgents.length} agent{projectAgents.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-medium">{project.name}</div>
              <div className="text-xs text-muted-foreground">
                {project.description || 'No description'}
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Status: </span>
                <span className={cn(
                  'font-medium',
                  project.status === 'error' && 'text-red-500',
                  project.status === 'blocked' && 'text-amber-500',
                  project.status === 'working' && 'text-emerald-500'
                )}>
                  {statusLabels[project.status]}
                </span>
              </div>
              {project.statusReason && (
                <div className="text-xs text-muted-foreground">
                  {project.statusReason}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                ID: {project.id}
              </div>
              <div className="text-xs text-muted-foreground border-t pt-2">
                Click to enter building →
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}
