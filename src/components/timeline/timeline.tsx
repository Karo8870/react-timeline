import { TimelineContextProvider } from '@/components/timeline/timeline-context';
import { TimelineInteractionsProvider } from '@/components/timeline/timeline-interactions-context';
import { flattenLevels } from '@/components/timeline/flatten-levels';
import { TimelineSidebar } from '@/components/timeline/timeline-sidebar';
import TimelineHeader from '@/components/timeline/timeline-header';
import TimelineContent from '@/components/timeline/timeline-content';
import { useTimelineInteractions } from '@/components/timeline/interactions/use-timeline-interactions';
import {
  TimelineItemData,
  TimelineMouseEvent,
  TimelineItemMouseEvent,
  TimelineItemComponentProps,
  TimelineProps
} from '@/components/timeline/types';

export type {
  TimelineMouseEvent,
  TimelineItemMouseEvent,
  TimelineItemData,
  TimelineItemComponentProps
};

export { TimelineItemWrapper } from '@/components/timeline/timeline-item-wrapper';
export { useTimelineInteractionsContext } from '@/components/timeline/timeline-interactions-context';
export { useTimelineItems } from '@/components/timeline/use-timeline-items';
export type { UseTimelineItemsReturn } from '@/components/timeline/use-timeline-items';
export type { DragOptions, ResizeOptions } from '@/components/timeline/types';

export default function Timeline(props: TimelineProps) {
  const rows = flattenLevels(props.categories);
  const initialColumnWidth = props.columnWidth || 300;

  const setItems = (updater: React.SetStateAction<TimelineItemData[]>) => {
    if (props.onItemsChange) {
      const newItems = typeof updater === 'function' ? updater(props.items || []) : updater;
      props.onItemsChange(newItems);
    }
  };

  const interactions = useTimelineInteractions({
    items: props.items || [],
    setItems,
    snap: props.snap,
    minItemWidth: props.minItemWidth,
    maxItemWidth: props.maxItemWidth,
    drag: props.drag,
    resize: props.resize,
    onTimelineClick: props.onClick,
    onItemClick: props.onItemClick
  });

  return (
    <TimelineContextProvider
      rows={rows}
      cols={props.cols}
      initialColumnWidth={initialColumnWidth}
      renderColumn={props.renderColumn}
    >
      <TimelineInteractionsProvider value={interactions}>
        <div className='grid h-dvh grid-cols-[auto_1fr] grid-rows-[auto_1fr] overflow-auto rounded-xl border border-border bg-background'>
          <div className='sticky top-0 left-0 z-20 border-r border-b border-border bg-card p-2' />
          <TimelineHeader />
          <TimelineSidebar />
          <TimelineContent
            items={props.items || []}
            itemComponents={props.itemComponents}
            onMouseDown={interactions.handleTimelineMouseDown}
            onMouseUp={interactions.handleTimelineMouseUp}
            onMouseMove={interactions.handleTimelineMouseMove}
            onClick={props.onClick}
            onItemMouseDown={interactions.handleItemMouseDown}
            onItemMouseUp={interactions.handleItemMouseUp}
            onItemMouseMove={interactions.handleItemMouseMove}
            onItemClick={props.onItemClick}
            onTouchStart={interactions.handleTimelineTouchStart}
            onTouchEnd={interactions.handleTimelineTouchEnd}
            onTouchMove={interactions.handleTimelineTouchMove}
            onItemTouchStart={interactions.handleItemTouchStart}
            onItemTouchEnd={interactions.handleItemTouchEnd}
            onItemTouchMove={interactions.handleItemTouchMove}
          />
        </div>
      </TimelineInteractionsProvider>
    </TimelineContextProvider>
  );
}
