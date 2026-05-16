/**
 * MedTrustX — useEvents Hook
 * Subscribe to real-time backend events in components.
 */
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/events.service';
import type {
  EventFilter,
  EventHandler,
  ConnectionState,
  RealtimeEvent,
} from '@/types/events.types';

/** Subscribe to filtered events */
export function useEventSubscription<T = unknown>(
  filter: EventFilter,
  handler: EventHandler<T>,
  enabled = true,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const subscription = eventService.subscribe<T>(filter, (event) => {
      handlerRef.current(event);
    });

    return () => subscription.unsubscribe();
  }, [filter, enabled]);
}

/** Auto-invalidate React Query cache on events */
export function useEventInvalidation(
  filter: EventFilter,
  queryKeys: string[][],
  enabled = true,
): void {
  const queryClient = useQueryClient();

  useEventSubscription(
    filter,
    useCallback(() => {
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    }, [queryClient, queryKeys]),
    enabled,
  );
}

/** Track WebSocket connection state */
export function useConnectionState(): ConnectionState {
  const [state, setState] = useState<ConnectionState>(
    eventService.getConnectionState(),
  );

  useEffect(() => {
    return eventService.onConnectionChange(setState);
  }, []);

  return state;
}

/** Accumulate real-time events in a buffer */
export function useEventBuffer<T = unknown>(
  filter: EventFilter,
  maxSize = 50,
): RealtimeEvent<T>[] {
  const [events, setEvents] = useState<RealtimeEvent<T>[]>([]);

  useEventSubscription<T>(
    filter,
    useCallback(
      (event) => {
        setEvents((prev) => {
          const next = [event as RealtimeEvent<T>, ...prev];
          return next.slice(0, maxSize);
        });
      },
      [maxSize],
    ),
  );

  return events;
}
