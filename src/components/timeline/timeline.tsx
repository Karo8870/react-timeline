import { TimelineContextProvider } from '@/components/new-timeline/timeline-context';
import { flattenLevels } from '@/components/new-timeline/flatten-levels';
import { TimelineSidebar } from '@/components/new-timeline/timeline-sidebar';
import TimelineHeader from '@/components/new-timeline/timeline-header';
import TimelineContent from '@/components/new-timeline/timeline-content';
import {
  TimelineItemData,
  TimelineMouseEvent,
  TimelineItemMouseEvent,
  TimelineItemComponentProps,
  TimelineProps
} from '@/components/new-timeline/types';

export type {
  TimelineMouseEvent,
  TimelineItemMouseEvent,
  TimelineItemData,
  TimelineItemComponentProps
};

export { TimelineItemWrapper } from '@/components/new-timeline/timeline-item-wrapper';

export default function Timeline(props: TimelineProps) {
  const rows = flattenLevels(props.categories);

  const initialColumnWidth = props.columnWidth || 300;

  return (
    <TimelineContextProvider
      rows={rows}
      cols={props.cols}
      initialColumnWidth={initialColumnWidth}
      renderColumn={props.renderColumn}
    >
      <div className='grid h-dvh grid-cols-[auto_1fr] grid-rows-[auto_1fr] overflow-auto rounded-xl border border-border bg-background'>
        <div className='sticky top-0 left-0 z-20 border-r border-b border-border bg-card p-2' />
        <TimelineHeader />
        <TimelineSidebar />
        <TimelineContent {...props} />
      </div>
    </TimelineContextProvider>
  );
}
