import { useRef, useCallback } from 'react';
import { TimelineItemData } from '../types';
import { useSnapPosition } from './utils';

export interface ResizeState {
  itemIndex: number;
  edge: 'left' | 'right';
  originalX: number;
  originalWidth: number;
  startPosition: number;
  minWidthRightEdge?: number;
}

export interface UseTimelineResizeOptions {
  items: TimelineItemData[];
  setItems: React.Dispatch<React.SetStateAction<TimelineItemData[]>>;
  snap?: number;
  minItemWidth: number;
  maxItemWidth: number;
  threshold: number;
  enabled: boolean;
  updateScrollLock: (isDragging: boolean) => void;
}

export interface UseTimelineResizeReturn {
  resizeStateRef: React.MutableRefObject<ResizeState | null>;
  detectEdge: (
    event: MouseEvent | Touch,
    itemElement: HTMLElement
  ) => { isNearLeftEdge: boolean; isNearRightEdge: boolean };
  initResizeState: (
    actualItemIndex: number,
    actualItem: TimelineItemData,
    edge: 'left' | 'right',
    position: number
  ) => void;
  handleResizeMove: (position: number) => void;
  cleanupResize: () => void;
}

export function useTimelineResize(
  options: UseTimelineResizeOptions
): UseTimelineResizeReturn {
  const {
    items,
    setItems,
    snap,
    minItemWidth,
    maxItemWidth,
    threshold,
    enabled,
    updateScrollLock
  } = options;

  const resizeStateRef = useRef<ResizeState | null>(null);
  const snapPosition = useSnapPosition(snap);

  const detectEdge = useCallback(
    (
      event: MouseEvent | Touch,
      itemElement: HTMLElement
    ): { isNearLeftEdge: boolean; isNearRightEdge: boolean } => {
      const itemRect = itemElement.getBoundingClientRect();
      const pixelPosition = event.clientX - itemRect.left;
      return {
        isNearLeftEdge: pixelPosition < threshold,
        isNearRightEdge: pixelPosition > itemRect.width - threshold
      };
    },
    [threshold]
  );

  const initResizeState = useCallback(
    (
      actualItemIndex: number,
      actualItem: TimelineItemData,
      edge: 'left' | 'right',
      position: number
    ) => {
      resizeStateRef.current = {
        itemIndex: actualItemIndex,
        edge,
        originalX: actualItem.x,
        originalWidth: actualItem.width,
        startPosition: position
      };
      updateScrollLock(true);
    },
    [updateScrollLock]
  );

  const handleResizeMove = useCallback(
    (position: number) => {
      if (!enabled) return;
      if (!resizeStateRef.current) return;

      const resizeState = resizeStateRef.current;
      const deltaPosition = position - resizeState.startPosition;

      setItems((prevItems) => {
        const newItems = [...prevItems];
        const resizedItem = newItems[resizeState.itemIndex];
        const groupId = resizedItem.group;

        if (resizeState.edge === 'right') {
          let newWidth = resizeState.originalWidth + deltaPosition;
          newWidth = Math.max(minItemWidth, Math.min(maxItemWidth, newWidth));
          if (snap) {
            newWidth = snapPosition(newWidth);
          }

          newItems.forEach((item, index) => {
            if (item.group === groupId) {
              newItems[index] = {
                ...item,
                width: newWidth
              };
            }
          });
        } else {
          let newX = resizeState.originalX + deltaPosition;
          let newWidth = resizeState.originalWidth - deltaPosition;

          if (newX < 0) {
            newWidth += newX;
            newX = 0;
          }

          const rightEdge = newX + newWidth;

          let constrainedWidth = Math.max(
            minItemWidth,
            Math.min(maxItemWidth, newWidth)
          );

          if (constrainedWidth === minItemWidth && newWidth < minItemWidth) {
            if (resizeState.minWidthRightEdge === undefined) {
              resizeState.minWidthRightEdge = rightEdge;
            }

            newX = resizeState.minWidthRightEdge - minItemWidth;
            newWidth = minItemWidth;
          } else if (
            constrainedWidth === maxItemWidth &&
            newWidth > maxItemWidth
          ) {
            newX =
              resizeState.originalX + resizeState.originalWidth - maxItemWidth;
            newWidth = maxItemWidth;

            resizeState.minWidthRightEdge = undefined;
          } else {
            newWidth = constrainedWidth;
            resizeState.minWidthRightEdge = undefined;
          }

          if (snap) {
            newX = snapPosition(newX);
            newWidth = snapPosition(newWidth);
          }

          newItems.forEach((item, index) => {
            if (item.group === groupId) {
              newItems[index] = {
                ...item,
                x: newX,
                width: newWidth
              };
            }
          });
        }

        return newItems;
      });
    },
    [minItemWidth, maxItemWidth, snap, snapPosition, setItems, enabled]
  );

  const cleanupResize = useCallback(() => {
    if (resizeStateRef.current) {
      resizeStateRef.current = null;
      updateScrollLock(false);
    }
  }, [updateScrollLock]);

  return {
    resizeStateRef,
    detectEdge,
    initResizeState,
    handleResizeMove,
    cleanupResize
  };
}

