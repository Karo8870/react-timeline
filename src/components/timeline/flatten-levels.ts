import { Key } from 'react';
import { CategoryRow, FlattenedItem } from '@/components/timeline/types';

export function flattenLevels(items: CategoryRow[]): FlattenedItem[][] {
  const levels: FlattenedItem[][] = [];

  const processLevel = (
    items: CategoryRow[],
    level: number,
    parentID: Key | null
  ): void => {
    if (!levels[level]) {
      levels[level] = [];
    }

    items.forEach((item, index) => {
      const flattenedItem: FlattenedItem = {
        ...item,
        parentID,
        innerIndex: index
      };

      levels[level].push(flattenedItem);

      if (item.children && item.children.length > 0) {
        processLevel(item.children, level + 1, item.key);
      }
    });
  };

  processLevel(items, 0, null);

  return levels;
}