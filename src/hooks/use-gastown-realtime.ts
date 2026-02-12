'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGastownStore } from '@/lib/store';
import type { Event } from '@/types/gastown';

interface UseGastownRealtimeOptions {
  tenantId?: string;
  enabled?: boolean;
}

export function useGastownRealtime(options: UseGastownRealtimeOptions = {}) {
  const { tenantId = 'tenant_001', enabled = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isLive, addEvent, updateProjectStatus, updateAgentStatus } = useGastownStore();

  // Initialize socket connection
  useEffect(() => {
    if (!enabled) return;

    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Gastown] Connected to real-time service');
      setIsConnected(true);
      socket.emit('join:tenant', tenantId);
    });

    socket.on('disconnect', () => {
      console.log('[Gastown] Disconnected from real-time service');
      setIsConnected(false);
    });

    socket.on('snapshot', (data) => {
      console.log('[Gastown] Received snapshot:', data);
    });

    socket.on('event', (event: Event) => {
      if (!isLive) return;

      console.log('[Gastown] Received event:', event.eventType);

      // Add to event store
      addEvent(event);

      // Handle specific event types
      if (event.eventType === 'project.state_changed' && event.payload) {
        const payload = event.payload as { to: string; reason?: string };
        updateProjectStatus(event.entityId, payload.to, payload.reason);
      }

      if (event.eventType === 'agent.state_changed' && event.payload) {
        const payload = event.payload as { to: string; reason?: string };
        updateAgentStatus(event.entityId, payload.to, payload.reason);
      }
    });

    socket.on('replay:events', (data) => {
      console.log('[Gastown] Received replay events:', data.events.length);
    });

    return () => {
      socket.emit('leave:tenant', tenantId);
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [tenantId, enabled, isLive, addEvent, updateProjectStatus, updateAgentStatus]);

  // Send command
  const sendCommand = useCallback((commandType: string, payload: unknown) => {
    if (!socketRef.current || !isLive) return;

    socketRef.current.emit('command', {
      tenantId,
      commandType,
      payload,
    });
  }, [tenantId, isLive]);

  // Request replay
  const requestReplay = useCallback((cursorStart: string, cursorEnd: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit('replay:request', {
      tenantId,
      cursorStart,
      cursorEnd,
    });
  }, [tenantId]);

  return {
    sendCommand,
    requestReplay,
    isConnected,
  };
}
