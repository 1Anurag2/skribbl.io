import React from 'react';
import { useCanvas } from '../hooks/useCanvas';
import Toolbar from './Toolbar';

interface CanvasProps {
  isDrawer: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ isDrawer }) => {
  const {
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
  } = useCanvas(isDrawer);

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow w-full max-w-3xl">
      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white mb-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={(e) => {
            // Prevent default scrolling when drawing on canvas
            if (isDrawer) {
              e.preventDefault();
            }
            draw(e);
          }}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
          className={`bg-white ${isDrawer ? 'cursor-crosshair' : 'cursor-default'}`}
          style={{ width: '100%', height: 'auto', touchAction: 'none' }}
        />
        
        {/* Overlay if not drawer */}
        {!isDrawer && (
          <div className="absolute inset-0 bg-transparent z-10 pointer-events-auto" />
        )}
      </div>

      {isDrawer && (
        <Toolbar 
          color={color} 
          setColor={setColor} 
          brushSize={brushSize} 
          setBrushSize={setBrushSize} 
          onUndo={undo} 
          onClear={clearCanvas} 
        />
      )}
    </div>
  );
};

export default Canvas;
