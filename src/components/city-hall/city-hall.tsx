'use client';

import { useGastownStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import {
  Landmark,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  Shield,
  Zap,
  Settings,
  Bell,
  Pause,
  Play,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockCityHallQueue, mockPolicies, mockIncidents, mockCoordinationIssues, mockAuditEntries } from '@/lib/mock-data';
import type { QueueItem, Incident, Policy, CoordinationIssue } from '@/types/gastown';
import { useState } from 'react';

const severityColors = {
  low: 'bg-slate-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const incidentStatusColors = {
  active: 'border-red-500 text-red-500',
  investigating: 'border-amber-500 text-amber-500',
  resolved: 'border-emerald-500 text-emerald-500',
  closed: 'border-slate-500 text-slate-500',
};

function QueueItemCard({ item }: { item: QueueItem }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'p-3 rounded-lg border transition-all',
        item.priority === 0 && 'border-red-500/50 bg-red-950/20',
        item.priority === 1 && 'border-amber-500/50 bg-amber-950/20',
        item.priority >= 2 && 'border-slate-700/50 bg-slate-900/30'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] h-4 px-1 capitalize',
                item.type === 'incident' && 'border-red-500 text-red-500',
                item.type === 'approval' && 'border-violet-500 text-violet-500',
                item.type === 'cross_project' && 'border-amber-500 text-amber-500'
              )}
            >
              {item.type.replace('_', ' ')}
            </Badge>
            {item.priority === 0 && (
              <Badge className="text-[10px] h-4 px-1 bg-red-500">Urgent</Badge>
            )}
          </div>
          <h4 className="font-medium text-sm truncate">{item.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
            {item.projectName && (
              <>
                <span>{item.projectName}</span>
                <span>•</span>
              </>
            )}
            <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0">
              Review
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{item.title}</DialogTitle>
              <DialogDescription>{item.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="ml-2 capitalize">{item.type.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="ml-2">{item.priority}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Project:</span>
                  <span className="ml-2">{item.projectName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Actor:</span>
                  <span className="ml-2">{item.actor}</span>
                </div>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <div className="font-medium text-foreground mb-2">Evidence Viewed</div>
                <div className="p-2 bg-slate-900 rounded text-xs font-mono">
                  All relevant artifacts and logs have been captured
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-lg border',
        incident.status === 'active' && 'border-red-500/50 bg-red-950/20',
        incident.status === 'investigating' && 'border-amber-500/50 bg-amber-950/20',
        incident.status === 'resolved' && 'border-emerald-500/50 bg-emerald-950/20'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              severityColors[incident.severity]
            )}
          />
          <span className="font-medium text-sm">{incident.title}</span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] h-4 px-1 capitalize',
            incidentStatusColors[incident.status]
          )}
        >
          {incident.status}
        </Badge>
      </div>

      {incident.description && (
        <p className="text-xs text-muted-foreground mb-3">{incident.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span className="capitalize">{incident.severity}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>

      {incident.status !== 'resolved' && incident.status !== 'closed' && (
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="text-xs h-7">
            <Users className="h-3 w-3 mr-1" />
            Assign
          </Button>
          <Button variant="default" size="sm" className="text-xs h-7">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Resolve
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function PolicyCard({ policy }: { policy: Policy }) {
  return (
    <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/30">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{policy.name}</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            v{policy.version}
          </Badge>
          <Switch checked={policy.isActive} />
        </div>
      </div>
      {policy.description && (
        <p className="text-xs text-muted-foreground">{policy.description}</p>
      )}
      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
        <span>Effective: {new Date(policy.effectiveFrom).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function CoordinationIssueCard({ issue }: { issue: CoordinationIssue }) {
  return (
    <div className="p-3 rounded-lg border border-amber-500/50 bg-amber-950/20">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <span className="font-medium text-sm capitalize">
          {issue.type.replace('_', ' ')}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{issue.heuristic}</p>
      <div className="flex gap-2">
        {issue.remediationCommands.map((cmd) => (
          <Button
            key={cmd.id}
            variant={cmd.type === 'mutation' ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-6"
          >
            {cmd.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function AuditEntryCard({ entry }: { entry: typeof mockAuditEntries[0] }) {
  return (
    <div className="p-2 rounded bg-slate-800/50 text-xs">
      <div className="flex items-center justify-between mb-1">
        <Badge variant="outline" className="text-[10px] h-4 px-1">
          {entry.commandIntent}
        </Badge>
        <span className="text-muted-foreground">
          {new Date(entry.occurredAt).toLocaleTimeString()}
        </span>
      </div>
      <div className="text-muted-foreground">
        <span>Actor: </span>
        <span className="text-foreground">{entry.actorRole || entry.actorId}</span>
      </div>
      {entry.evidenceRefs && (
        <div className="text-muted-foreground mt-1">
          <span>Evidence: {entry.evidenceRefs.length} items</span>
        </div>
      )}
    </div>
  );
}

export function CityHall() {
  const { userRole } = useGastownStore();
  const queue = mockCityHallQueue.sort((a, b) => a.priority - b.priority);
  const incidents = mockIncidents;
  const policies = mockPolicies;
  const coordinationIssues = mockCoordinationIssues;
  const auditEntries = mockAuditEntries;

  const isMayor = userRole === 'mayor';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">City Hall</h1>
              {isMayor && (
                <Badge className="bg-primary text-primary-foreground">Mayor Access</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Governance, policies, and incident management
            </p>
          </div>

          {/* Mayor Actions */}
          {isMayor && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-1" />
                Pause Lanes
              </Button>
              <Button variant="destructive" size="sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Declare Incident
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Global Queue */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-primary" />
                  Global Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {queue.length > 0 ? (
                      queue.map((item) => (
                        <QueueItemCard key={item.id} item={item} />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Queue is empty
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Active Incidents */}
            <Card className="bg-slate-900/50 border-slate-800 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Active Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {incidents.length > 0 ? (
                    incidents.map((incident) => (
                      <IncidentCard key={incident.id} incident={incident} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <Shield className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No active incidents
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Policies & Audit */}
          <div className="space-y-6">
            {/* Policies */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4 text-primary" />
                  Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {policies.map((policy) => (
                  <PolicyCard key={policy.id} policy={policy} />
                ))}
              </CardContent>
            </Card>

            {/* Coordination Issues */}
            {coordinationIssues.length > 0 && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Coordination Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {coordinationIssues.map((issue) => (
                    <CoordinationIssueCard key={issue.id} issue={issue} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Audit Ledger */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" />
                  Recent Audit Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {auditEntries.map((entry) => (
                      <AuditEntryCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
