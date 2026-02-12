'use client';

import { useGastownStore, useTownMetrics } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Building2,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Map as MapIcon,
  Building,
  Swords,
  Truck,
  Landmark,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const viewIcons = {
  town_map: MapIcon,
  building_interior: Building,
  battle_terminal: Swords,
  highway: Truck,
  city_hall: Landmark,
};

const viewLabels = {
  town_map: 'Town Map',
  building_interior: 'Building',
  battle_terminal: 'Battle Terminal',
  highway: 'Highway',
  city_hall: 'City Hall',
};

export function TopBar() {
  const {
    currentView,
    setView,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    isLive,
    setLive,
    userRole,
    setUserRole,
  } = useGastownStore();

  const metrics = useTownMetrics();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight">Gastown</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Command Center</span>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="hidden md:flex items-center gap-4 ml-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-xs">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      metrics.blockedProjects > 0
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-emerald-500'
                    )}
                  />
                  <span className="text-muted-foreground">
                    {metrics.blockedProjects}/{metrics.totalProjects} blocked
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Blocked projects require attention</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3 w-3 text-violet-500" />
                  <span className="text-muted-foreground">
                    {metrics.pendingApprovals} pending
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Awaiting human approval</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span className="text-muted-foreground">
                    {Math.round(metrics.mergeQueueHealth * 100)}% healthy
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Merge queue health score</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-xs">
                  <AlertTriangle
                    className={cn(
                      'h-3 w-3',
                      metrics.activeIncidents > 0
                        ? 'text-red-500 animate-pulse'
                        : 'text-muted-foreground'
                    )}
                  />
                  <span className="text-muted-foreground">
                    {metrics.activeIncidents} incidents
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Active incidents</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-xs">
                  <Users className="h-3 w-3 text-primary" />
                  <span className="text-muted-foreground">
                    {metrics.activeAgents} agents active
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Working agents</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          {currentView === 'town_map' && (
            <>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 w-48 text-xs"
                />
              </div>
              <Select
                value={filterStatus || 'all'}
                onValueChange={(v) => setFilterStatus(v === 'all' ? null : v)}
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="awaiting_approval">Awaiting</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Live Status */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-8 gap-1', isLive ? 'text-emerald-500' : 'text-muted-foreground')}
                onClick={() => setLive(!isLive)}
              >
                {isLive ? (
                  <Wifi className="h-3.5 w-3.5" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">{isLive ? 'Live' : 'Paused'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isLive ? 'Real-time updates active' : 'Updates paused'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Role Switcher (Demo) */}
        <Select
          value={userRole}
          onValueChange={(v) => setUserRole(v as 'viewer' | 'operator' | 'mayor')}
        >
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
            <SelectItem value="mayor">Mayor</SelectItem>
          </SelectContent>
        </Select>

        {/* View Tabs */}
        <nav className="hidden lg:flex items-center gap-1 border-l pl-4">
          {(Object.keys(viewLabels) as Array<keyof typeof viewLabels>).map(
            (view) => {
              const Icon = viewIcons[view];
              return (
                <TooltipProvider key={view}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={currentView === view ? 'secondary' : 'ghost'}
                        size="sm"
                        className={cn('h-8', currentView === view && 'bg-primary/10')}
                        onClick={() => setView(view)}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{viewLabels[view]}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }
          )}
        </nav>
      </div>
    </header>
  );
}
