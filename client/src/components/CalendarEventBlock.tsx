import { CalendarEventData } from '@/lib/types';
import { colorWithAlpha } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface CalendarEventBlockProps {
  title: string;
  icon: string;
  data: CalendarEventData;
  color: string;
  onTitleChange?: (title: string) => void;
  onDataChange?: (data: CalendarEventData) => void;
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  busy: 'Clock',
  meeting: 'Users',
  focus: 'Brain',
  travel: 'Plane',
  break: 'Coffee',
  lunch: 'Utensils',
  ooo: 'DoorOpen',
  holiday: 'Palmtree',
  deadline: 'AlertTriangle',
  workshop: 'BookOpen',
};

export function CalendarEventBlock({ title, icon, data, color, onTitleChange, onDataChange }: CalendarEventBlockProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const iconName = icon || EVENT_TYPE_ICONS[data.eventType] || 'Calendar';
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName] || LucideIcons.Calendar;
  const displayLabel = data.label || title;

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!onDataChange) return;
    e.stopPropagation();
    setDraft(displayLabel);
    setEditing(true);
  };

  const commit = () => {
    if (onDataChange && draft.trim()) {
      onDataChange({ ...data, label: draft.trim() });
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div
      className="w-full h-full flex items-center gap-1.5 px-2 rounded-lg overflow-hidden cursor-default select-none"
      style={{ backgroundColor: colorWithAlpha(color, 0.18), border: `1.5px solid ${colorWithAlpha(color, 0.45)}` }}
      onDoubleClick={handleDoubleClick}
    >
      <IconComponent className="w-3 h-3 shrink-0" style={{ color }} />
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs font-medium"
          style={{ color }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 min-w-0 text-xs font-semibold truncate" style={{ color }}>
          {displayLabel}
        </span>
      )}
    </div>
  );
}
