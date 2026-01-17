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
import { UseTimelineItemsReturn } from '@/components/timeline/use-timeline-items';

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createItemData: {
    position: number;
    rowIndex: number;
  } | null;
  timelineItems: UseTimelineItemsReturn;
  minItemWidth: number;
  maxItemWidth: number;
}

export function CreateItemDialog({
  open,
  onOpenChange,
  createItemData,
  timelineItems,
  minItemWidth,
  maxItemWidth
}: CreateItemDialogProps) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemWidth, setNewItemWidth] = useState(200);
  const [newItemCount, setNewItemCount] = useState(1);

  useEffect(() => {
    if (open) {
      setNewItemName('');
      setNewItemLabel('');
      setNewItemWidth(200);
      setNewItemCount(1);
    }
  }, [open]);

  const handleCreate = () => {
    if (!createItemData || !newItemName.trim()) return;

    timelineItems.createItem({
      position: createItemData.position,
      rowIndex: createItemData.rowIndex,
      width: newItemWidth,
      type: 'default',
      data: {
        name: newItemName.trim(),
        label: newItemLabel.trim() || undefined
      },
      count: newItemCount
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                setNewItemCount(Math.max(1, Math.floor(Number(e.target.value) || 1)))
              }
              min={1}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!newItemName.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
