import { useCallback } from 'react';
import { TimelineItemData, TimelineItemMouseEvent, TimelineMouseEvent, DragOptions, ResizeOptions } from '../types';
import { useTimelineDrag } from './use-timeline-drag';
import { useTimelineResize } from './use-timeline-resize';
import { useTimelinePan } from './use-timeline-pan';
import { useTimelineClick } from './use-timeline-click';
import { useFindActualItem, useUpdateScrollLock } from './utils';

export interface UseTimelineInteractionsOptions {
  items: TimelineItemData[];
  setItems: React.Dispatch<React.SetStateAction<TimelineItemData[]>>;
  snap?: number;
  minItemWidth?: number;
  maxItemWidth?: number;
  drag?: DragOptions;
  resize?: ResizeOptions;
  onTimelineClick?: (e: TimelineMouseEvent) => void;
  onItemClick?: (e: TimelineItemMouseEvent) => void;
}

export interface UseTimelineInteractionsReturn {
  handleTimelineMouseDown: (e: TimelineMouseEvent) => void;
  handleTimelineMouseUp: (e: TimelineMouseEvent) => void;
  handleTimelineMouseMove: (e: TimelineMouseEvent) => void;
  handleTimelineTouchStart: (e: TimelineMouseEvent) => void;
  handleTimelineTouchMove: (e: TimelineMouseEvent) => void;
  handleTimelineTouchEnd: (e: TimelineMouseEvent) => void;
  handleItemMouseDown: (e: TimelineItemMouseEvent) => void;
  handleItemMouseMove: (e: TimelineItemMouseEvent) => void;
  handleItemMouseUp: (e: TimelineItemMouseEvent) => void;
  handleItemTouchStart: (e: TimelineItemMouseEvent) => void;
  handleItemTouchMove: (e: TimelineItemMouseEvent) => void;
  handleItemTouchEnd: (e: TimelineItemMouseEvent) => void;
  dragStateRef: React.MutableRefObject<{
    itemIndex: number;
    originalX: number;
    originalRow: number;
    startPosition: number;
    startRow: number;
    hasMoved: boolean;
  } | null>;
  resizeStateRef: React.MutableRefObject<{
    itemIndex: number;
    edge: 'left' | 'right';
    originalX: number;
    originalWidth: number;
    startPosition: number;
    minWidthRightEdge?: number;
  } | null>;
  findActualItem: (
    e: TimelineItemMouseEvent
  ) => { itemIndex: number; item: TimelineItemData };
}

export function useTimelineInteractions(
  options: UseTimelineInteractionsOptions
): UseTimelineInteractionsReturn {
  const {
    items,
    setItems,
    snap,
    minItemWidth = 50,
    maxItemWidth = 1000,
    drag,
    resize,
    onTimelineClick,
    onItemClick
  } = options;

  const dragEnabled = drag?.enabled ?? true;
  const resizeEnabled = resize?.enabled ?? true;
  const resizeThreshold = resize?.threshold ?? 12;

  const updateScrollLock = useUpdateScrollLock();
  const findActualItem = useFindActualItem(items);

  const resizeHook = useTimelineResize({
    items,
    setItems,
    snap,
    minItemWidth,
    maxItemWidth,
    threshold: resizeThreshold,
    enabled: resizeEnabled,
    updateScrollLock
  });

  const dragHook = useTimelineDrag({
    items,
    setItems,
    snap,
    enabled: dragEnabled,
    updateScrollLock,
    handleResizeMove: resizeHook.handleResizeMove,
    isResizing: () => resizeHook.resizeStateRef.current !== null
  });

  const pan = useTimelinePan({
    isDragging: () => dragHook.dragStateRef.current !== null,
    isResizing: () => resizeHook.resizeStateRef.current !== null
  });

  const click = useTimelineClick({
    isDragging: () => dragHook.dragStateRef.current !== null,
    isResizing: () => resizeHook.resizeStateRef.current !== null,
    onTimelineClick,
    onItemClick
  });

  const handleItemInteractionStart = useCallback(
    (e: TimelineItemMouseEvent, event: MouseEvent | TouchEvent) => {
      let target: HTMLElement | null = null;
      let mouseOrTouch: MouseEvent | Touch | null = null;

      if (event instanceof MouseEvent) {
        target = event.target as HTMLElement;
        mouseOrTouch = event;
      } else {
        const touch = event.touches[0];
        if (touch) {
          target = event.target as HTMLElement;
          mouseOrTouch = touch;
        }
      }

      if (!target || !mouseOrTouch) return;

      const itemElement = target.closest('[data-timeline-item]') as HTMLElement;
      if (!itemElement) return;

      const { isNearLeftEdge, isNearRightEdge } = resizeHook.detectEdge(
        mouseOrTouch,
        itemElement
      );
      const { itemIndex: actualItemIndex, item: actualItem } = findActualItem(e);

      if ((isNearLeftEdge || isNearRightEdge) && resizeEnabled) {
        resizeHook.initResizeState(
          actualItemIndex,
          actualItem,
          isNearLeftEdge ? 'left' : 'right',
          e.position
        );
      } else if (dragEnabled) {
        dragHook.initDragState(actualItemIndex, actualItem, e.position, e.rowIndex);
      }
    },
    [resizeHook, dragHook, findActualItem, resizeEnabled, dragEnabled]
  );

  const handleItemMouseDown = useCallback(
    (e: TimelineItemMouseEvent) => {
      handleItemInteractionStart(e, e.event as MouseEvent);
    },
    [handleItemInteractionStart]
  );

  const handleItemMouseMove = useCallback(
    (e: TimelineItemMouseEvent) => {
      dragHook.handleDragMove(e.position, e.rowIndex);
    },
    [dragHook]
  );

  const handleItemMouseUp = useCallback(
    (e: TimelineItemMouseEvent) => {
      const hadResize = resizeHook.resizeStateRef.current !== null;
      const wasDragging = dragHook.dragStateRef.current?.hasMoved || false;

      dragHook.cleanupDrag();
      resizeHook.cleanupResize();

      click.handleItemMouseUp(e, wasDragging, hadResize);
    },
    [dragHook, resizeHook, click]
  );

  const handleItemTouchStart = useCallback(
    (e: TimelineItemMouseEvent) => {
      (e.event as TouchEvent).preventDefault();
      pan.cancelPan();
      handleItemInteractionStart(e, e.event as TouchEvent);
    },
    [handleItemInteractionStart, pan]
  );

  const handleItemTouchMove = useCallback(
    (e: TimelineItemMouseEvent) => {
      const touchEvent = e.event as TouchEvent;
      if (resizeHook.resizeStateRef.current) {
        resizeHook.handleResizeMove(e.position);
        touchEvent.preventDefault();
      } else if (dragHook.dragStateRef.current) {
        dragHook.handleDragMove(e.position, e.rowIndex);
        touchEvent.preventDefault();
      }
      pan.cancelPan();
    },
    [resizeHook, dragHook, pan]
  );

  const handleItemTouchEnd = useCallback(
    (e: TimelineItemMouseEvent) => {
      const wasDragging = dragHook.dragStateRef.current?.hasMoved || false;
      const hadResize = resizeHook.resizeStateRef.current !== null;

      if (resizeHook.resizeStateRef.current) {
        resizeHook.cleanupResize();
        return;
      }
      if (dragHook.dragStateRef.current) {
        dragHook.cleanupDrag();
        click.handleItemTouchEnd(e, wasDragging, hadResize);
        return;
      }

      dragHook.cleanupDrag();
      resizeHook.cleanupResize();
      click.handleItemTouchEnd(e, wasDragging, hadResize);
    },
    [dragHook, resizeHook, click]
  );

  const handleTimelineMouseMove = useCallback(
    (e: TimelineMouseEvent) => {
      dragHook.handleDragMove(e.position, e.rowIndex);
    },
    [dragHook]
  );

  const handleTimelineTouchMove = useCallback(
    (e: TimelineMouseEvent) => {
      const touchEvent = e.event as TouchEvent;

      if (resizeHook.resizeStateRef.current) {
        resizeHook.handleResizeMove(e.position);
        touchEvent.preventDefault();
        pan.cancelPan();
        return;
      }

      if (dragHook.dragStateRef.current) {
        dragHook.handleDragMove(e.position, e.rowIndex);
        touchEvent.preventDefault();
        pan.cancelPan();
        return;
      }

      pan.handleTimelineTouchMove(e);
    },
    [resizeHook, dragHook, pan]
  );

  return {
    handleTimelineMouseDown: click.handleTimelineMouseDown,
    handleTimelineMouseUp: click.handleTimelineMouseUp,
    handleTimelineMouseMove,
    handleTimelineTouchStart: pan.handleTimelineTouchStart,
    handleTimelineTouchMove,
    handleTimelineTouchEnd: pan.handleTimelineTouchEnd,
    handleItemMouseDown,
    handleItemMouseMove,
    handleItemMouseUp,
    handleItemTouchStart,
    handleItemTouchMove,
    handleItemTouchEnd,
    dragStateRef: dragHook.dragStateRef,
    resizeStateRef: resizeHook.resizeStateRef,
    findActualItem
  };
}

