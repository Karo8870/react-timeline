import { useTimelineContext } from '@/components/new-timeline/timeline-context';
import { cn } from '@/lib/utils';
import { CategoryRow } from '@/components/new-timeline/types';

function FirstLevelCategory({
  category,
  currentIndex
}: {
  category: CategoryRow;
  currentIndex: number;
}) {
  const { rowHeight } = useTimelineContext();

  return (
      <div
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          height:
            category.children === undefined || category.children.length === 0
              ? `${rowHeight}px`
              : `${rowHeight * category.children.length}px`
        }}
        className={cn(
          'border-r border-border py-1 text-center min-w-max text-foreground',
          currentIndex !== 0 && 'border-t'
        )}
      >
        {category.name}
      </div>
  );
}

function SecondLevelCategory({
  category,
  currentIndex
}: {
  category: CategoryRow;
  currentIndex: number;
}) {
  const { rowHeight } = useTimelineContext();

  return (
    <div>
      <div
      style={{
        height:
          category.children === undefined || category.children.length === 0
            ? `${rowHeight}px`
            : `${rowHeight * category.children.length}px`
      }}
      className={cn(
        'border-r border-border text-center min-w-max text-foreground',
        currentIndex !== 0 && 'border-t'
      )}
    >
      {category.name}
    </div>
    </div>
  );
}

export function TimelineSidebar() {
  const { rows } = useTimelineContext();

  return (
    <div className='sticky left-0 z-10 flex border-border bg-card min-w-max'>
      {rows.map((level, index) => {
        if (index === 0) {
          return (
            <div key={index} className='flex flex-col'>
              {level.map((category, categoryIndex) => (
                <FirstLevelCategory
                  key={category.key}
                  category={category}
                  currentIndex={categoryIndex}
                />
              ))}
            </div>
          );
        } else {
          return (
            <div key={index} className='flex flex-col min-w-max'>
              {level.map((category, categoryIndex) => (
                <SecondLevelCategory
                  key={category.key}
                  category={category}
                  currentIndex={categoryIndex}
                />
              ))}
            </div>
          );
        }
      })}
    </div>
  );
}
