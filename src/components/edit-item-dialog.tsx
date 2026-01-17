import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TimelineItemData } from '@/components/timeline/types';
import { UseTimelineItemsReturn } from '@/components/timeline/use-timeline-items';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: {
    itemIndex: number;
    item: TimelineItemData;
  } | null;
  timelineItems: UseTimelineItemsReturn;
  minItemWidth: number;
  maxItemWidth: number;
}

export function EditItemDialog({
  open,
  onOpenChange,
  editingItem,
  timelineItems,
  minItemWidth,
  maxItemWidth
}: EditItemDialogProps) {
  const [editItemName, setEditItemName] = useState('');
  const [editItemLabel, setEditItemLabel] = useState('');
  const [editItemWidth, setEditItemWidth] = useState(200);

  useEffect(() => {
    if (open && editingItem) {
      setEditItemName((editingItem.item.data.name as string) || '');
      setEditItemLabel((editingItem.item.data.label as string) || '');
      setEditItemWidth(editingItem.item.width);
    }
  }, [open, editingItem]);

  const handleUpdate = () => {
    if (!editingItem) return;

    timelineItems.updateItem(editingItem.itemIndex, {
      width: editItemWidth,
      data: {
        ...editingItem.item.data,
        name: editItemName.trim(),
        label: editItemLabel.trim() || undefined
      }
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!editingItem) return;

    const itemToDelete = timelineItems.items[editingItem.itemIndex];
    if (itemToDelete) {
      timelineItems.deleteItemGroup(itemToDelete.group);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant='destructive' onClick={handleDelete}>
            Delete
          </Button>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={!editItemName.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
