'use client';

import { useRef, useState } from 'react';
import NewTimeline, {
  TimelineItemComponentProps,
  TimelineItemData,
  TimelineItemMouseEvent,
  TimelineItemWrapper,
  TimelineMouseEvent
} from '@/components/new-timeline/new-timeline';
import { defaultCategories, defaultItems } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function formatTime(hours: number, minutes: number = 0): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function DefaultTimelineItem(props: TimelineItemComponentProps) {
  const name = (props.item.data.name as string) || '';
  const label = (props.item.data.label as string) || undefined;
  const RESIZE_THRESHOLD_PX = 12; // pixels

  // Check if there's an item above in the same group - if yes, don't render this one
  const hasItemAbove = props.items?.some(
    (otherItem, otherIndex) =>
      otherIndex !== props.itemIndex &&
      otherItem.group === props.item.group &&
      otherItem.row === props.item.row - 1 &&
      otherItem.x === props.item.x &&
      otherItem.width === props.item.width
  );

  // If there's an item above, don't render this item (the top one will handle it)
  if (hasItemAbove) {
    return null;
  }

  // Count how many adjacent items are below this one in the same group
  let adjacentCount = 1; // Start with this item
  let currentRow = props.item.row;
  while (true) {
    const hasItemBelow = props.items?.some(
      (otherItem) =>
        otherItem.group === props.item.group &&
        otherItem.row === currentRow + 1 &&
        otherItem.x === props.item.x &&
        otherItem.width === props.item.width
    );
    if (hasItemBelow) {
      adjacentCount++;
      currentRow++;
    } else {
      break;
    }
  }

  // Calculate total height for all adjacent items
  const totalHeight = props.pixelHeight * adjacentCount;

  return (
    <TimelineItemWrapper
      {...props}
      className='flex flex-col items-start overflow-hidden rounded-md border-2 border-primary bg-primary/20 px-2 text-foreground'
      style={{ height: totalHeight }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${RESIZE_THRESHOLD_PX}px`,
          height: '100%',
          cursor: 'w-resize',
          zIndex: 10
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: `${RESIZE_THRESHOLD_PX}px`,
          height: '100%',
          cursor: 'e-resize',
          zIndex: 10
        }}
      />
      <span className='line-clamp-1 truncate text-sm'>{name}</span>
      {label && (
        <span className='line-clamp-1 min-w-max truncate text-sm'>{label}</span>
      )}
    </TimelineItemWrapper>
  );
}

function PlaceholderItem(props: TimelineItemComponentProps) {
  return (
    <TimelineItemWrapper
      {...props}
      className='flex items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted/50 px-2 opacity-50'
    >
      <span className='text-sm text-muted-foreground'>Placeholder</span>
    </TimelineItemWrapper>
  );
}

export default function Home() {
  const startHour = 10;
  const cols = 10;
  const columnWidth = 100;
  const snap = columnWidth / 4;
  const minItemWidth = 50;
  const maxItemWidth = 1000;

  const [items, setItems] = useState<TimelineItemData[]>(defaultItems);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createItemData, setCreateItemData] = useState<{
    position: number;
    rowIndex: number;
  } | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemWidth, setNewItemWidth] = useState(200);
  const [newItemCount, setNewItemCount] = useState(1);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    itemIndex: number;
    item: TimelineItemData;
  } | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemLabel, setEditItemLabel] = useState('');
  const [editItemWidth, setEditItemWidth] = useState(200);

  const timelineClickStateRef = useRef<{
    mouseDownPosition: number | null;
    mouseDownRow: number | null;
  }>({ mouseDownPosition: null, mouseDownRow: null });

  const dragStateRef = useRef<{
    itemIndex: number;
    originalX: number;
    originalRow: number;
    startPosition: number;
    startRow: number;
    hasMoved: boolean;
  } | null>(null);

  const resizeStateRef = useRef<{
    itemIndex: number;
    edge: 'left' | 'right';
    originalX: number;
    originalWidth: number;
    startPosition: number;
    minWidthRightEdge?: number;
  } | null>(null);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const panStateRef = useRef<{
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
  } | null>(null);

  const snapPosition = (position: number): number => {
    if (!snap) return position;
    return Math.round(position / snap) * snap;
  };

  const RESIZE_THRESHOLD_PX = 12;

  const handleDragMove = (position: number, rowIndex: number) => {
    if (resizeStateRef.current) {
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

      // Update all items in the same group
      newItems.forEach((item, index) => {
        if (item.group === groupId) {
          if (index === dragState.itemIndex) {
            // Update dragged item with both x and row
            newItems[index] = {
              ...item,
              x: newX,
              row: newRow
            };
          } else {
            // Update other items in group: only x position (horizontal movement affects all)
            // Row stays the same for other items (vertical movement only affects dragged item)
            newItems[index] = {
              ...item,
              x: newX
            };
          }
        }
      });

      return newItems;
    });
  };

  const handleResizeMove = (position: number) => {
    if (!resizeStateRef.current) return;

    const resizeState = resizeStateRef.current;
    const deltaPosition = position - resizeState.startPosition;

    setItems((prevItems) => {
      const newItems = [...prevItems];
      const resizedItem = newItems[resizeState.itemIndex];
      const groupId = resizedItem.group;

      if (resizeState.edge === 'right') {
        // Resize from right edge
        let newWidth = resizeState.originalWidth + deltaPosition;
        newWidth = Math.max(minItemWidth, Math.min(maxItemWidth, newWidth));
        if (snap) {
          newWidth = snapPosition(newWidth);
        }

        // Update all items in the same group with the new width
        newItems.forEach((item, index) => {
          if (item.group === groupId) {
            newItems[index] = {
              ...item,
              width: newWidth
            };
          }
        });
      } else {
        // Resize from left edge
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

        // Update all items in the same group with the new x and width
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
  };

  const handleTimelineMouseMove = (e: TimelineMouseEvent) => {
    handleDragMove(e.position, e.rowIndex);
  };

  const updateScrollLock = (isDragging: boolean) => {
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
  };

  const handleTimelineMouseDown = (e: TimelineMouseEvent) => {
    // Only store click state if not dragging or resizing
    if (!dragStateRef.current && !resizeStateRef.current) {
      timelineClickStateRef.current = {
        mouseDownPosition: e.position,
        mouseDownRow: e.rowIndex
      };
    }
  };

  const handleTimelineMouseUp = (e: TimelineMouseEvent) => {
    const hadDrag = dragStateRef.current !== null;
    const hadResize = resizeStateRef.current !== null;

    if (dragStateRef.current) {
      dragStateRef.current = null;
      updateScrollLock(false);
      timelineClickStateRef.current = {
        mouseDownPosition: null,
        mouseDownRow: null
      };
      return;
    }
    if (resizeStateRef.current) {
      resizeStateRef.current = null;
      updateScrollLock(false);
      timelineClickStateRef.current = {
        mouseDownPosition: null,
        mouseDownRow: null
      };
      return;
    }

    // Don't open dialog if there was any dragging or resizing
    if (hadDrag || hadResize) {
      timelineClickStateRef.current = {
        mouseDownPosition: null,
        mouseDownRow: null
      };
      return;
    }

    // Check if it was a simple click (not a drag)
    const clickState = timelineClickStateRef.current;
    if (
      clickState.mouseDownPosition !== null &&
      clickState.mouseDownRow !== null &&
      Math.abs(e.position - clickState.mouseDownPosition) < 5 &&
      e.rowIndex === clickState.mouseDownRow &&
      !dragStateRef.current &&
      !resizeStateRef.current
    ) {
      // It was a click, open the dialog
      setCreateItemData({
        position: e.position,
        rowIndex: e.rowIndex
      });
      setIsCreateDialogOpen(true);
      setNewItemName('');
      setNewItemLabel('');
      setNewItemWidth(200);
      setNewItemCount(1);
    }

    timelineClickStateRef.current = {
      mouseDownPosition: null,
      mouseDownRow: null
    };
  };

  const handleCreateItem = () => {
    if (!createItemData || !newItemName.trim()) return;

    // Find the maximum group ID and add 1 for the new items
    const maxGroup = Math.max(...items.map((item) => Number(item.group)), -1);
    const newGroup = maxGroup + 1;

    // Snap the position if snap is enabled
    const snappedPosition = snap
      ? snapPosition(createItemData.position)
      : createItemData.position;
    const snappedWidth = snap ? snapPosition(newItemWidth) : newItemWidth;

    const itemCount = Math.max(1, Math.floor(newItemCount));
    const newItems: TimelineItemData[] = [];

    // Create multiple items in the same group, placed on consecutive rows
    for (let i = 0; i < itemCount; i++) {
      newItems.push({
        type: 'default',
        width: Math.max(minItemWidth, Math.min(maxItemWidth, snappedWidth)),
        row: createItemData.rowIndex + i,
        x: Math.max(0, snappedPosition),
        group: newGroup,
        data: {
          name: newItemName.trim(),
          label: newItemLabel.trim() || undefined
        }
      });
    }

    setItems((prevItems) => [...prevItems, ...newItems]);
    setIsCreateDialogOpen(false);
    setCreateItemData(null);
    setNewItemName('');
    setNewItemLabel('');
    setNewItemWidth(200);
    setNewItemCount(1);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    const snappedWidth = snap ? snapPosition(editItemWidth) : editItemWidth;
    const constrainedWidth = Math.max(
      minItemWidth,
      Math.min(maxItemWidth, snappedWidth)
    );

    setItems((prevItems) => {
      const newItems = [...prevItems];
      const itemToUpdate = newItems[editingItem.itemIndex];
      const groupId = itemToUpdate.group;

      // Update all items in the same group with the new width and data
      newItems.forEach((item, index) => {
        if (item.group === groupId) {
          newItems[index] = {
            ...item,
            width: constrainedWidth,
            data: {
              ...item.data,
              name: editItemName.trim(),
              label: editItemLabel.trim() || undefined
            }
          };
        }
      });

      return newItems;
    });

    setIsEditDialogOpen(false);
    setEditingItem(null);
    setEditItemName('');
    setEditItemLabel('');
    setEditItemWidth(200);
  };

  const handleDeleteItem = () => {
    if (!editingItem) return;

    setItems((prevItems) => {
      const itemToDelete = prevItems[editingItem.itemIndex];
      const groupId = itemToDelete.group;

      // Delete all items in the same group
      return prevItems.filter((item) => item.group !== groupId);
    });

    setIsEditDialogOpen(false);
    setEditingItem(null);
    setEditItemName('');
    setEditItemLabel('');
    setEditItemWidth(200);
  };

  const handleItemMouseDown = (e: TimelineItemMouseEvent) => {
    const mouseEvent = e.event as MouseEvent;
    const target = mouseEvent.target as HTMLElement;
    if (!target) return;

    const itemElement = target.closest('[data-timeline-item]') as HTMLElement;
    if (!itemElement) return;

    const itemRect = itemElement.getBoundingClientRect();
    const pixelPosition = mouseEvent.clientX - itemRect.left;

    const isNearLeftEdge = pixelPosition < RESIZE_THRESHOLD_PX;
    const isNearRightEdge =
      pixelPosition > itemRect.width - RESIZE_THRESHOLD_PX;

    // Find the actual item that was clicked (might be a bottom item in a merged group)
    let actualItemIndex = e.itemIndex;
    let actualItem = e.item;

    // If the clicked row is different from the rendered item's row, find the correct item
    if (e.rowIndex !== e.item.row) {
      const clickedItem = items.find(
        (item, index) =>
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

    if (isNearLeftEdge || isNearRightEdge) {
      resizeStateRef.current = {
        itemIndex: actualItemIndex,
        edge: isNearLeftEdge ? 'left' : 'right',
        originalX: actualItem.x,
        originalWidth: actualItem.width,
        startPosition: e.position
      };
      updateScrollLock(true);
    } else {
      dragStateRef.current = {
        itemIndex: actualItemIndex,
        originalX: actualItem.x,
        originalRow: actualItem.row,
        startPosition: e.position,
        startRow: e.rowIndex,
        hasMoved: false
      };
      updateScrollLock(true);
    }
  };

  const handleItemMouseMove = (e: TimelineItemMouseEvent) => {
    handleDragMove(e.position, e.rowIndex);
  };

  const updateItem = (e: TimelineItemMouseEvent) => {
    const hadResize = resizeStateRef.current !== null;
    const wasDragging = dragStateRef.current?.hasMoved || false;

    let actualItemIndex = e.itemIndex;
    let actualItem = e.item;

    if (e.rowIndex !== e.item.row) {
      const clickedItem = items.find(
        (item, index) =>
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

    if (hadResize || wasDragging) {
      return;
    }

    setEditingItem({
      itemIndex: actualItemIndex,
      item: actualItem
    });

    setEditItemName((actualItem.data.name as string) || '');
    setEditItemLabel((actualItem.data.label as string) || '');
    setEditItemWidth(actualItem.width);
    setIsEditDialogOpen(true);
  }

  const handleItemMouseUp = (e: TimelineItemMouseEvent) => {
    

    if (dragStateRef.current) {
      dragStateRef.current = null;
      updateScrollLock(false);
    }
    if (resizeStateRef.current) {
      resizeStateRef.current = null;
      updateScrollLock(false);
    }

    updateItem(e); 
  };

  const handleItemClick = (e: TimelineItemMouseEvent) => {};

  const handleItemTouchStart = (e: TimelineItemMouseEvent) => {
    (e.event as TouchEvent).preventDefault();

    const touchEvent = e.event as TouchEvent;
    const touch = touchEvent.touches[0];
    if (!touch) return;

    const target = touchEvent.target as HTMLElement;
    if (!target) return;

    const itemElement = target.closest('[data-timeline-item]') as HTMLElement;
    if (!itemElement) return;

    const itemRect = itemElement.getBoundingClientRect();
    const pixelPosition = touch.clientX - itemRect.left;

    const isNearLeftEdge = pixelPosition < RESIZE_THRESHOLD_PX;
    const isNearRightEdge =
      pixelPosition > itemRect.width - RESIZE_THRESHOLD_PX;

    // Find the actual item that was clicked (might be a bottom item in a merged group)
    let actualItemIndex = e.itemIndex;
    let actualItem = e.item;

    // If the clicked row is different from the rendered item's row, find the correct item
    if (e.rowIndex !== e.item.row) {
      const clickedItem = items.find(
        (item, index) =>
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

    if (isNearLeftEdge || isNearRightEdge) {
      // Start resize immediately for touch
      resizeStateRef.current = {
        itemIndex: actualItemIndex,
        edge: isNearLeftEdge ? 'left' : 'right',
        originalX: actualItem.x,
        originalWidth: actualItem.width,
        startPosition: e.position
      };
      panStateRef.current = null;
      updateScrollLock(true);
    } else {
      dragStateRef.current = {
        itemIndex: actualItemIndex,
        originalX: actualItem.x,
        originalRow: actualItem.row,
        startPosition: e.position,
        startRow: e.rowIndex,
        hasMoved: false
      };
      panStateRef.current = null;
      updateScrollLock(true);
    }
  };

  const handleItemTouchMove = (e: TimelineItemMouseEvent) => {
    if (resizeStateRef.current) {
      handleResizeMove(e.position);
      (e.event as TouchEvent).preventDefault();
    } else if (dragStateRef.current) {
      handleDragMove(e.position, e.rowIndex);
      (e.event as TouchEvent).preventDefault();
    }

    if (panStateRef.current) {
      panStateRef.current = null;
    }
  };

  const handleItemTap = (e: TimelineItemMouseEvent) => {
    handleItemClick(e);
  };

  const handleItemTouchEnd = (e: TimelineItemMouseEvent) => {
    const hadDrag = dragStateRef.current !== null;
    const hadResize = resizeStateRef.current !== null;
    const wasDragging = dragStateRef.current?.hasMoved || false;

    if (resizeStateRef.current) {
      resizeStateRef.current = null;
      updateScrollLock(false);
      return;
    }
    if (dragStateRef.current) {
      dragStateRef.current = null;
      updateScrollLock(false);

      // Only open edit dialog if there was no actual dragging
      if (!wasDragging) {
        updateItem(e);
      }
      return;
    }

    updateItem(e);
  };

  const handleTimelineTouchMove = (e: TimelineMouseEvent) => {
    if (resizeStateRef.current) {
      handleResizeMove(e.position);
      (e.event as TouchEvent).preventDefault();
      if (panStateRef.current) {
        panStateRef.current = null;
      }
      return;
    }
    if (dragStateRef.current) {
      handleDragMove(e.position, e.rowIndex);
      (e.event as TouchEvent).preventDefault();
      if (panStateRef.current) {
        panStateRef.current = null;
      }
      return;
    }

    if (panStateRef.current && !dragStateRef.current) {
      const touchEvent = e.event as TouchEvent;
      const touch = touchEvent.touches[0];
      if (touch) {
        const timelineElement = document.querySelector(
          '.overflow-auto'
        ) as HTMLElement;
        if (timelineElement && panStateRef.current) {
          const panState = panStateRef.current;
          const deltaX = panState.startX - touch.clientX;
          const deltaY = panState.startY - touch.clientY;
          timelineElement.scrollLeft = panState.startScrollLeft + deltaX;
          timelineElement.scrollTop = panState.startScrollTop + deltaY;

          touchEvent.preventDefault();
        }
      }
    }
  };

  const handleTimelineTouchEnd = (e: TimelineMouseEvent) => {
    if (resizeStateRef.current) {
      resizeStateRef.current = null;
      updateScrollLock(false);
    }
    if (dragStateRef.current) {
      dragStateRef.current = null;
      updateScrollLock(false);
    }
    if (panStateRef.current) {
      panStateRef.current = null;
    }
  };

  const handleTimelineTouchStart = (e: TimelineMouseEvent) => {
    if (resizeStateRef.current || dragStateRef.current) {
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
  };

  return (
    <main className=''>
      <NewTimeline
        cols={cols}
        columnWidth={columnWidth}
        renderColumn={(x, index) => {
          const hoursOffset = x / columnWidth;
          const totalHours = startHour + hoursOffset;
          const hours = Math.floor(totalHours);
          const minutes = Math.floor((totalHours - hours) * 60);
          return formatTime(hours, minutes);
        }}
        onMouseDown={handleTimelineMouseDown}
        onMouseMove={handleTimelineMouseMove}
        onMouseUp={handleTimelineMouseUp}
        onItemMouseDown={handleItemMouseDown}
        onItemMouseMove={handleItemMouseMove}
        onItemMouseUp={handleItemMouseUp}
        onItemClick={handleItemClick}
        onTouchStart={handleTimelineTouchStart}
        onTouchMove={handleTimelineTouchMove}
        onTouchEnd={handleTimelineTouchEnd}
        onItemTouchStart={handleItemTouchStart}
        onItemTouchMove={handleItemTouchMove}
        onItemTouchEnd={handleItemTouchEnd}
        categories={defaultCategories}
        itemComponents={{
          default: DefaultTimelineItem,
          placeholder: PlaceholderItem
        }}
        items={items}
      />
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Create a new timeline item at position{' '}
              {createItemData?.position.toFixed(0)} on row{' '}
              {createItemData?.rowIndex}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder='Item name'
                autoFocus
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='label'>Label (optional)</Label>
              <Input
                id='label'
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                placeholder='Item label'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='width'>Width</Label>
              <Input
                id='width'
                type='number'
                value={newItemWidth}
                onChange={(e) => setNewItemWidth(Number(e.target.value))}
                min={minItemWidth}
                max={maxItemWidth}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='count'>Number of items in group</Label>
              <Input
                id='count'
                type='number'
                value={newItemCount}
                onChange={(e) =>
                  setNewItemCount(
                    Math.max(1, Math.floor(Number(e.target.value) || 1))
                  )
                }
                min={1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateItem} disabled={!newItemName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Edit or delete the timeline item
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='edit-name'>Name</Label>
              <Input
                id='edit-name'
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                placeholder='Item name'
                autoFocus
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-label'>Label (optional)</Label>
              <Input
                id='edit-label'
                value={editItemLabel}
                onChange={(e) => setEditItemLabel(e.target.value)}
                placeholder='Item label'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-width'>Width</Label>
              <Input
                id='edit-width'
                type='number'
                value={editItemWidth}
                onChange={(e) => setEditItemWidth(Number(e.target.value))}
                min={minItemWidth}
                max={maxItemWidth}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='destructive' onClick={handleDeleteItem}>
              Delete
            </Button>
            <Button
              variant='outline'
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateItem} disabled={!editItemName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
