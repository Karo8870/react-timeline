import { TimelineItemComponentProps } from '@/components/timeline/types';
import { TimelineItemWrapper } from '@/components/timeline/timeline-item-wrapper';

export function PlaceholderItem(props: TimelineItemComponentProps) {
  return (
    <TimelineItemWrapper
      {...props}
      className='border-muted-foreground/50 bg-muted/50 flex items-center justify-center overflow-hidden rounded-md border-2 border-dashed px-2 opacity-50'
    >
      <span className='text-muted-foreground text-sm'>Placeholder</span>
    </TimelineItemWrapper>
  );
}
