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

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: {
    itemIndex: number;
    item: TimelineItemData;
  } | null;
  editItemName: string;
  onEditItemNameChange: (value: string) => void;
  editItemLabel: string;
  onEditItemLabelChange: (value: string) => void;
  editItemWidth: number;
  onEditItemWidthChange: (value: number) => void;
  minItemWidth: number;
  maxItemWidth: number;
  onUpdateItem: () => void;
  onDeleteItem: () => void;
}

export function EditItemDialog({
  open,
  onOpenChange,
  editingItem,
  editItemName,
  onEditItemNameChange,
  editItemLabel,
  onEditItemLabelChange,
  editItemWidth,
  onEditItemWidthChange,
  minItemWidth,
  maxItemWidth,
  onUpdateItem,
  onDeleteItem
}: EditItemDialogProps) {
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
              onChange={(e) => onEditItemNameChange(e.target.value)}
              placeholder='Item name'
              autoFocus
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='edit-label'>Label (optional)</Label>
            <Input
              id='edit-label'
              value={editItemLabel}
              onChange={(e) => onEditItemLabelChange(e.target.value)}
              placeholder='Item label'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='edit-width'>Width</Label>
            <Input
              id='edit-width'
              type='number'
              value={editItemWidth}
              onChange={(e) => onEditItemWidthChange(Number(e.target.value))}
              min={minItemWidth}
              max={maxItemWidth}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='destructive' onClick={onDeleteItem}>
            Delete
          </Button>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onUpdateItem} disabled={!editItemName.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
