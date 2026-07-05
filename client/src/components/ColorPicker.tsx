import React from 'react';

import { COLORS } from '../utils/colors';

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, setColor }) => {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-gray-500 mb-1">Colors</label>
      <div className="flex gap-1 flex-wrap w-48">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
              color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-110'
            }`}
            style={{ backgroundColor: c, border: c === '#FFFFFF' ? '1px solid #e5e7eb' : 'none' }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
