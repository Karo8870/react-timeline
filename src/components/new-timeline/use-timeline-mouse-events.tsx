import { useCallback } from 'react';
import { Key } from 'react';
import { useTimelineContext } from '@/components/new-timeline/timeline-context';
import {
  TimelineMouseEvent,
  TimelineItemMouseEvent,
  TimelineItemData
} from '@/components/new-timeline/types';

export function useRowKey() {
  const { rows } = useTimelineContext();
  const flattenedRows = rows.flat();

  return useCallback(
    (rowIndex: number): Key | null => {
      if (rowIndex >= 0 && rowIndex < flattenedRows.length) {
        return flattenedRows[rowIndex].key;
      }
      return null;
    },
    [flattenedRows]
  );
}

function useMouseHandlers<T>(
  handleEvent: (e: React.MouseEvent<HTMLDivElement>, handler?: (e: T) => void) => void,
  handlers: {
    onMouseDown?: (e: T) => void;
    onMouseUp?: (e: T) => void;
    onMouseMove?: (e: T) => void;
    onClick?: (e: T) => void;
  },
  stopPropagation: boolean = false
) {
  const createHandler = useCallback(
    (handler?: (e: T) => void) => {
      return (e: React.MouseEvent<HTMLDivElement>) => {
        if (stopPropagation) {
          e.stopPropagation();
        }
        handleEvent(e, handler);
      };
    },
    [handleEvent, stopPropagation]
  );

  const handleMouseDown = useCallback(
    createHandler(handlers.onMouseDown),
    [createHandler, handlers.onMouseDown]
  );

  const handleMouseUp = useCallback(
    createHandler(handlers.onMouseUp),
    [createHandler, handlers.onMouseUp]
  );

  const handleMouseMove = useCallback(
    createHandler(handlers.onMouseMove),
    [createHandler, handlers.onMouseMove]
  );

  const handleClick = useCallback(
    createHandler(handlers.onClick),
    [createHandler, handlers.onClick]
  );

  return {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
    onClick: handleClick
  };
}

export function useTimelineMouseEvents(
  containerRef: React.RefObject<HTMLDivElement | null>,
  handlers: {
    onMouseDown?: (e: TimelineMouseEvent) => void;
    onMouseUp?: (e: TimelineMouseEvent) => void;
    onMouseMove?: (e: TimelineMouseEvent) => void;
    onClick?: (e: TimelineMouseEvent) => void;
  }
) {
  const { rowHeight, columnWidth, cols, timelineWidth } = useTimelineContext();
  const getRowKey = useRowKey();

  const handleMouseEvent = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement>,
      handler?: (e: TimelineMouseEvent) => void
    ) => {
      if (!handler || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const totalPixelWidth = columnWidth * cols;
      const scaleFactor = totalPixelWidth / timelineWidth;
      const position = mouseX / scaleFactor;

      const rowIndex = Math.floor(mouseY / rowHeight);

      const timelineEvent: TimelineMouseEvent = {
        event: e.nativeEvent,
        position,
        rowIndex,
        rowKey: getRowKey(rowIndex)
      };

      handler(timelineEvent);
    },
    [columnWidth, cols, timelineWidth, rowHeight, getRowKey, containerRef]
  );

  return useMouseHandlers(handleMouseEvent, handlers, false);
}

export function useTimelineItemMouseEvents(
  itemRef: React.RefObject<HTMLDivElement | null>,
  item: TimelineItemData,
  itemIndex: number,
  handlers: {
    onMouseDown?: (e: TimelineItemMouseEvent) => void;
    onMouseUp?: (e: TimelineItemMouseEvent) => void;
    onMouseMove?: (e: TimelineItemMouseEvent) => void;
    onClick?: (e: TimelineItemMouseEvent) => void;
  },
  containerRef?: React.RefObject<HTMLDivElement | null>
) {
  const { rowHeight, columnWidth, cols, timelineWidth } = useTimelineContext();
  const getRowKey = useRowKey();

  const handleMouseEvent = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement>,
      handler?: (e: TimelineItemMouseEvent) => void
    ) => {
      if (!handler || !itemRef.current) return;

      const itemRect = itemRef.current.getBoundingClientRect();
      const mouseX = e.clientX - itemRect.left;

      const totalPixelWidth = columnWidth * cols;
      const scaleFactor = totalPixelWidth / timelineWidth;

      const timelinePosition = item.x + mouseX / scaleFactor;
      const itemPosition = mouseX / scaleFactor;

      // Calculate rowIndex from mouse position relative to container
      let rowIndex = item.row;
      if (containerRef?.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const mouseY = e.clientY - containerRect.top;
        rowIndex = Math.floor(mouseY / rowHeight);
      }

      const itemEvent: TimelineItemMouseEvent = {
        event: e.nativeEvent,
        position: timelinePosition,
        itemPosition,
        rowIndex,
        rowKey: getRowKey(rowIndex),
        item,
        itemIndex
      };

      handler(itemEvent);
    },
    [columnWidth, cols, timelineWidth, rowHeight, item, itemIndex, getRowKey, itemRef, containerRef]
  );

  return useMouseHandlers(handleMouseEvent, handlers, true);
}

function useTouchHandlers<T>(
  handleEvent: (e: React.TouchEvent<HTMLDivElement>, handler?: (e: T) => void) => void,
  handlers: {
    onTouchStart?: (e: T) => void;
    onTouchEnd?: (e: T) => void;
    onTouchMove?: (e: T) => void;
  },
  stopPropagation: boolean = false,
  preventDefault: boolean = false
) {
  const createHandler = useCallback(
    (handler?: (e: T) => void) => {
      return (e: React.TouchEvent<HTMLDivElement>) => {
        if (preventDefault) {
          e.preventDefault();
        }
        if (stopPropagation) {
          e.stopPropagation();
        }
        handleEvent(e, handler);
      };
    },
    [handleEvent, stopPropagation, preventDefault]
  );

  const handleTouchStart = useCallback(
    createHandler(handlers.onTouchStart),
    [createHandler, handlers.onTouchStart]
  );

  const handleTouchEnd = useCallback(
    createHandler(handlers.onTouchEnd),
    [createHandler, handlers.onTouchEnd]
  );

  const handleTouchMove = useCallback(
    createHandler(handlers.onTouchMove),
    [createHandler, handlers.onTouchMove]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove
  };
}

export function useTimelineTouchEvents(
  containerRef: React.RefObject<HTMLDivElement | null>,
  handlers: {
    onTouchStart?: (e: TimelineMouseEvent) => void;
    onTouchEnd?: (e: TimelineMouseEvent) => void;
    onTouchMove?: (e: TimelineMouseEvent) => void;
  },
  isDragging: boolean = false
) {
  const { rowHeight, columnWidth, cols, timelineWidth } = useTimelineContext();
  const getRowKey = useRowKey();

  const handleTouchEvent = useCallback(
    (
      e: React.TouchEvent<HTMLDivElement>,
      handler?: (e: TimelineMouseEvent) => void
    ) => {
      if (!containerRef.current) return;

      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return;

      const rect = containerRef.current.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      const totalPixelWidth = columnWidth * cols;
      const scaleFactor = totalPixelWidth / timelineWidth;
      const position = touchX / scaleFactor;

      const rowIndex = Math.floor(touchY / rowHeight);

      const timelineEvent: TimelineMouseEvent = {
        event: e.nativeEvent,
        position,
        rowIndex,
        rowKey: getRowKey(rowIndex)
      };

      if (handler) {
        handler(timelineEvent);
      }
    },
    [columnWidth, cols, timelineWidth, rowHeight, getRowKey, containerRef]
  );

  return useTouchHandlers(handleTouchEvent, handlers, false, isDragging);
}

export function useTimelineItemTouchEvents(
  itemRef: React.RefObject<HTMLDivElement | null>,
  item: TimelineItemData,
  itemIndex: number,
  handlers: {
    onTouchStart?: (e: TimelineItemMouseEvent) => void;
    onTouchEnd?: (e: TimelineItemMouseEvent) => void;
    onTouchMove?: (e: TimelineItemMouseEvent) => void;
  },
  containerRef?: React.RefObject<HTMLDivElement | null>,
  isDragging: boolean = false
) {
  const { rowHeight, columnWidth, cols, timelineWidth } = useTimelineContext();
  const getRowKey = useRowKey();

  const handleTouchEvent = useCallback(
    (
      e: React.TouchEvent<HTMLDivElement>,
      handler?: (e: TimelineItemMouseEvent) => void
    ) => {
      if (!itemRef.current) return;

      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return;

      const itemRect = itemRef.current.getBoundingClientRect();
      const touchX = touch.clientX - itemRect.left;

      const totalPixelWidth = columnWidth * cols;
      const scaleFactor = totalPixelWidth / timelineWidth;

      const timelinePosition = item.x + touchX / scaleFactor;
      const itemPosition = touchX / scaleFactor;

      let rowIndex = item.row;
      if (containerRef?.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const touchY = touch.clientY - containerRect.top;
        rowIndex = Math.floor(touchY / rowHeight);
      }

      const itemEvent: TimelineItemMouseEvent = {
        event: e.nativeEvent,
        position: timelinePosition,
        itemPosition,
        rowIndex,
        rowKey: getRowKey(rowIndex),
        item,
        itemIndex
      };

      if (handler) {
        handler(itemEvent);
      }
    },
    [columnWidth, cols, timelineWidth, rowHeight, item, itemIndex, getRowKey, itemRef, containerRef]
  );

  return useTouchHandlers(handleTouchEvent, handlers, true, isDragging);
}
