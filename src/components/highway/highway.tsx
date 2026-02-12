'use client';

import { useGastownStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import {
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  GitBranch,
  GitPullRequest,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockHighwayLanes } from '@/lib/mock-data';
import type { HighwayLane, Truck as TruckType, Gate } from '@/types/gastown';

const laneStatusColors = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
};

const gateStatusColors = {
  green: 'bg-emerald-500 border-emerald-400',
  yellow: 'bg-amber-500 border-amber-400',
  red: 'bg-red-500 border-red-400',
};

function TruckVisual({ truck, position }: { truck: TruckType; position: number }) {
  return (
    <motion.div
      className="absolute bottom-0 transition-all duration-1000"
      style={{ left: `${position}%` }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className={cn(
                'w-8 h-6 rounded flex items-center justify-center',
                truck.status === 'moving' && 'bg-emerald-600',
                truck.status === 'waiting' && 'bg-amber-600',
                truck.status === 'blocked' && 'bg-red-600'
              )}
            >
              <Truck className="h-4 w-4 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="text-xs space-y-1">
              <div className="font-medium">#{truck.prNumber}</div>
              <div className="text-muted-foreground truncate max-w-[200px]">
                {truck.title}
              </div>
              <div className="text-muted-foreground">
                Driver: {truck.driver}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}

function GateVisual({ gate, index }: { gate: Gate; index: number }) {
  return (
    <div
      className="relative flex flex-col items-center"
      style={{ left: `${(index + 1) * 25}%` }}
    >
      {/* Toll booth structure */}
      <div className="relative">
        <div
          className={cn(
            'w-12 h-16 rounded-t-lg border-2 flex flex-col items-center justify-center',
            gateStatusColors[gate.status]
          )}
        >
          {/* Gate light */}
          <div
            className={cn(
              'w-4 h-4 rounded-full mb-1',
              gate.status === 'green' && 'bg-white animate-pulse',
              gate.status === 'yellow' && 'bg-yellow-200',
              gate.status === 'red' && 'bg-red-200'
            )}
          />
          {/* Gate name */}
          <span className="text-[8px] text-white font-medium text-center leading-tight">
            {gate.name.split(' ')[0]}
          </span>
        </div>

        {/* Barrier arm */}
        <div
          className={cn(
            'absolute -left-6 top-12 w-24 h-1 rounded',
            gate.status === 'green' ? 'bg-emerald-400 rotate-45' : 'bg-slate-600'
          )}
        />
      </div>

      {/* Gate label */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="mt-2 text-center">
              <div className="text-[10px] font-medium text-white">{gate.name}</div>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] h-4 px-1 mt-1',
                  gate.status === 'green' && 'border-emerald-500 text-emerald-500',
                  gate.status === 'yellow' && 'border-amber-500 text-amber-500',
                  gate.status === 'red' && 'border-red-500 text-red-500'
                )}
              >
                {gate.status}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <div className="font-medium">{gate.name}</div>
              <div className="text-muted-foreground">{gate.reasonCode}</div>
              {gate.checkRuns.length > 0 && (
                <div className="mt-2">
                  {gate.checkRuns.map((cr) => (
                    <div key={cr.id} className="flex items-center gap-1">
                      {cr.conclusion === 'success' ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>{cr.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function LaneCard({ lane }: { lane: HighwayLane }) {
  return (
    <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitPullRequest className="h-4 w-4 text-primary" />
            {lane.projectName}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              'capitalize',
              lane.status === 'green' && 'border-emerald-500 text-emerald-500',
              lane.status === 'yellow' && 'border-amber-500 text-amber-500',
              lane.status === 'red' && 'border-red-500 text-red-500'
            )}
          >
            {lane.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Highway visual */}
        <div className="relative h-20 bg-slate-800/50 rounded-lg overflow-hidden">
          {/* Road */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-700 to-slate-600">
            {/* Lane markings */}
            <div className="absolute inset-0 flex items-center">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-0.5 bg-yellow-400/50 mx-2"
                />
              ))}
            </div>
          </div>

          {/* Gates */}
          <div className="absolute inset-0 flex items-end justify-between px-4">
            {lane.gates.map((gate, i) => (
              <GateVisual key={gate.id} gate={gate} index={i} />
            ))}
          </div>

          {/* Trucks */}
          {lane.trucks.map((truck) => (
            <TruckVisual
              key={truck.id}
              truck={truck}
              position={truck.position}
            />
          ))}
        </div>

        {/* Queue Info */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Truck className="h-3 w-3" />
            <span>{lane.trucks.length} truck{lane.trucks.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Queue position: {lane.queuePosition}</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            Details <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function Highway() {
  const { setView } = useGastownStore();
  const lanes = mockHighwayLanes;

  // Calculate overall stats
  const totalLanes = lanes.length;
  const greenLanes = lanes.filter(l => l.status === 'green').length;
  const redLanes = lanes.filter(l => l.status === 'red').length;
  const totalTrucks = lanes.reduce((sum, l) => sum + l.trucks.length, 0);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Highway / Merge Traffic</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time view of merge queues and CI gates
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-muted-foreground">
              {greenLanes}/{totalLanes} lanes clear
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {totalTrucks} trucks on road
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">
              {redLanes} blocked lane{redLanes !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 p-4 bg-slate-800/30 rounded-lg">
          <div className="text-xs text-muted-foreground font-medium">Legend:</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-emerald-600 flex items-center justify-center">
              <Truck className="h-2 w-2 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Moving</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-amber-600 flex items-center justify-center">
              <Truck className="h-2 w-2 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-red-600 flex items-center justify-center">
              <Truck className="h-2 w-2 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Blocked</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Gate Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Gate Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Gate Closed</span>
          </div>
        </div>

        {/* Lanes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lanes.map((lane, index) => (
            <motion.div
              key={lane.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <LaneCard lane={lane} />
            </motion.div>
          ))}
        </div>

        {/* Conflict Resolution Panel */}
        {redLanes > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <Card className="bg-red-950/30 border-red-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Conflict Encounters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lanes
                    .filter(l => l.status === 'red')
                    .map(lane => (
                      <div
                        key={lane.id}
                        className="p-3 rounded-lg bg-red-950/50 border border-red-900/50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm text-red-200">
                              {lane.projectName}
                            </div>
                            <div className="text-xs text-red-400 mt-1">
                              {lane.gates.find(g => g.status === 'red')?.reasonCode || 'Unknown issue'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs h-7 border-red-800 text-red-300 hover:bg-red-900/50">
                              <Activity className="h-3 w-3 mr-1" />
                              View Logs
                            </Button>
                            <Button variant="default" size="sm" className="text-xs h-7 bg-red-600 hover:bg-red-700">
              <Zap className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
