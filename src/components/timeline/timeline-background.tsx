import { useTimelineContext } from '@/components/timeline/timeline-context';
import { useEffect, useRef, useCallback } from 'react';
import { useDrawGrid } from '@/components/timeline/use-draw-grid';

const ZOOM_CONFIG = {
  ROW_HEIGHT: { min: 44, max: 100 },
  COLUMN_WIDTH: { min: 50, max: 400 },
  WHEEL_SENSITIVITY: 10
} as const;

export default function TimelineBackground() {
  const { rows, cols, rowHeight, columnWidth, setRowHeight, setColumnWidth } =
    useTimelineContext();

  const rowCnt = rows.at(-1)?.length ?? 0;
  const colCnt = cols;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useDrawGrid(canvasRef, rowHeight, columnWidth, rowCnt, colCnt);

  const valuesRef = useRef({ rowHeight, columnWidth });
  const settersRef = useRef({ setRowHeight, setColumnWidth });

  useEffect(() => {
    valuesRef.current = { rowHeight, columnWidth };
  }, [rowHeight, columnWidth]);

  useEffect(() => {
    settersRef.current = { setRowHeight, setColumnWidth };
  }, [setRowHeight, setColumnWidth]);

  const shiftPressedRef = useRef<boolean>(false);

  const pinchStateRef = useRef<{
    initialDistance: number;
    initialRowHeight: number;
    initialColumnWidth: number;
    lockedAxis: 'horizontal' | 'vertical' | null;
  } | null>(null);

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAxisDirection = (
    touch1: Touch,
    touch2: Touch
  ): 'horizontal' | 'vertical' => {
    const dx = Math.abs(touch2.clientX - touch1.clientX);
    const dy = Math.abs(touch2.clientY - touch1.clientY);
    return dx > dy ? 'horizontal' : 'vertical';
  };

  const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
  };

  const applyZoom = (
    axis: 'horizontal' | 'vertical',
    newValue: number
  ): void => {
    if (axis === 'horizontal') {
      settersRef.current.setColumnWidth(
        clamp(
          newValue,
          ZOOM_CONFIG.COLUMN_WIDTH.min,
          ZOOM_CONFIG.COLUMN_WIDTH.max
        )
      );
    } else {
      settersRef.current.setRowHeight(
        clamp(newValue, ZOOM_CONFIG.ROW_HEIGHT.min, ZOOM_CONFIG.ROW_HEIGHT.max)
      );
    }
  };

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = getDistance(touch1, touch2);
      const axis = getAxisDirection(touch1, touch2);

      pinchStateRef.current = {
        initialDistance: distance,
        initialRowHeight: valuesRef.current.rowHeight,
        initialColumnWidth: valuesRef.current.columnWidth,
        lockedAxis: axis
      };
    }
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && pinchStateRef.current) {
      e.preventDefault();

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = getDistance(touch1, touch2);
      const scale = currentDistance / pinchStateRef.current.initialDistance;

      const axis = pinchStateRef.current.lockedAxis;
      if (!axis) return;

      if (axis === 'horizontal') {
        const newWidth = pinchStateRef.current.initialColumnWidth * scale;
        applyZoom('horizontal', newWidth);
      } else {
        const newHeight = pinchStateRef.current.initialRowHeight * scale;
        applyZoom('vertical', newHeight);
      }
    }
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      pinchStateRef.current = null;
    }
  }, []);

  const onTouchCancel = useCallback((e: TouchEvent) => {
    pinchStateRef.current = null;
  }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      const delta =
        e.deltaMode === WheelEvent.DOM_DELTA_PIXEL
          ? -e.deltaY
          : e.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? -e.deltaY * 16
            : -e.deltaY * 600;

      const zoomFactor = 1 + (delta * ZOOM_CONFIG.WHEEL_SENSITIVITY) / 1000;

      const axis = shiftPressedRef.current ? 'horizontal' : 'vertical';
      const currentValue =
        axis === 'horizontal'
          ? valuesRef.current.columnWidth
          : valuesRef.current.rowHeight;

      const newValue = currentValue * zoomFactor;
      applyZoom(axis, newValue);
    }
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      shiftPressedRef.current = true;
    }
  }, []);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      shiftPressedRef.current = false;
    }
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchCancel, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [
    onWheel,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onKeyDown,
    onKeyUp
  ]);

  return (
    <canvas ref={canvasRef} className='absolute top-0 left-0 h-full w-full' />
  );
}
