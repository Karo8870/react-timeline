import { useRef, useCallback } from 'react';
import { TimelineItemData } from '../types';
import { useSnapPosition } from './utils';

export interface DragState {
  itemIndex: number;
  originalX: number;
  originalRow: number;
  startPosition: number;
  startRow: number;
  hasMoved: boolean;
}

export interface UseTimelineDragOptions {
  items: TimelineItemData[];
  setItems: React.Dispatch<React.SetStateAction<TimelineItemData[]>>;
  snap?: number;
  enabled: boolean;
  updateScrollLock: (isDragging: boolean) => void;
  handleResizeMove?: (position: number) => void;
  isResizing?: () => boolean;
}

export interface UseTimelineDragReturn {
  dragStateRef: React.MutableRefObject<DragState | null>;
  initDragState: (
    actualItemIndex: number,
    actualItem: TimelineItemData,
    position: number,
    rowIndex: number
  ) => void;
  handleDragMove: (position: number, rowIndex: number) => void;
  cleanupDrag: () => void;
}

export function useTimelineDrag(
  options: UseTimelineDragOptions
): UseTimelineDragReturn {
  const { items, setItems, snap, enabled, updateScrollLock, handleResizeMove, isResizing } = options;

  const dragStateRef = useRef<DragState | null>(null);
  const snapPosition = useSnapPosition(snap);

  const initDragState = useCallback(
    (
      actualItemIndex: number,
      actualItem: TimelineItemData,
      position: number,
      rowIndex: number
    ) => {
      dragStateRef.current = {
        itemIndex: actualItemIndex,
        originalX: actualItem.x,
        originalRow: actualItem.row,
        startPosition: position,
        startRow: rowIndex,
        hasMoved: false
      };
      updateScrollLock(true);
    },
    [updateScrollLock]
  );

  const handleDragMove = useCallback(
    (position: number, rowIndex: number) => {
      if (!enabled) return;

      if (isResizing?.() && handleResizeMove) {
        handleResizeMove(position);
        return;
      }

      if (!dragStateRef.current) return;

      const dragState = dragStateRef.current;
      const deltaPosition = position - dragState.startPosition;
      const deltaRow = rowIndex - dragState.startRow;
      const hasMoved = Math.abs(deltaPosition) > 5 || Math.abs(deltaRow) > 0;
      let newX = Math.max(0, dragState.originalX + deltaPosition);

      if (snap) {
        newX = snapPosition(newX);
      }

      const newRow = Math.max(0, dragState.originalRow + deltaRow);

      dragStateRef.current = {
        ...dragState,
        hasMoved: hasMoved || dragState.hasMoved
      };

      setItems((prevItems) => {
        const newItems = [...prevItems];
        const draggedItem = newItems[dragState.itemIndex];
        const groupId = draggedItem.group;

        newItems.forEach((item, index) => {
          if (item.group === groupId) {
            if (index === dragState.itemIndex) {
              newItems[index] = {
                ...item,
                x: newX,
                row: newRow
              };
            } else {
              newItems[index] = {
                ...item,
                x: newX
              };
            }
          }
        });

        return newItems;
      });
    },
    [snap, snapPosition, setItems, enabled, handleResizeMove, isResizing]
  );

  const cleanupDrag = useCallback(() => {
    if (dragStateRef.current) {
      dragStateRef.current = null;
      updateScrollLock(false);
    }
  }, [updateScrollLock]);

  return {
    dragStateRef,
    initDragState,
    handleDragMove,
    cleanupDrag
  };
}

