import { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { SeatPosition } from '@/lib/types';
import { GripVertical, X, Plus, LayoutGrid, DoorOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableSeatProps {
  seat: SeatPosition;
  index: number;
  onRemove: (index: number) => void;
  onRename: (index: number, label: string) => void;
  highlight?: boolean;
  studentName?: string;
  readonly?: boolean;
}

function DraggableSeat({
  seat,
  index,
  onRemove,
  onRename,
  highlight,
  studentName,
  readonly,
}: DraggableSeatProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `seat-${index}`,
    disabled: readonly,
  });

  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(seat.label);

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const handleDoubleClick = () => {
    if (readonly) return;
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    if (label.trim() && label !== seat.label) {
      onRename(index, label.trim());
    } else {
      setLabel(seat.label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: seat.x,
        top: seat.y,
        ...style,
      }}
      className={cn(
        'flex flex-col items-center gap-1 select-none z-10',
        readonly ? 'cursor-default' : 'cursor-move',
      )}
    >
      <div
        className={cn(
          'group relative flex h-[72px] w-24 flex-col items-center justify-center rounded-2xl border transition-all duration-150 p-1.5',
          highlight
            ? 'border-primary ring-4 ring-primary/25 bg-primary-light shadow-md scale-105'
            : 'border-gray-200 bg-white shadow-2xs hover:border-primary/60 hover:shadow-md',
        )}
      >
        {!readonly && (
          <button
            type="button"
            {...listeners}
            {...attributes}
            className="absolute -top-2 -right-2 hidden h-6 w-6 cursor-grab items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 shadow-sm group-hover:flex hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <GripVertical size={13} />
          </button>
        )}

        {!readonly && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="absolute -top-2 -left-2 hidden h-6 w-6 items-center justify-center rounded-full bg-white border border-red-200 text-red-500 shadow-sm group-hover:flex hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        )}

        {editing ? (
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-16 text-center text-sm font-bold text-gray-900 bg-transparent border-b-2 border-primary outline-none"
          />
        ) : (
          <span
            onDoubleClick={handleDoubleClick}
            className="text-sm font-bold text-gray-900 tracking-wide cursor-pointer"
          >
            {seat.label}
          </span>
        )}

        {studentName ? (
          <div className="mt-1 w-full truncate rounded-md bg-gray-100/90 px-1.5 py-0.5 text-center text-[10px] font-medium text-gray-700 border border-gray-200/50">
            {studentName}
          </div>
        ) : !readonly ? (
          <span className="text-[10px] text-gray-400 mt-0.5 font-medium">
            Empty
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface SeatCanvasProps {
  seats: SeatPosition[];
  onChange: (seats: SeatPosition[]) => void;
  assignments?: { seatIndex: number; studentName: string }[];
  highlightStudent?: string;
  readonly?: boolean;
}

export function SeatCanvas({
  seats,
  onChange,
  assignments,
  highlightStudent,
  readonly,
}: SeatCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const nextLabel = useRef(seats.length + 1);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const { setNodeRef } = useDroppable({ id: 'canvas' });

  const addSeat = useCallback(() => {
    nextLabel.current++;
    const row = Math.floor(seats.length / 5);
    const col = seats.length % 5;
    const newSeat: SeatPosition = {
      label: `${String.fromCharCode(65 + row)}${col + 1}`,
      x: 40 + col * 130,
      y: 60 + row * 105,
    };
    onChange([...seats, newSeat]);
  }, [seats, onChange]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { delta, active } = event;
      const index = parseInt(active.id.toString().replace('seat-', ''));
      if (isNaN(index)) return;

      const updated = [...seats];
      updated[index] = {
        ...updated[index],
        x: Math.max(20, updated[index].x + delta.x),
        y: Math.max(50, updated[index].y + delta.y),
      };
      onChange(updated);
    },
    [seats, onChange],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(seats.filter((_, i) => i !== index));
    },
    [seats, onChange],
  );

  const handleRename = useCallback(
    (index: number, label: string) => {
      const updated = [...seats];
      updated[index] = { ...updated[index], label };
      onChange(updated);
    },
    [seats, onChange],
  );

  const getStudentForSeat = (index: number) => {
    if (!assignments) return undefined;
    const a = assignments.find((a) => a.seatIndex === index);
    return a?.studentName;
  };

  const isHighlighted = (index: number) => {
    if (!highlightStudent || !assignments) return false;
    const a = assignments.find((a) => a.seatIndex === index);
    return a?.studentName
      .toLowerCase()
      .includes(highlightStudent.toLowerCase());
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {!readonly && (
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={addSeat}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={16} />
            Add Seat
          </button>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200/60">
            {seats.length} seat{seats.length !== 1 ? 's' : ''} configured
          </span>
        </div>
      )}

      <div
        ref={(node) => {
          setNodeRef(node);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvasRef as any).current = node;
        }}
        className="relative w-full min-h-[520px] rounded-2xl border-2 border-dashed border-gray-300/80 bg-gray-50/40 transition-colors overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(#d1d5db 1.25px, transparent 1.25px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Front / Board indicator */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-xs px-4 py-1 text-[11px] font-semibold tracking-wider text-gray-500 uppercase shadow-2xs border border-gray-200/80 select-none z-0">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Front / Blackboard
        </div>

        {/* Door indicator */}
        <div className="absolute bottom-3.5 right-5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase select-none z-0">
          <DoorOpen size={14} className="text-gray-400" />
          <span>Door</span>
        </div>

        {seats.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-2xs mb-3 text-gray-400">
              <LayoutGrid size={26} />
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">
              {readonly ? 'No seats in this floor plan' : 'No seats placed yet'}
            </p>
            <p className="text-xs text-gray-400 max-w-xs">
              {readonly
                ? 'This classroom layout currently has no seats configured.'
                : 'Click "+ Add Seat" above to start placing student desks onto the room canvas.'}
            </p>
          </div>
        )}

        {seats.map((seat, i) => (
          <DraggableSeat
            key={`${seat.label}-${i}`}
            seat={seat}
            index={i}
            onRemove={handleRemove}
            onRename={handleRename}
            highlight={isHighlighted(i)}
            studentName={getStudentForSeat(i)}
            readonly={readonly}
          />
        ))}
      </div>
    </DndContext>
  );
}
