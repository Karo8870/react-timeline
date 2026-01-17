import { useState, useCallback } from 'react';
import { TimelineItemData } from './types';

export interface UseTimelineItemsOptions {
  initialItems?: TimelineItemData[];
  snap?: number;
  minItemWidth?: number;
  maxItemWidth?: number;
}

export interface UseTimelineItemsReturn {
  items: TimelineItemData[];
  setItems: React.Dispatch<React.SetStateAction<TimelineItemData[]>>;
  createItem: (params: {
    position: number;
    rowIndex: number;
    width: number;
    type?: string;
    data?: Record<string, unknown>;
    count?: number;
  }) => void;
  updateItem: (itemIndex: number, updates: Partial<TimelineItemData>) => void;
  deleteItem: (itemIndex: number) => void;
  deleteItemGroup: (groupId: string | number) => void;
  findActualItem: (
    items: TimelineItemData[],
    itemIndex: number,
    rowIndex: number,
    group: string | number,
    x: number,
    width: number
  ) => { itemIndex: number; item: TimelineItemData } | null;
}

export function useTimelineItems(
  options: UseTimelineItemsOptions = {}
): UseTimelineItemsReturn {
  const {
    initialItems = [],
    snap,
    minItemWidth = 50,
    maxItemWidth = 1000
  } = options;

  const [items, setItems] = useState<TimelineItemData[]>(initialItems);

  const snapPosition = useCallback(
    (position: number): number => {
      if (!snap) return position;
      return Math.round(position / snap) * snap;
    },
    [snap]
  );

  const findActualItem = useCallback(
    (
      items: TimelineItemData[],
      itemIndex: number,
      rowIndex: number,
      group: string | number,
      x: number,
      width: number
    ): { itemIndex: number; item: TimelineItemData } | null => {
      const clickedItem = items.find(
        (item) =>
          item.group === group &&
          item.row === rowIndex &&
          item.x === x &&
          item.width === width
      );
      if (clickedItem) {
        const actualItemIndex = items.findIndex(
          (item) =>
            item.group === clickedItem.group &&
            item.row === clickedItem.row &&
            item.x === clickedItem.x &&
            item.width === clickedItem.width
        );
        return { itemIndex: actualItemIndex, item: clickedItem };
      }
      return null;
    },
    []
  );

  const createItem = useCallback(
    (params: {
      position: number;
      rowIndex: number;
      width: number;
      type?: string;
      data?: Record<string, unknown>;
      count?: number;
    }) => {
      const {
        position,
        rowIndex,
        width,
        type = 'default',
        data = {},
        count = 1
      } = params;

      setItems((prevItems) => {
        const maxGroup = Math.max(
          ...prevItems.map((item) => Number(item.group)),
          -1
        );
        const newGroup = maxGroup + 1;

        const snappedPosition = snap ? snapPosition(position) : position;
        const snappedWidth = snap ? snapPosition(width) : width;
        const constrainedWidth = Math.max(
          minItemWidth,
          Math.min(maxItemWidth, snappedWidth)
        );

        const itemCount = Math.max(1, Math.floor(count));
        const newItems: TimelineItemData[] = [];

        for (let i = 0; i < itemCount; i++) {
          newItems.push({
            type,
            width: constrainedWidth,
            row: rowIndex + i,
            x: Math.max(0, snappedPosition),
            group: newGroup,
            data
          });
        }

        return [...prevItems, ...newItems];
      });
    },
    [snap, snapPosition, minItemWidth, maxItemWidth]
  );

  const updateItem = useCallback(
    (itemIndex: number, updates: Partial<TimelineItemData>) => {
      setItems((prevItems) => {
        const newItems = [...prevItems];
        const itemToUpdate = newItems[itemIndex];
        if (!itemToUpdate) return prevItems;

        const groupId = itemToUpdate.group;

        let width = updates.width;
        if (width !== undefined) {
          if (snap) {
            width = snapPosition(width);
          }
          width = Math.max(minItemWidth, Math.min(maxItemWidth, width));
        }

        newItems.forEach((item, index) => {
          if (item.group === groupId) {
            newItems[index] = {
              ...item,
              ...(index === itemIndex ? updates : {}),
              ...(width !== undefined ? { width } : {})
            };
          }
        });

        return newItems;
      });
    },
    [snap, snapPosition, minItemWidth, maxItemWidth]
  );

  const deleteItem = useCallback((itemIndex: number) => {
    setItems((prevItems) => {
      if (itemIndex < 0 || itemIndex >= prevItems.length) return prevItems;
      return prevItems.filter((_, index) => index !== itemIndex);
    });
  }, []);

  const deleteItemGroup = useCallback((groupId: string | number) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.group !== groupId)
    );
  }, []);

  return {
    items,
    setItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItemGroup,
    findActualItem
  };
}
