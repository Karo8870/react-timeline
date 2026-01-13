import { createContext, useContext, useState } from 'react';
import {
  TimelineContextInterface,
  TimelineContextProviderProps
} from '@/components/timeline/types';

const timelineContext = createContext<TimelineContextInterface | null>(null);

export function useTimelineContext() {
  return useContext(timelineContext)!;
}

export function TimelineContextProvider({
  children,
  rows,
  cols,
  initialColumnWidth,
  renderColumn
}: TimelineContextProviderProps) {
  const [rowHeight, setRowHeight] = useState<number>(40);
  const [columnWidth, setColumnWidth] = useState<number>(initialColumnWidth);

  const timelineWidth = initialColumnWidth * cols;

  const contextValue: TimelineContextInterface = {
    rowHeight,
    setRowHeight,
    columnWidth,
    setColumnWidth,
    timelineWidth,
    cols,
    renderColumn,
    rows
  };

  return (
    <timelineContext.Provider value={contextValue}>
      {children}
    </timelineContext.Provider>
  );
}
