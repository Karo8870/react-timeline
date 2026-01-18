import { useTimelineContext } from '@/components/timeline/timeline-context';
import { TimelineHeaderCellProps } from '@/components/timeline/types';
import { ComponentType } from 'react';

export function DefaultHeaderCell({ content }: TimelineHeaderCellProps) {
  return (
    <div className='border-r border-b border-border p-2 text-foreground'>
      {content}
    </div>
  );
}

export default function TimelineHeader({
  headerCellComponent: HeaderCellComponent = DefaultHeaderCell
}: {
  headerCellComponent?: ComponentType<TimelineHeaderCellProps>;
}) {
  const { cols, columnWidth, timelineWidth, renderColumn } = useTimelineContext();

  return (
    <div className='sticky top-0 z-10 flex bg-card'>
      {Array.from({ length: cols }, (_, index) => {
        const x = (timelineWidth / cols) * index;
        return (
          <div key={index} style={{ width: columnWidth }}>
            <HeaderCellComponent content={renderColumn(x, index)} x={x} index={index} />
          </div>
        );
      })}
    </div>
  );
}
