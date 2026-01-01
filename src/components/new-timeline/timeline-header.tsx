import { useTimelineContext } from '@/components/new-timeline/timeline-context';
import { ReactNode } from 'react';

function TimelineColumn({
  content,
  width
}: {
  content: ReactNode;
  width: number;
}) {
  return (
    <div
      style={{
        width: width
      }}
      className='border-r border-b border-border p-2 text-foreground'
    >
      {content}
    </div>
  );
}

export default function TimelineHeader() {
  const { cols, columnWidth, timelineWidth, renderColumn } = useTimelineContext();

  return (
    <div className='sticky top-0 z-10 flex bg-card'>
      {Array.from({ length: cols }, (_, index) => {
        const x = (timelineWidth / cols) * index;
        return (
          <TimelineColumn key={index} content={renderColumn(x, index)} width={columnWidth} />
        );
      })}
    </div>
  );
}
