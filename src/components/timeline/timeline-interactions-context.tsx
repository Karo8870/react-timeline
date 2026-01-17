import { createContext, useContext, ReactNode } from 'react';
import { UseTimelineInteractionsReturn } from './interactions/use-timeline-interactions';

const TimelineInteractionsContext = createContext<UseTimelineInteractionsReturn | null>(null);

export function TimelineInteractionsProvider({
  value,
  children
}: {
  value: UseTimelineInteractionsReturn;
  children: ReactNode;
}) {
  return (
    <TimelineInteractionsContext.Provider value={value}>
      {children}
    </TimelineInteractionsContext.Provider>
  );
}

export function useTimelineInteractionsContext(): UseTimelineInteractionsReturn {
  const context = useContext(TimelineInteractionsContext);
  if (!context) {
    throw new Error(
      'useTimelineInteractionsContext must be used within TimelineInteractionsProvider'
    );
  }
  return context;
}

