import { useRef, useCallback } from 'react';
import { TimelineMouseEvent } from '../types';

export interface PanState {
  startX: number;
  startY: number;
  startScrollLeft: number;
  startScrollTop: number;
}

export interface UseTimelinePanOptions {
  isDragging: () => boolean;
  isResizing: () => boolean;
}

export interface UseTimelinePanReturn {
  panStateRef: React.MutableRefObject<PanState | null>;
  handleTimelineTouchStart: (e: TimelineMouseEvent) => void;
  handleTimelineTouchMove: (e: TimelineMouseEvent) => void;
  handleTimelineTouchEnd: (e: TimelineMouseEvent) => void;
  cancelPan: () => void;
}

export function useTimelinePan(
  options: UseTimelinePanOptions
): UseTimelinePanReturn {
  const { isDragging, isResizing } = options;

  const panStateRef = useRef<PanState | null>(null);

  const handleTimelineTouchStart = useCallback(
    (e: TimelineMouseEvent) => {
      if (isResizing() || isDragging()) {
        (e.event as TouchEvent).preventDefault();
        return;
      }

      const touchEvent = e.event as TouchEvent;
      const touch = touchEvent.touches[0];

      if (touch) {
        const timelineElement = document.querySelector(
          '.overflow-auto'
        ) as HTMLElement;
        if (timelineElement) {
          panStateRef.current = {
            startX: touch.clientX,
            startY: touch.clientY,
            startScrollLeft: timelineElement.scrollLeft,
            startScrollTop: timelineElement.scrollTop
          };
          touchEvent.preventDefault();
        }
      }
    },
    [isDragging, isResizing]
  );

  const handleTimelineTouchMove = useCallback(
    (e: TimelineMouseEvent) => {
      const touchEvent = e.event as TouchEvent;

      if (isResizing() || isDragging()) {
        if (panStateRef.current) panStateRef.current = null;
        return;
      }

      if (panStateRef.current) {
        const touch = touchEvent.touches[0];
        if (touch) {
          const timelineElement = document.querySelector(
            '.overflow-auto'
          ) as HTMLElement;
          if (timelineElement) {
            const panState = panStateRef.current;
            const deltaX = panState.startX - touch.clientX;
            const deltaY = panState.startY - touch.clientY;
            timelineElement.scrollLeft = panState.startScrollLeft + deltaX;
            timelineElement.scrollTop = panState.startScrollTop + deltaY;
            touchEvent.preventDefault();
          }
        }
      }
    },
    [isDragging, isResizing]
  );

  const handleTimelineTouchEnd = useCallback(() => {
    if (panStateRef.current) panStateRef.current = null;
  }, []);

  const cancelPan = useCallback(() => {
    if (panStateRef.current) panStateRef.current = null;
  }, []);

  return {
    panStateRef,
    handleTimelineTouchStart,
    handleTimelineTouchMove,
    handleTimelineTouchEnd,
    cancelPan
  };
}

