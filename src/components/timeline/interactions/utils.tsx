import { useCallback } from 'react';
import { TimelineItemData, TimelineItemMouseEvent } from '../types';

export function useSnapPosition(snap?: number) {
  return useCallback(
    (position: number): number => {
      if (!snap) return position;
      return Math.round(position / snap) * snap;
    },
    [snap]
  );
}

export function useFindActualItem(items: TimelineItemData[]) {
  return useCallback(
    (e: TimelineItemMouseEvent): { itemIndex: number; item: TimelineItemData } => {
      let actualItemIndex = e.itemIndex;
      let actualItem = e.item;

      if (e.rowIndex !== e.item.row) {
        const clickedItem = items.find(
          (item) =>
            item.group === e.item.group &&
            item.row === e.rowIndex &&
            item.x === e.item.x &&
            item.width === e.item.width
        );
        if (clickedItem) {
          actualItemIndex = items.findIndex(
            (item) =>
              item.group === clickedItem.group &&
              item.row === clickedItem.row &&
              item.x === clickedItem.x &&
              item.width === clickedItem.width
          );
          actualItem = clickedItem;
        }
      }

      return { itemIndex: actualItemIndex, item: actualItem };
    },
    [items]
  );
}

export function useUpdateScrollLock() {
  return useCallback((isDragging: boolean) => {
    const timelineElement = document.querySelector(
      '.overflow-auto'
    ) as HTMLElement;
    if (timelineElement) {
      if (isDragging) {
        timelineElement.style.overflow = 'hidden';
        timelineElement.style.touchAction = 'none';
      } else {
        timelineElement.style.overflow = 'auto';
        timelineElement.style.touchAction = '';
      }
    }
  }, []);
}

