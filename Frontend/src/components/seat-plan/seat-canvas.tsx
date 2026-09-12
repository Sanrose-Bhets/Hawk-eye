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
import { GripVertical, X } from 'lucide-react';
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
        'flex flex-col items-center gap-1 select-none',
        highlight && 'ring-4 ring-primary ring-offset-2 rounded-2xl',
      )}
    >
      <div
        className={cn(
          'group relative flex h-16 w-20 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all',
          highlight
            ? 'border-primary bg-primary-light'
            : 'border-gray-300 bg-white hover:border-primary hover:bg-gray-50',
          readonly && 'cursor-default',
        )}
      >
        {!readonly && (
          <button
            {...listeners}
            {...attributes}
            className="absolute -top-2 -right-2 hidden cursor-grab rounded-full bg-gray-200 p-0.5 group-hover:block hover:bg-gray-300"
          >
            <GripVertical size={14} />
          </button>
        )}

        {!readonly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="absolute -top-2 -left-2 hidden rounded-full bg-red-100 p-0.5 text-red-500 group-hover:block hover:bg-red-200"
          >
            <X size={14} />
          </button>
        )}

        {editing ? (
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-14 text-center text-sm font-semibold bg-transparent border-b border-primary outline-none"
          />
        ) : (
          <span
            onDoubleClick={handleDoubleClick}
            className="text-sm font-semibold text-gray-700 cursor-pointer"
          >
            {seat.label}
          </span>
        )}

        {studentName && (
          <span className="mt-0.5 max-w-[72px] truncate text-[10px] text-gray-500 px-1">
            {studentName}
          </span>
        )}
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
  showSeatCount?: boolean;
}

export function SeatCanvas({
  seats,
  onChange,
  assignments,
  highlightStudent,
  readonly,
  showSeatCount = true,
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
      x: 40 + col * 120,
      y: 40 + row * 100,
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
        x: updated[index].x + delta.x,
        y: updated[index].y + delta.y,
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
      {showSeatCount && (
        <div className="flex items-center gap-3 mb-4">
          {!readonly && (
            <button
              onClick={addSeat}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer"
            >
              + Add Seat
            </button>
          )}
          <span className="text-sm text-gray-500">
            {seats.length} seat{seats.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div
        ref={(node) => {
          setNodeRef(node);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvasRef as any).current = node;
        }}
        className="relative w-full min-h-[500px] rounded-2xl border-2 border-dashed border-gray-300 bg-white overflow-visible"
      >
        {seats.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            {readonly
              ? 'No seats in this plan'
              : "Click 'Add Seat' to start building your floor plan"}
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
