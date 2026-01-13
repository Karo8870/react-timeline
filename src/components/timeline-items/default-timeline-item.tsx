import { TimelineItemComponentProps } from '@/components/timeline/types';
import { TimelineItemWrapper } from '../timeline/timeline-item-wrapper';

export function DefaultTimelineItem(props: TimelineItemComponentProps) {
  const name = (props.item.data.name as string) || '';
  const label = (props.item.data.label as string) || undefined;
  const RESIZE_THRESHOLD_PX = 12;

  const hasItemAbove = props.items?.some(
    (otherItem, otherIndex) =>
      otherIndex !== props.itemIndex &&
      otherItem.group === props.item.group &&
      otherItem.row === props.item.row - 1 &&
      otherItem.x === props.item.x &&
      otherItem.width === props.item.width
  );

  if (hasItemAbove) {
    return null;
  }

  let adjacentCount = 1;
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

  const totalHeight = props.pixelHeight * adjacentCount;

  return (
    <TimelineItemWrapper
      {...props}
      className='border-primary bg-primary/20 text-foreground flex flex-col items-start overflow-hidden rounded-md border-2 px-2'
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
