import { RefObject, useEffect } from 'react';

export function useDrawGrid(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  rowHeight: number,
  columnWidth: number,
  rowCnt: number,
  colCnt: number
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    const cellWidth = columnWidth;
    const cellHeight = rowHeight;

    const root = document.documentElement;

    const isDark = root.classList.contains('dark');
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
    ctx.lineWidth = 1;

    for (let i = 1; i <= colCnt; i++) {
      const x = i * cellWidth;
      ctx.beginPath();
      ctx.moveTo(x - 0.5, 0);
      ctx.lineTo(x + 0.5, rect.height);
      ctx.stroke();
    }

    for (let i = 0; i <= rowCnt; i++) {
      const y = i * cellHeight;
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(rect.width, y + 0.5);
      ctx.stroke();
    }
  }, [colCnt, rowCnt, columnWidth, rowHeight]);
}
