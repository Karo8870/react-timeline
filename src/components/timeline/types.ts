import { Key, ReactNode, ComponentType, RefObject, Dispatch, SetStateAction } from 'react';

// ============================================================================
// Category & Row Types
// ============================================================================

export interface CategoryRow {
  name: string;
  key: Key;
  children?: CategoryRow[];
}

export interface FlattenedItem extends CategoryRow {
  parentID: Key | null;
  innerIndex: number;
}

// ============================================================================
// Timeline Item Types
// ============================================================================

export interface TimelineItemData {
  type: string;
  width: number;
  row: number;
  x: number; // X position in timeline coordinate units
  group: string | number; // Group ID - items with same group move together horizontally and resize together
  data: Record<string, unknown>; // Custom properties for the item
}

// ============================================================================
// Event Types
// ============================================================================

export interface TimelineMouseEvent {
  event: MouseEvent | TouchEvent;
  position: number;
  rowIndex: number;
  rowKey: Key | null;
}

export interface TimelineItemMouseEvent extends TimelineMouseEvent {
  itemPosition: number;
  item: TimelineItemData;
  itemIndex: number;
}

// ============================================================================
// Event Handler Types
// ============================================================================

type EventHandlers<T> = {
  onMouseDown?: (e: T) => void;
  onMouseUp?: (e: T) => void;
  onMouseMove?: (e: T) => void;
  onClick?: (e: T) => void;
  onTouchStart?: (e: T) => void;
  onTouchEnd?: (e: T) => void;
  onTouchMove?: (e: T) => void;
};

export type TimelineEventHandlers = EventHandlers<TimelineMouseEvent>;

type ItemEventHandlers<T> = {
  onItemMouseDown?: (e: T) => void;
  onItemMouseUp?: (e: T) => void;
  onItemMouseMove?: (e: T) => void;
  onItemClick?: (e: T) => void;
  onItemTouchStart?: (e: T) => void;
  onItemTouchEnd?: (e: T) => void;
  onItemTouchMove?: (e: T) => void;
};

export type TimelineItemEventHandlers = ItemEventHandlers<TimelineItemMouseEvent>;

// ============================================================================
// Component Props Types
// ============================================================================

export interface TimelineItemComponentProps extends EventHandlers<TimelineItemMouseEvent> {
  item: TimelineItemData;
  itemIndex: number;
  pixelX: number;
  pixelWidth: number;
  pixelHeight: number;
  containerRef?: RefObject<HTMLDivElement | null>;
  items?: TimelineItemData[];
}

export interface TimelineItemWrapperProps extends TimelineItemComponentProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// Context Types
// ============================================================================

export type ColumnRenderer = (x: number, index: number) => ReactNode;

export interface TimelineContextInterface {
  rowHeight: number;
  setRowHeight: Dispatch<SetStateAction<number>>;
  columnWidth: number;
  setColumnWidth: Dispatch<SetStateAction<number>>;
  timelineWidth: number;
  cols: number;
  renderColumn: ColumnRenderer;
  rows: FlattenedItem[][];
}

export interface TimelineContextProviderProps {
  children: ReactNode;
  rows: FlattenedItem[][];
  cols: number;
  initialColumnWidth: number;
  renderColumn: ColumnRenderer;
}

// ============================================================================
// Main Component Props
// ============================================================================

export interface TimelineProps extends TimelineEventHandlers, TimelineItemEventHandlers {
  categories: CategoryRow[];
  cols: number;
  renderColumn: ColumnRenderer;
  columnWidth?: number;
  items?: TimelineItemData[];
  itemComponents?: Record<string, ComponentType<TimelineItemComponentProps>>;
}

export interface TimelineContentProps extends TimelineEventHandlers, TimelineItemEventHandlers {
  items?: TimelineItemData[];
  itemComponents?: Record<string, ComponentType<TimelineItemComponentProps>>;
}
