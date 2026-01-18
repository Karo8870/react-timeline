import { useTimelineContext } from '@/components/timeline/timeline-context';
import { useRef } from 'react';
import { ComponentType } from 'react';
import { useTimelineMouseEvents, useTimelineTouchEvents } from '@/components/timeline/use-timeline-mouse-events';
import {
  TimelineItemData,
  TimelineItemComponentProps,
  TimelineMouseEvent,
  TimelineItemMouseEvent,
  TimelineContentProps
} from '@/components/timeline/types';

export type {
  TimelineItemData,
  TimelineItemComponentProps,
  TimelineMouseEvent,
  TimelineItemMouseEvent
};

export default function TimelineContent({
  items = [],
  itemComponents = {},
  backgroundComponent: BackgroundComponent,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onClick,
  onItemMouseDown,
  onItemMouseUp,
  onItemMouseMove,
  onItemClick,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onItemTouchStart,
  onItemTouchEnd,
  onItemTouchMove
}: TimelineContentProps & { backgroundComponent: ComponentType }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { rowHeight, columnWidth, cols, timelineWidth } = useTimelineContext();

  const mouseHandlers = useTimelineMouseEvents(containerRef, {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    onClick
  });

  const touchHandlers = useTimelineTouchEvents(
    containerRef,
    {
      onTouchStart,
      onTouchEnd,
      onTouchMove
    },
    false
  );

  const totalPixelWidth = columnWidth * cols;
  const scaleFactor = totalPixelWidth / timelineWidth;

  return (
    <div
      ref={containerRef}
      className='relative'
      {...mouseHandlers}
      {...touchHandlers}
    >
      <BackgroundComponent />
      {items.map((item, index) => {
        const pixelX = item.x * scaleFactor;
        const pixelWidth = item.width * scaleFactor;

        const ItemComponent = itemComponents[item.type];
        if (!ItemComponent) {
          console.warn(`No component registered for item type: ${item.type}`);
          return null;
        }

        return (
          <ItemComponent
            key={index}
            item={item}
            itemIndex={index}
            pixelX={pixelX}
            pixelWidth={pixelWidth}
            pixelHeight={rowHeight}
            containerRef={containerRef}
            items={items}
            onMouseDown={onItemMouseDown}
            onMouseUp={onItemMouseUp}
            onMouseMove={onItemMouseMove}
            onClick={onItemClick}
            onTouchStart={onItemTouchStart}
            onTouchEnd={onItemTouchEnd}
            onTouchMove={onItemTouchMove}
          />
        );
      })}
    </div>
  );
}
