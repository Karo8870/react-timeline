import { useRef } from 'react';
import { TimelineItemWrapperProps } from '@/components/timeline/types';
import {
  useTimelineItemMouseEvents,
  useTimelineItemTouchEvents
} from '@/components/timeline/use-timeline-mouse-events';

export function TimelineItemWrapper({
  item,
  itemIndex,
  pixelX,
  pixelWidth,
  pixelHeight,
  containerRef,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onClick,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  children,
  className = '',
  style
}: TimelineItemWrapperProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  const mouseHandlers = useTimelineItemMouseEvents(
    itemRef,
    item,
    itemIndex,
    {
      onMouseDown,
      onMouseUp,
      onMouseMove,
      onClick
    },
    containerRef
  );

  const touchHandlers = useTimelineItemTouchEvents(
    itemRef,
    item,
    itemIndex,
    {
      onTouchStart,
      onTouchEnd,
      onTouchMove
    },
    containerRef,
    true
  );

  const finalHeight = style?.height ?? pixelHeight;

  return (
    <div
      ref={itemRef}
      data-timeline-item
      style={{
        width: pixelWidth,
        height: finalHeight,
        translate: `${pixelX}px ${pixelHeight * item.row + 0.5}px`,
        touchAction: 'none',
        ...style
      }}
      className={`absolute top-0 left-0 ${className}`}
      {...mouseHandlers}
      {...touchHandlers}
    >
      {children}
    </div>
  );
}
