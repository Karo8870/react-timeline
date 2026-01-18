import { useTimelineContext } from '@/components/timeline/timeline-context';
import { cn } from '@/lib/utils';
import { TimelineSidebarRowProps } from '@/components/timeline/types';
import { ComponentType } from 'react';

export function DefaultSidebarRow({
  category,
  level,
  currentIndex
}: TimelineSidebarRowProps) {
  const { rowHeight } = useTimelineContext();

  const height =
    category.children === undefined || category.children.length === 0
      ? `${rowHeight}px`
      : `${rowHeight * category.children.length}px`;

  if (level === 0) {
    return (
      <div
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed'
        }}
        className={cn(
          'border-r border-border py-1 text-center min-w-max text-foreground',
          currentIndex !== 0 && 'border-t'
        )}
      >
        {category.name}
      </div>
    );
  } else {
    return (
      <div
        className={cn(
          'border-r border-border text-center min-w-max text-foreground',
          currentIndex !== 0 && 'border-t'
        )}
      >
        {category.name}
      </div>
    );
  }
}

export function TimelineSidebar({
  sidebarRowComponent: SidebarRowComponent = DefaultSidebarRow
}: {
  sidebarRowComponent?: ComponentType<TimelineSidebarRowProps>;
}) {
  const { rows, rowHeight } = useTimelineContext();

  return (
    <div className='sticky left-0 z-10 flex border-border bg-card min-w-max'>
      {rows.map((level, levelIndex) => (
        <div key={levelIndex} className='flex flex-col min-w-max'>
          {level.map((category, categoryIndex) => {
            const height =
              category.children === undefined || category.children.length === 0
                ? rowHeight
                : rowHeight * category.children.length;

            return (
              <div key={category.key} style={{ height: `${height}px` }}>
                <SidebarRowComponent
                  category={category}
                  level={levelIndex}
                  currentIndex={categoryIndex}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
