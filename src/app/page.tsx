'use client';

import { useState } from 'react';
import Timeline, {
  TimelineItemData,
  TimelineItemMouseEvent,
  TimelineMouseEvent,
  useTimelineItems
} from '@/components/timeline/timeline';
import { defaultCategories, defaultItems } from '@/lib/data';
import { CreateItemDialog } from '@/components/create-item-dialog';
import { EditItemDialog } from '@/components/edit-item-dialog';
import { DefaultTimelineItem } from '@/components/timeline-items/default-timeline-item';
import { PlaceholderItem } from '@/components/timeline-items/placeholder-item';

function formatTime(hours: number, minutes: number = 0): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const startHour = 10;
const cols = 10;
const columnWidth = 100;
const snap = columnWidth / 4;
const minItemWidth = 50;
const maxItemWidth = 1000;

export default function Home() {
  const timelineItems = useTimelineItems({
    initialItems: defaultItems,
    snap,
    minItemWidth,
    maxItemWidth
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createItemData, setCreateItemData] = useState<{
    position: number;
    rowIndex: number;
  } | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    itemIndex: number;
    item: TimelineItemData;
  } | null>(null);

  const handleTimelineClick = (e: TimelineMouseEvent) => {
    setCreateItemData({
      position: e.position,
      rowIndex: e.rowIndex
    });
    setIsCreateDialogOpen(true);
  };

  const handleItemClick = (e: TimelineItemMouseEvent) => {
    const result = timelineItems.findActualItem(
      timelineItems.items,
      e.itemIndex,
      e.rowIndex,
      e.item.group,
      e.item.x,
      e.item.width
    );

    if (result) {
      setEditingItem({
        itemIndex: result.itemIndex,
        item: result.item
      });
      setIsEditDialogOpen(true);
    }
  };

  return (
    <main>
      <Timeline
        cols={cols}
        columnWidth={columnWidth}
        renderColumn={(x, index) => {
          const hoursOffset = x / columnWidth;
          const totalHours = startHour + hoursOffset;
          const hours = Math.floor(totalHours);
          const minutes = Math.floor((totalHours - hours) * 60);
          return formatTime(hours, minutes);
        }}
        onClick={handleTimelineClick}
        onItemClick={handleItemClick}
        categories={defaultCategories}
        itemComponents={{
          default: DefaultTimelineItem,
          placeholder: PlaceholderItem
        }}
        items={timelineItems.items}
        snap={snap}
        minItemWidth={minItemWidth}
        maxItemWidth={maxItemWidth}
        drag={{
          enabled: true
        }}
        resize={{
          enabled: true,
          threshold: 12
        }}
        onItemsChange={timelineItems.setItems}
      />
      <CreateItemDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        createItemData={createItemData}
        timelineItems={timelineItems}
        minItemWidth={minItemWidth}
        maxItemWidth={maxItemWidth}
      />
      <EditItemDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingItem={editingItem}
        timelineItems={timelineItems}
        minItemWidth={minItemWidth}
        maxItemWidth={maxItemWidth}
      />
    </main>
  );
}
