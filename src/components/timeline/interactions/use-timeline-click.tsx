import { useRef, useCallback } from 'react';
import { TimelineMouseEvent, TimelineItemMouseEvent } from '../types';

export interface ClickState {
  mouseDownPosition: number | null;
  mouseDownRow: number | null;
}

export interface UseTimelineClickOptions {
  isDragging: () => boolean;
  isResizing: () => boolean;
  onTimelineClick?: (e: TimelineMouseEvent) => void;
  onItemClick?: (e: TimelineItemMouseEvent) => void;
}

export interface UseTimelineClickReturn {
  timelineClickStateRef: React.MutableRefObject<ClickState>;
  handleTimelineMouseDown: (e: TimelineMouseEvent) => void;
  handleTimelineMouseUp: (e: TimelineMouseEvent) => void;
  handleItemMouseUp: (
    e: TimelineItemMouseEvent,
    wasDragging: boolean,
    hadResize: boolean
  ) => void;
  handleItemTouchEnd: (
    e: TimelineItemMouseEvent,
    wasDragging: boolean,
    hadResize: boolean
  ) => void;
}

export function useTimelineClick(
  options: UseTimelineClickOptions
): UseTimelineClickReturn {
  const { isDragging, isResizing, onTimelineClick, onItemClick } = options;

  const timelineClickStateRef = useRef<ClickState>({
    mouseDownPosition: null,
    mouseDownRow: null
  });

  const handleTimelineMouseDown = useCallback(
    (e: TimelineMouseEvent) => {
      if (!isDragging() && !isResizing()) {
        timelineClickStateRef.current = {
          mouseDownPosition: e.position,
          mouseDownRow: e.rowIndex
        };
      }
    },
    [isDragging, isResizing]
  );

  const handleTimelineMouseUp = useCallback(
    (e: TimelineMouseEvent) => {
      const hadDrag = isDragging();
      const hadResize = isResizing();

      if (hadDrag || hadResize) {
        timelineClickStateRef.current = {
          mouseDownPosition: null,
          mouseDownRow: null
        };
        return;
      }

      const clickState = timelineClickStateRef.current;
      if (
        clickState.mouseDownPosition !== null &&
        clickState.mouseDownRow !== null &&
        Math.abs(e.position - clickState.mouseDownPosition) < 5 &&
        e.rowIndex === clickState.mouseDownRow &&
        onTimelineClick
      ) {
        onTimelineClick(e);
      }

      timelineClickStateRef.current = {
        mouseDownPosition: null,
        mouseDownRow: null
      };
    },
    [isDragging, isResizing, onTimelineClick]
  );

  const handleItemMouseUp = useCallback(
    (
      e: TimelineItemMouseEvent,
      wasDragging: boolean,
      hadResize: boolean
    ) => {
      if (!hadResize && !wasDragging && onItemClick) {
        onItemClick(e);
      }
    },
    [onItemClick]
  );

  const handleItemTouchEnd = useCallback(
    (
      e: TimelineItemMouseEvent,
      wasDragging: boolean,
      hadResize: boolean
    ) => {
      if (hadResize) {
        return;
      }
      if (wasDragging) {
        if (!wasDragging && onItemClick) {
          onItemClick(e);
        }
        return;
      }

      if (onItemClick) {
        onItemClick(e);
      }
    },
    [onItemClick]
  );

  return {
    timelineClickStateRef,
    handleTimelineMouseDown,
    handleTimelineMouseUp,
    handleItemMouseUp,
    handleItemTouchEnd
  };
}

