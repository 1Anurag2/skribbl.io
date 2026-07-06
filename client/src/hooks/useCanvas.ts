import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { SocketEvents } from '../types';
import { StrokeData, Point } from '../../../shared/types';
import { DEFAULT_COLOR, DEFAULT_BRUSH_SIZE } from '../utils/constants';
import { drawLine, drawDot, clearCanvasContext } from '../utils/drawHelpers';

export const useCanvas = (isDrawer: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socket } = useSocket();
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);
  
  // History for undo feature
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    if (!socket || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save initial blank state
    if (history.length === 0) {
      setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }

    const handleDrawStart = (data: StrokeData) => {
      drawDot(ctx, data.start, data.color, data.size);
    };

    const handleDrawMove = (data: Point) => {
      // In a real implementation we would need the previous point, 
      // but the original code just uses ctx.lineTo which depends on internal state.
      // We will keep the path logic here for simplicity or refactor it slightly.
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    };

    const handleDrawEnd = () => {
      ctx.closePath();
      // Only the drawer manages history to broadcast it or everyone keeps their own
      setHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    };

    const handleClear = () => {
      clearCanvasContext(ctx, canvas.width, canvas.height);
      setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    };

    const handleUndo = () => {
      setHistory(prev => {
        if (prev.length <= 1) return prev; // Cannot undo past initial blank canvas
        const newHistory = prev.slice(0, -1);
        const lastState = newHistory[newHistory.length - 1];
        ctx.putImageData(lastState, 0, 0);
        return newHistory;
      });
    };

    socket.on(SocketEvents.DRAW_START, handleDrawStart);
    socket.on(SocketEvents.DRAW_MOVE, handleDrawMove);
    socket.on(SocketEvents.DRAW_END, handleDrawEnd);
    socket.on(SocketEvents.CANVAS_CLEAR, handleClear);
    socket.on(SocketEvents.UNDO, handleUndo);

    return () => {
      socket.off(SocketEvents.DRAW_START, handleDrawStart);
      socket.off(SocketEvents.DRAW_MOVE, handleDrawMove);
      socket.off(SocketEvents.DRAW_END, handleDrawEnd);
      socket.off(SocketEvents.CANVAS_CLEAR, handleClear);
      socket.off(SocketEvents.UNDO, handleUndo);
    };
  }, [socket, history]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && (e as React.TouchEvent).changedTouches.length > 0) {
      clientX = (e as React.TouchEvent).changedTouches[0].clientX;
      clientY = (e as React.TouchEvent).changedTouches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    // Scale coordinates if canvas style width/height differs from actual width/height
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !socket || !canvasRef.current) return;
    setIsDrawing(true);
    
    const { x, y } = getCoordinates(e);
    const startPoint: Point = { x, y };
    const data: StrokeData = { start: startPoint, end: startPoint, color, size: brushSize };
    
    socket.emit(SocketEvents.DRAW_START, data);
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      drawDot(ctx, startPoint, color, brushSize);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !isDrawing || !socket || !canvasRef.current) return;
    
    const { x, y } = getCoordinates(e);
    const point: Point = { x, y };
    socket.emit(SocketEvents.DRAW_MOVE, point);
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawer || !isDrawing || !socket || !canvasRef.current) return;
    setIsDrawing(false);
    socket.emit(SocketEvents.DRAW_END);
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.closePath();
      setHistory(prev => [...prev, ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height)]);
    }
  };

  const clearCanvas = () => {
    if (!isDrawer || !socket || !canvasRef.current) return;
    socket.emit(SocketEvents.CANVAS_CLEAR);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      clearCanvasContext(ctx, canvasRef.current.width, canvasRef.current.height);
      setHistory([ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)]);
    }
  };

  const undo = () => {
    if (!isDrawer || !socket || history.length <= 1) return;
    socket.emit(SocketEvents.UNDO);
    setHistory(prev => {
      const newHistory = prev.slice(0, -1);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
      }
      return newHistory;
    });
  };

  return {
    canvasRef,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    undo,
    color,
    setColor,
    brushSize,
    setBrushSize
  };
};
