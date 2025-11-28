
import { useState, useRef, useEffect } from 'react';

interface Ornament {
  id: string;
  name: string;
  imageUrl: string;
}

interface TreeProps {
  userId: string;
  decorations: Record<string, { ornamentId: string; position: { x: number; y: number } }>;
  isLocked: boolean;
  isEditable?: boolean;
  inventory?: Ornament[]; // List of ornaments user owns (for decoration mode)
  allOrnaments?: Ornament[]; // List of all ornaments (for rendering)
  onSave?: (newDecorations: any) => void;
}

export function Tree({ decorations: initialDecorations, isLocked, isEditable, inventory, allOrnaments, onSave }: TreeProps) {
  const [decorations, setDecorations] = useState(initialDecorations || {});
  const [selectedOrnamentId, setSelectedOrnamentId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null); // Key of the decoration being dragged
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDecorations(initialDecorations || {});
  }, [initialDecorations]);

  const getOrnamentImage = (id: string) => {
    const ornament = allOrnaments?.find(o => o.id === id) || inventory?.find(o => o.id === id);
    return ornament?.imageUrl || 'https://placehold.co/50x50?text=?'; // Fallback
  };

  const handleMouseDown = (key: string, e: React.MouseEvent) => {
    if (!isEditable) return;
    e.stopPropagation();
    setIsDragging(key);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDecorations(prev => ({
      ...prev,
      [isDragging]: {
        ...prev[isDragging],
        position: { x, y }
      }
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleTreeClick = (e: React.MouseEvent) => {
    if (!isEditable || !selectedOrnamentId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newKey = `dec_${Date.now()}`;
    setDecorations(prev => ({
      ...prev,
      [newKey]: {
        ornamentId: selectedOrnamentId,
        position: { x, y }
      }
    }));
    setSelectedOrnamentId(null); // Deselect after placing
  };

  const handleSave = () => {
    if (onSave) {
      onSave(decorations);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/4] bg-blue-900 rounded-lg overflow-hidden cursor-pointer shadow-xl border-4 border-green-800"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleTreeClick}
      >
        {/* Background / Snow */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-blue-800"></div>

        {/* Tree Image (Using CSS or SVG) */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-3/4">
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl">
            <path d="M50 10 L10 100 L90 100 Z" fill="#166534" />
            <path d="M50 0 L20 60 L80 60 Z" fill="#15803d" />
            <path d="M50 20 L30 50 L70 50 Z" fill="#16a34a" />
            <rect x="40" y="100" width="20" height="20" fill="#78350f" />
          </svg>
        </div>

        {/* Render ornaments */}
        {Object.entries(decorations).map(([key, data]) => (
          <div
            key={key}
            className={`absolute w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 ${isEditable ? 'cursor-move' : ''}`}
            style={{ left: `${data.position.x}%`, top: `${data.position.y}%` }}
            onMouseDown={(e) => handleMouseDown(key, e)}
          >
            <img
              src={getOrnamentImage(data.ornamentId)}
              alt="ornament"
              className="w-full h-full object-contain drop-shadow-md"
              draggable={false}
            />
          </div>
        ))}

        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">🔒</div>
              <span className="text-xl font-bold">Tree is Locked</span>
            </div>
          </div>
        )}
      </div>

      {isEditable && (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-700">My Ornaments</h3>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold hover:bg-green-700 transition shadow-sm"
            >
              Save Tree
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {inventory?.map(ornament => (
              <div
                key={ornament.id}
                onClick={() => setSelectedOrnamentId(ornament.id)}
                className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg p-1 cursor-pointer transition-all ${selectedOrnamentId === ornament.id ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-slate-200 hover:border-green-300'}`}
              >
                <img src={ornament.imageUrl} alt={ornament.name} className="w-full h-full object-contain" />
              </div>
            ))}
            {(!inventory || inventory.length === 0) && (
              <p className="text-sm text-slate-500 py-2">No ornaments yet. Send messages to get some!</p>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {selectedOrnamentId ? 'Click on the tree to place the selected ornament.' : 'Select an ornament to place it.'}
          </p>
        </div>
      )}
    </div>
  );
}
