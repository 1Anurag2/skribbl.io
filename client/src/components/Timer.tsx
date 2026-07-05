import React from 'react';

interface TimerProps {
  time: number;
}

const Timer: React.FC<TimerProps> = ({ time }) => {
  // Color changes based on time left
  const colorClass = time > 30 ? 'text-green-600' : time > 10 ? 'text-yellow-500' : 'text-red-600 animate-pulse';

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 border rounded-full w-16 h-16 shadow-inner">
      <span className={`text-2xl font-black ${colorClass}`}>
        {time}
      </span>
    </div>
  );
};

export default Timer;
