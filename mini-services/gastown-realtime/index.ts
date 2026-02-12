// Gastown Real-time Service
// WebSocket server for real-time updates

import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3003;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Event types for Gastown
const EVENT_TYPES = [
  'project.state_changed',
  'project.blocked',
  'agent.state_changed',
  'bead.created',
  'bead.updated',
  'bead.blocked',
  'artifact.recorded',
  'git.commit_observed',
  'git.push_observed',
  'pr.updated',
  'merge_queue.updated',
  'ci.check_updated',
  'policy.gate_evaluated',
  'merge.conflict_detected',
  'merge.conflict_resolved',
  'command.policy.*',
  'command.incident.*',
  'audit.ledger_entry',
];

const PROJECT_STATUSES = ['idle', 'working', 'blocked', 'error', 'awaiting_approval'];
const AGENT_STATUSES = ['idle', 'working', 'blocked', 'error'];

// Mock data generators
function generateEvent(tenantId: string) {
  const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const projectId = `proj_${String(Math.floor(Math.random() * 8) + 1).padStart(3, '0')}`;
  const agentId = `agent_${String(Math.floor(Math.random() * 6) + 1).padStart(3, '0')}`;

  const baseEvent = {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tenantId,
    eventType,
    eventVersion: 1,
    occurredAt: new Date().toISOString(),
    recordedAt: new Date().toISOString(),
    correlationId: `corr_${Math.random().toString(36).substr(2, 9)}`,
    causationId: null,
  };

  switch (eventType) {
    case 'project.state_changed':
      return {
        ...baseEvent,
        entityType: 'project',
        entityId: projectId,
        payload: {
          from: PROJECT_STATUSES[Math.floor(Math.random() * PROJECT_STATUSES.length)],
          to: PROJECT_STATUSES[Math.floor(Math.random() * PROJECT_STATUSES.length)],
          reason: 'Automated status update',
        },
      };

    case 'agent.state_changed':
      return {
        ...baseEvent,
        entityType: 'agent',
        entityId: agentId,
        payload: {
          from: AGENT_STATUSES[Math.floor(Math.random() * AGENT_STATUSES.length)],
          to: AGENT_STATUSES[Math.floor(Math.random() * AGENT_STATUSES.length)],
          reason: 'Task completion',
        },
      };

    case 'bead.created':
      return {
        ...baseEvent,
        entityType: 'bead',
        entityId: `bead_${Date.now()}`,
        payload: {
          projectId,
          agentId,
          title: `New task ${Math.floor(Math.random() * 1000)}`,
          status: 'pending',
        },
      };

    case 'ci.check_updated':
      return {
        ...baseEvent,
        entityType: 'check_run',
        entityId: `check_${Date.now()}`,
        payload: {
          name: ['Unit Tests', 'Integration Tests', 'Security Scan', 'Build'][Math.floor(Math.random() * 4)],
          status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
          conclusion: ['success', 'failure', 'cancelled'][Math.floor(Math.random() * 3)],
          projectId,
        },
      };

    case 'audit.ledger_entry':
      return {
        ...baseEvent,
        entityType: 'audit_ledger_entry',
        entityId: `audit_${Date.now()}`,
        payload: {
          actorId: 'user_001',
          actorRole: 'mayor',
          commandIntent: ['APPROVE', 'REQUEST_CHANGES', 'DECLARE_INCIDENT'][Math.floor(Math.random() * 3)],
          projectId,
        },
      };

    default:
      return {
        ...baseEvent,
        entityType: 'unknown',
        entityId: `entity_${Date.now()}`,
        payload: {
          message: 'Generic event',
        },
      };
  }
}

// Connection handling
io.on('connection', (socket) => {
  console.log(`[Gastown] Client connected: ${socket.id}`);

  // Join tenant-specific room
  socket.on('join:tenant', (tenantId: string) => {
    socket.join(`tenant:${tenantId}`);
    console.log(`[Gastown] Client ${socket.id} joined tenant: ${tenantId}`);

    // Send initial snapshot
    socket.emit('snapshot', {
      version: 1,
      cursorHighwater: `cursor_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  });

  // Leave tenant room
  socket.on('leave:tenant', (tenantId: string) => {
    socket.leave(`tenant:${tenantId}`);
    console.log(`[Gastown] Client ${socket.id} left tenant: ${tenantId}`);
  });

  // Handle replay requests
  socket.on('replay:request', (data: { tenantId: string; cursorStart: string; cursorEnd: string }) => {
    console.log(`[Gastown] Replay request from ${socket.id}:`, data);
    // Send mock replay events
    const events = Array.from({ length: 5 }, () => generateEvent(data.tenantId));
    socket.emit('replay:events', {
      events,
      cursorStart: data.cursorStart,
      cursorEnd: data.cursorEnd,
    });
  });

  // Handle commands
  socket.on('command', (data: { tenantId: string; commandType: string; payload: unknown }) => {
    console.log(`[Gastown] Command from ${socket.id}:`, data.commandType);

    // Echo back as audit event
    io.to(`tenant:${data.tenantId}`).emit('event', {
      eventId: `evt_${Date.now()}`,
      eventType: 'audit.ledger_entry',
      tenantId: data.tenantId,
      entityType: 'audit_ledger_entry',
      entityId: `audit_${Date.now()}`,
      payload: {
        commandType: data.commandType,
        commandPayload: data.payload,
        actorId: socket.id,
        timestamp: new Date().toISOString(),
      },
      occurredAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Gastown] Client disconnected: ${socket.id}`);
  });
});

// Simulate real-time events
let eventInterval: Timer | null = null;

function startSimulation() {
  if (eventInterval) return;

  eventInterval = setInterval(() => {
    // Generate random event for tenant_001
    const event = generateEvent('tenant_001');
    io.to('tenant:tenant_001').emit('event', event);
    console.log(`[Gastown] Emitted: ${event.eventType} -> ${event.entityId}`);
  }, 5000 + Math.random() * 5000); // Random interval between 5-10 seconds
}

function stopSimulation() {
  if (eventInterval) {
    clearInterval(eventInterval);
    eventInterval = null;
  }
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`[Gastown] Real-time service running on port ${PORT}`);
  console.log(`[Gastown] WebSocket endpoint: ws://localhost:${PORT}`);

  // Start event simulation
  startSimulation();
  console.log('[Gastown] Event simulation started');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[Gastown] Shutting down...');
  stopSimulation();
  io.close(() => {
    console.log('[Gastown] Server closed');
    process.exit(0);
  });
});
