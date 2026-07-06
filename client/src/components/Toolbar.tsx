import React from 'react';
import ColorPicker from './ColorPicker';
import { Undo2, Trash2, Eraser } from 'lucide-react';
import { ERASER_COLOR, ERASER_BRUSH_SIZE, MIN_BRUSH_SIZE, MAX_BRUSH_SIZE } from '../utils/constants';

interface ToolbarProps {
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onUndo: () => void;
  onClear: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ color, setColor, brushSize, setBrushSize, onUndo, onClear }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-2 sm:p-4 bg-gray-50 rounded-lg shadow-inner w-full justify-between">
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
        <ColorPicker color={color} setColor={setColor} />
        
        <div className="flex flex-col ml-2 sm:ml-4">
          <label className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1">Brush ({brushSize}px)</label>
          <input 
            type="range" 
            min={MIN_BRUSH_SIZE}
            max={MAX_BRUSH_SIZE} 
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-20 sm:w-32 accent-indigo-600"
          />
        </div>
      </div>

      <div className="flex gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
        <button 
          onClick={() => {
            setColor(ERASER_COLOR);
            setBrushSize(ERASER_BRUSH_SIZE);
          }}
          className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 border rounded transition shadow-sm font-medium text-xs sm:text-sm ${color === ERASER_COLOR ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
          title="Eraser"
        >
          <Eraser size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Eraser</span>
        </button>
        <button 
          onClick={onUndo}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 transition shadow-sm text-gray-700 font-medium text-xs sm:text-sm"
          title="Undo"
        >
          <Undo2 size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Undo</span>
        </button>
        <button 
          onClick={onClear}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition shadow-sm text-red-600 font-medium text-xs sm:text-sm"
          title="Clear Canvas"
        >
          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
