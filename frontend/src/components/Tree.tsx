import React from 'react';

interface TreeProps {
  userId: string;
  decorations: any; // Define proper type later
  isLocked: boolean;
}

export function Tree({ userId, decorations, isLocked }: TreeProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-blue-900 rounded-lg overflow-hidden">
      {/* Background / Snow */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-700 opacity-80"></div>

      {/* Tree SVG/Canvas */}
      <div
        className="relative z-10 w-64 h-80 bg-green-800 flex items-center justify-center"
        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
      >
        <span className="text-white">Tree for {userId}</span>
        {/* Render ornaments based on decorations */}
      </div>

      {isLocked && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <span className="text-white text-xl font-bold">🔒 Locked</span>
        </div>
      )}
    </div>
  );
}
