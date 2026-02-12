// Gastown Command Center - Global Store
// Real-time AI Agent Orchestration Platform

import { create } from 'zustand';
import type {
  Project,
  Agent,
  Bead,
  Artifact,
  Incident,
  Event,
  HighwayLane,
  QueueItem,
  TerminalOption,
  ToolCall,
  UserRole,
} from '@/types/gastown';
import {
  mockProjects,
  mockAgents,
  mockBeads,
  mockArtifacts,
  mockIncidents,
  mockEvents,
  mockHighwayLanes,
  mockCityHallQueue,
  mockTerminalOptions,
  mockToolCalls,
  mockUser,
} from '@/lib/mock-data';

// ==================== VIEW TYPES ====================

export type ViewType = 'town_map' | 'building_interior' | 'battle_terminal' | 'highway' | 'city_hall';

// ==================== STORE STATE ====================

interface GastownState {
  // User & Role
  currentUser: typeof mockUser;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Navigation
  currentView: ViewType;
  setView: (view: ViewType) => void;
  selectedProjectId: string | null;
  selectedAgentId: string | null;
  selectProject: (projectId: string | null) => void;
  selectAgent: (agentId: string | null) => void;

  // Data
  projects: Project[];
  agents: Agent[];
  beads: Bead[];
  artifacts: Artifact[];
  incidents: Incident[];
  events: Event[];
  highwayLanes: HighwayLane[];
  cityHallQueue: QueueItem[];
  terminalOptions: TerminalOption[];
  toolCalls: ToolCall[];

  // UI State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string | null;
  setFilterStatus: (status: string | null) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Real-time simulation
  isLive: boolean;
  setLive: (live: boolean) => void;
  lastUpdate: Date | null;

  // Actions
  updateProjectStatus: (projectId: string, status: string, reason?: string) => void;
  updateAgentStatus: (agentId: string, status: string, reason?: string) => void;
  acknowledgeIncident: (incidentId: string) => void;
  addEvent: (event: Event) => void;
}

export const useGastownStore = create<GastownState>((set) => ({
  // User & Role
  currentUser: mockUser,
  userRole: mockUser.role as UserRole,
  setUserRole: (role) => set({ userRole: role }),

  // Navigation
  currentView: 'town_map',
  setView: (view) => set({ currentView: view }),
  selectedProjectId: null,
  selectedAgentId: null,
  selectProject: (projectId) => set({ selectedProjectId: projectId, currentView: projectId ? 'building_interior' : 'town_map' }),
  selectAgent: (agentId) => set({ selectedAgentId: agentId, currentView: agentId ? 'battle_terminal' : 'town_map' }),

  // Data
  projects: mockProjects,
  agents: mockAgents,
  beads: mockBeads,
  artifacts: mockArtifacts,
  incidents: mockIncidents,
  events: mockEvents,
  highwayLanes: mockHighwayLanes,
  cityHallQueue: mockCityHallQueue,
  terminalOptions: mockTerminalOptions,
  toolCalls: mockToolCalls,

  // UI State
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  filterStatus: null,
  setFilterStatus: (status) => set({ filterStatus: status }),
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  // Real-time simulation
  isLive: true,
  setLive: (live) => set({ isLive: live }),
  lastUpdate: new Date(),

  // Actions
  updateProjectStatus: (projectId, status, reason) => set((state) => ({
    projects: state.projects.map((p) =>
      p.id === projectId ? { ...p, status: status as Project['status'], statusReason: reason || null, updatedAt: new Date() } : p
    ),
    lastUpdate: new Date(),
  })),

  updateAgentStatus: (agentId, status, reason) => set((state) => ({
    agents: state.agents.map((a) =>
      a.id === agentId ? { ...a, status: status as Agent['status'], statusReason: reason || null, updatedAt: new Date() } : a
    ),
    lastUpdate: new Date(),
  })),

  acknowledgeIncident: (incidentId) => set((state) => ({
    incidents: state.incidents.map((i) =>
      i.id === incidentId ? { ...i, status: 'resolved', updatedAt: new Date() } : i
    ),
    cityHallQueue: state.cityHallQueue.filter((q) => !(q.type === 'incident' && q.projectId === state.incidents.find((i) => i.id === incidentId)?.projectId)),
    lastUpdate: new Date(),
  })),

  addEvent: (event) => set((state) => ({
    events: [event, ...state.events].slice(0, 100),
    lastUpdate: new Date(),
  })),
}));

// ==================== SELECTORS ====================

export const useSelectedProject = () => {
  const { projects, selectedProjectId } = useGastownStore();
  return projects.find((p) => p.id === selectedProjectId) || null;
};

export const useSelectedAgent = () => {
  const { agents, selectedAgentId } = useGastownStore();
  return agents.find((a) => a.id === selectedAgentId) || null;
};

export const useProjectAgents = (projectId: string) => {
  const { agents } = useGastownStore();
  return agents.filter((a) => a.projectId === projectId);
};

export const useProjectBeads = (projectId: string) => {
  const { beads } = useGastownStore();
  return beads.filter((b) => b.projectId === projectId);
};

export const useFilteredProjects = () => {
  const { projects, searchQuery, filterStatus } = useGastownStore();
  
  return projects.filter((p) => {
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesStatus = filterStatus ? p.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });
};

export const useTownMetrics = () => {
  const { projects, agents, incidents, cityHallQueue, highwayLanes } = useGastownStore();
  
  return {
    totalProjects: projects.length,
    blockedProjects: projects.filter((p) => p.status === 'blocked').length,
    pendingApprovals: cityHallQueue.filter((q) => q.type === 'approval').length,
    mergeQueueHealth: highwayLanes.filter((l) => l.status === 'green').length / highwayLanes.length,
    activeIncidents: incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length,
    activeAgents: agents.filter((a) => a.status === 'working').length,
  };
};
