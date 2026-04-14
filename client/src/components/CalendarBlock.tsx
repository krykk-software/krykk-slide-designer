import { useRef, useState, useEffect } from 'react';
import { CalendarData, CalendarEventItem, CALENDAR_EVENT_TYPES } from '@/lib/types';

interface CalendarBlockProps {
  title: string;
  data: CalendarData;
  color: string;
  onUpdate?: (updates: Partial<CalendarData>) => void;
  isInteractive?: boolean;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const d = new Date(year, month - 1, 1).getDay();
  return (d + 6) % 7;
}

function parseWeekStart(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isToday(date: Date) {
  const now = new Date();
  return date.getDate() === now.getDate()
    && date.getMonth() === now.getMonth()
    && date.getFullYear() === now.getFullYear();
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

const DAY_HEADER_HEIGHT = 44;

function EventPalette({ activeType, onSelect }: { activeType: string | null; onSelect: (type: string | null) => void }) {
  return (
    <div className="flex gap-1 px-2 py-1.5 border-b border-border overflow-x-auto shrink-0 bg-muted/20">
      {CALENDAR_EVENT_TYPES.map(et => (
        <button
          key={et.key}
          onClick={() => onSelect(activeType === et.key ? null : et.key)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap border transition-all shrink-0"
          style={
            activeType === et.key
              ? { backgroundColor: et.defaultColor, color: '#fff', borderColor: et.defaultColor }
              : { backgroundColor: et.defaultColor + '18', color: et.defaultColor, borderColor: et.defaultColor + '50' }
          }
          title={activeType === et.key ? `Click a slot to place ${et.label}` : `Select ${et.label}`}
        >
          {et.label}
        </button>
      ))}
      {activeType && (
        <span className="text-[9px] text-muted-foreground self-center ml-1 whitespace-nowrap shrink-0">
          ↓ click slot
        </span>
      )}
    </div>
  );
}

function WeekView({ data, color, onUpdate, isInteractive }: { data: CalendarData; color: string; onUpdate?: (u: Partial<CalendarData>) => void; isInteractive?: boolean }) {
  const timeGridRef = useRef<HTMLDivElement>(null);
  const [activeEventType, setActiveEventType] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const dragRef = useRef<{
    eventId: string;
    startMouseX: number;
    startMouseY: number;
    origDayIdx: number;
    origStartHour: number;
    origEndHour: number;
    isDragging: boolean;
  } | null>(null);

  const resizeRef = useRef<{
    eventId: string;
    startMouseY: number;
    origEndHour: number;
  } | null>(null);

  const events: CalendarEventItem[] = data.events || [];
  const { weekStartDate, startHour, endHour, showWeekends } = data;
  const numDays = showWeekends ? 7 : 5;
  const numHours = Math.max(1, (endHour || 18) - (startHour || 8));

  const start = parseWeekStart(weekStartDate || new Date().toISOString().split('T')[0]);
  const days = Array.from({ length: numDays }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const visibleEvents = events.filter(ev => {
    const dayIdx = days.findIndex(d => formatDateISO(d) === ev.date);
    return dayIdx >= 0;
  });

  const getMetrics = () => {
    const rect = timeGridRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const colWidth = rect.width / numDays;
    const rowHeight = (rect.height - DAY_HEADER_HEIGHT) / numHours;
    return { rect, colWidth, rowHeight };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const metrics = getMetrics();
      if (!metrics) return;

      if (dragRef.current && onUpdate) {
        const ds = dragRef.current;
        const deltaX = e.clientX - ds.startMouseX;
        const deltaY = e.clientY - ds.startMouseY;
        if (!ds.isDragging && Math.abs(deltaX) < 3 && Math.abs(deltaY) < 3) return;
        ds.isDragging = true;

        const dayDelta = Math.round(deltaX / metrics.colWidth);
        const hourDelta = Math.round(deltaY / metrics.rowHeight);
        const newDayIdx = Math.max(0, Math.min(numDays - 1, ds.origDayIdx + dayDelta));
        const newStartHour = Math.max(startHour, Math.min(endHour - 1, ds.origStartHour + hourDelta));
        const dur = ds.origEndHour - ds.origStartHour;
        const newEndHour = Math.min(endHour, newStartHour + dur);

        onUpdate({
          events: events.map(ev =>
            ev.id === ds.eventId
              ? { ...ev, date: formatDateISO(days[newDayIdx]), startHour: newStartHour, endHour: newEndHour }
              : ev
          ),
        });
      }

      if (resizeRef.current && onUpdate) {
        const rs = resizeRef.current;
        const deltaY = e.clientY - rs.startMouseY;
        const hourDelta = Math.round(deltaY / metrics.rowHeight);
        const ev = events.find(e => e.id === rs.eventId);
        if (!ev) return;
        const clampedEnd = Math.max(ev.startHour + 1, Math.min(endHour, rs.origEndHour + hourDelta));
        onUpdate({
          events: events.map(e =>
            e.id === rs.eventId ? { ...e, endHour: clampedEnd } : e
          ),
        });
      }
    };

    const onMouseUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  });

  const handleEventMouseDown = (e: React.MouseEvent, evId: string) => {
    if (!onUpdate) return;
    e.stopPropagation();
    e.preventDefault();
    const ev = events.find(x => x.id === evId);
    if (!ev) return;
    const dayIdx = days.findIndex(d => formatDateISO(d) === ev.date);
    dragRef.current = {
      eventId: evId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      origDayIdx: dayIdx,
      origStartHour: ev.startHour,
      origEndHour: ev.endHour,
      isDragging: false,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, evId: string) => {
    if (!onUpdate) return;
    e.stopPropagation();
    e.preventDefault();
    const ev = events.find(x => x.id === evId);
    if (!ev) return;
    resizeRef.current = {
      eventId: evId,
      startMouseY: e.clientY,
      origEndHour: ev.endHour,
    };
  };

  const handleGridClick = (e: React.MouseEvent) => {
    if (!activeEventType || !onUpdate) return;
    if (dragRef.current?.isDragging) return;
    const rect = timeGridRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top - DAY_HEADER_HEIGHT;
    if (y < 0) return;

    const dayIdx = Math.floor(x / (rect.width / numDays));
    const hourOffset = Math.floor((y / (rect.height - DAY_HEADER_HEIGHT)) * numHours);
    const clickedHour = startHour + hourOffset;
    if (dayIdx < 0 || dayIdx >= numDays || clickedHour < startHour || clickedHour >= endHour) return;

    const def = CALENDAR_EVENT_TYPES.find(t => t.key === activeEventType)!;
    const newEv: CalendarEventItem = {
      id: genId(),
      type: activeEventType,
      label: def.label,
      color: def.defaultColor,
      date: formatDateISO(days[dayIdx]),
      startHour: clickedHour,
      endHour: Math.min(endHour, clickedHour + 1),
    };
    onUpdate({ events: [...events, newEv] });
  };

  const handleDeleteEvent = (e: React.MouseEvent, evId: string) => {
    e.stopPropagation();
    e.preventDefault();
    onUpdate?.({ events: events.filter(ev => ev.id !== evId) });
  };

  const startEditLabel = (e: React.MouseEvent, ev: CalendarEventItem) => {
    e.stopPropagation();
    e.preventDefault();
    setEditDraft(ev.label);
    setEditingId(ev.id);
  };

  const commitLabel = () => {
    if (!editingId || !onUpdate) { setEditingId(null); return; }
    onUpdate({ events: events.map(ev => ev.id === editingId ? { ...ev, label: editDraft || ev.label } : ev) });
    setEditingId(null);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0" style={{ backgroundColor: `${color}15` }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-foreground truncate">{data.title || 'Week View'}</span>
      </div>

      {isInteractive && onUpdate && (
        <EventPalette activeType={activeEventType} onSelect={setActiveEventType} />
      )}

      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="flex flex-col border-r border-border shrink-0" style={{ width: 46 }}>
          <div className="border-b border-border" style={{ height: DAY_HEADER_HEIGHT }} />
          <div className="flex-1 relative">
            {Array.from({ length: numHours }, (_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 flex items-start justify-end pr-1 pt-0.5 border-b border-border/30"
                style={{ top: `${(i / numHours) * 100}%`, height: `${100 / numHours}%` }}
              >
                <span className="text-[9px] text-muted-foreground leading-none">{String(startHour + i).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={timeGridRef}
          className="flex-1 relative overflow-hidden"
          style={{ cursor: activeEventType ? 'crosshair' : 'default' }}
          onClick={handleGridClick}
        >
          <div
            className="absolute top-0 left-0 right-0 flex border-b border-border z-10"
            style={{ height: DAY_HEADER_HEIGHT }}
          >
            {days.map((d, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-center border-r border-border/40 last:border-r-0"
                style={{ backgroundColor: isToday(d) ? `${color}12` : undefined }}
              >
                <span className="text-[9px] text-muted-foreground leading-none">{DAYS_SHORT[i]}</span>
                <span className="text-[11px] font-semibold mt-0.5" style={{ color: isToday(d) ? color : undefined }}>
                  {d.getDate()}
                </span>
                <span className="text-[8px] text-muted-foreground leading-none">{MONTH_SHORT[d.getMonth()]}</span>
              </div>
            ))}
          </div>

          <div className="absolute left-0 right-0 bottom-0" style={{ top: DAY_HEADER_HEIGHT }}>
            {Array.from({ length: numHours }, (_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-b border-border/20"
                style={{ top: `${(i / numHours) * 100}%`, height: `${100 / numHours}%` }}
              />
            ))}

            {days.map((_, i) => i > 0 && (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-border/20"
                style={{ left: `${(i / numDays) * 100}%` }}
              />
            ))}

            {showWeekends && [5, 6].map(di => (
              <div
                key={di}
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{ left: `${(di / numDays) * 100}%`, width: `${100 / numDays}%`, backgroundColor: 'rgba(0,0,0,0.025)' }}
              />
            ))}

            {visibleEvents.map(ev => {
              const dayIdx = days.findIndex(d => formatDateISO(d) === ev.date);
              if (dayIdx < 0) return null;
              const clampedStart = Math.max(startHour, ev.startHour);
              const clampedEnd = Math.min(endHour, ev.endHour);
              if (clampedEnd <= clampedStart) return null;

              const topPct = ((clampedStart - startHour) / numHours) * 100;
              const heightPct = Math.max(100 / numHours * 0.8, ((clampedEnd - clampedStart) / numHours) * 100);
              const leftPct = (dayIdx / numDays) * 100;
              const widthPct = 100 / numDays;
              const isEditing = editingId === ev.id;

              return (
                <div
                  key={ev.id}
                  className="absolute group/ev overflow-hidden select-none"
                  style={{
                    top: `${topPct}%`,
                    height: `${heightPct}%`,
                    left: `${leftPct + 0.4}%`,
                    width: `${widthPct - 0.8}%`,
                    backgroundColor: ev.color + '22',
                    borderLeft: `3px solid ${ev.color}`,
                    borderRadius: '0 4px 4px 0',
                    padding: '2px 3px',
                    zIndex: 10,
                    cursor: onUpdate ? 'move' : 'default',
                  }}
                  onMouseDown={(e) => { if (onUpdate && !isEditing) handleEventMouseDown(e, ev.id); }}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => { if (onUpdate) startEditLabel(e, ev); }}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editDraft}
                      onChange={e => setEditDraft(e.target.value)}
                      onBlur={commitLabel}
                      onKeyDown={e => { if (e.key === 'Enter') commitLabel(); if (e.key === 'Escape') setEditingId(null); }}
                      className="w-full text-[9px] font-semibold bg-transparent border-none outline-none leading-tight"
                      style={{ color: ev.color }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="block text-[9px] font-semibold leading-tight truncate" style={{ color: ev.color }}>
                      {ev.label}
                    </span>
                  )}
                  <span className="block text-[8px] leading-none opacity-75" style={{ color: ev.color }}>
                    {String(ev.startHour).padStart(2, '0')}:00–{String(ev.endHour).padStart(2, '0')}:00
                  </span>

                  {onUpdate && (
                    <>
                      <button
                        className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-0 group-hover/ev:opacity-100 transition-opacity z-20"
                        style={{ backgroundColor: ev.color }}
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => handleDeleteEvent(e, ev.id)}
                        title="Remove event"
                      >
                        <span className="text-white text-[8px] font-bold leading-none">×</span>
                      </button>
                      <div
                        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 group-hover/ev:opacity-100 transition-opacity"
                        style={{ backgroundColor: ev.color + '55' }}
                        onMouseDown={e => handleResizeMouseDown(e, ev.id)}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthView({ data, color, onUpdate, isInteractive }: { data: CalendarData; color: string; onUpdate?: (u: Partial<CalendarData>) => void; isInteractive?: boolean }) {
  const [activeEventType, setActiveEventType] = useState<string | null>(null);
  const { month, year, showWeekends, events: rawEvents } = data;
  const events: CalendarEventItem[] = rawEvents || [];
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfWeek(year, month);
  const numCols = showWeekends ? 7 : 5;

  const now = new Date();
  const isTodayDay = (day: number) =>
    day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

  const dayLabels = DAYS_SHORT.slice(0, numCols);

  const cells: (number | null)[] = [];
  const offset = showWeekends ? firstDayOffset : Math.min(firstDayOffset, 4);
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    if (!showWeekends) {
      const weekday = (firstDayOffset + d - 1) % 7;
      if (weekday < 5) cells.push(d);
    } else {
      cells.push(d);
    }
  }
  while (cells.length % numCols !== 0) cells.push(null);
  const numRows = cells.length / numCols;

  const eventsOnDay = (day: number | null) => {
    if (day === null) return [];
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(ev => ev.date === dateStr);
  };

  const handleCellClick = (day: number | null) => {
    if (!day || !activeEventType || !onUpdate) return;
    const def = CALENDAR_EVENT_TYPES.find(t => t.key === activeEventType)!;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const newEv: CalendarEventItem = {
      id: genId(),
      type: activeEventType,
      label: def.label,
      color: def.defaultColor,
      date: dateStr,
      startHour: data.startHour || 9,
      endHour: (data.startHour || 9) + 1,
    };
    onUpdate({ events: [...events, newEv] });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0" style={{ backgroundColor: `${color}15` }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-foreground truncate">{data.title || `${MONTH_NAMES[month - 1]} ${year}`}</span>
      </div>

      {isInteractive && onUpdate && (
        <EventPalette activeType={activeEventType} onSelect={setActiveEventType} />
      )}

      <div className="flex-1 overflow-hidden min-h-0" style={{ display: 'grid', gridTemplateRows: `28px repeat(${numRows}, 1fr)` }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 1fr)` }} className="border-b border-border">
          {dayLabels.map(d => (
            <div key={d} className="flex items-center justify-center border-r border-border/40 last:border-r-0">
              <span className="text-[10px] font-medium text-muted-foreground">{d}</span>
            </div>
          ))}
        </div>

        {Array.from({ length: numRows }, (_, row) => (
          <div key={row} style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 1fr)` }} className="border-b border-border/40 last:border-b-0">
            {Array.from({ length: numCols }, (_, col) => {
              const cellVal = cells[row * numCols + col];
              const today = cellVal !== null && isTodayDay(cellVal);
              const dayEvs = eventsOnDay(cellVal);
              return (
                <div
                  key={col}
                  className="relative border-r border-border/40 last:border-r-0 p-1 overflow-hidden"
                  style={{
                    cursor: activeEventType && cellVal ? 'crosshair' : undefined,
                    backgroundColor: activeEventType && cellVal ? 'rgba(0,0,0,0.02)' : undefined,
                  }}
                  onClick={() => handleCellClick(cellVal)}
                >
                  {cellVal !== null && (
                    <>
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-medium"
                        style={today ? { backgroundColor: color, color: '#fff' } : { color: 'hsl(var(--foreground))' }}
                      >
                        {cellVal}
                      </span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayEvs.slice(0, 2).map(ev => (
                          <div
                            key={ev.id}
                            className="w-full rounded-sm px-0.5 truncate"
                            style={{ backgroundColor: ev.color + '30', borderLeft: `2px solid ${ev.color}`, fontSize: 7, color: ev.color, lineHeight: '10px' }}
                            title={ev.label}
                          >
                            {ev.label}
                          </div>
                        ))}
                        {dayEvs.length > 2 && (
                          <span className="text-[7px] text-muted-foreground">+{dayEvs.length - 2} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function YearView({ data, color, onUpdate, isInteractive }: { data: CalendarData; color: string; onUpdate?: (u: Partial<CalendarData>) => void; isInteractive?: boolean }) {
  const [activeEventType, setActiveEventType] = useState<string | null>(null);
  const { year, events: rawEvents } = data;
  const events: CalendarEventItem[] = rawEvents || [];
  const now = new Date();

  const eventsInMonthDay = (month: number, day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(ev => ev.date === dateStr);
  };

  const handleDayClick = (month: number, day: number) => {
    if (!activeEventType || !onUpdate) return;
    const def = CALENDAR_EVENT_TYPES.find(t => t.key === activeEventType)!;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const newEv: CalendarEventItem = {
      id: genId(),
      type: activeEventType,
      label: def.label,
      color: def.defaultColor,
      date: dateStr,
      startHour: data.startHour || 9,
      endHour: (data.startHour || 9) + 1,
    };
    onUpdate({ events: [...events, newEv] });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0" style={{ backgroundColor: `${color}15` }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-foreground">{data.title || String(year)}</span>
      </div>

      {isInteractive && onUpdate && (
        <EventPalette activeType={activeEventType} onSelect={setActiveEventType} />
      )}

      <div className="flex-1 overflow-hidden min-h-0 p-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 6 }}>
        {MONTH_SHORT.map((mName, mi) => {
          const m = mi + 1;
          const daysInM = getDaysInMonth(year, m);
          const firstDay = getFirstDayOfWeek(year, m);
          const isCurrentMonth = m === now.getMonth() + 1 && year === now.getFullYear();
          const todayDay = now.getDate();

          const cells: (number | null)[] = [];
          for (let i = 0; i < firstDay; i++) cells.push(null);
          for (let d = 1; d <= daysInM; d++) cells.push(d);
          while (cells.length % 7 !== 0) cells.push(null);

          return (
            <div
              key={mi}
              className="flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card/50"
              style={isCurrentMonth ? { borderColor: color } : undefined}
            >
              <div className="px-1.5 py-0.5 flex items-center justify-between border-b border-border/40" style={isCurrentMonth ? { backgroundColor: `${color}20` } : undefined}>
                <span className="text-[9px] font-semibold" style={{ color: isCurrentMonth ? color : undefined }}>{mName}</span>
              </div>
              <div className="flex-1 overflow-hidden" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `auto repeat(${cells.length / 7}, 1fr)` }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <span className="text-[7px] text-muted-foreground">{d}</span>
                  </div>
                ))}
                {cells.map((day, ci) => {
                  const isTodayCell = isCurrentMonth && day === todayDay;
                  const dayEvs = day !== null ? eventsInMonthDay(m, day) : [];
                  return (
                    <div
                      key={ci}
                      className="relative flex items-center justify-center"
                      style={{ cursor: activeEventType && day ? 'crosshair' : undefined }}
                      onClick={() => day && handleDayClick(m, day)}
                    >
                      {day !== null && (
                        <>
                          <span
                            className="inline-flex items-center justify-center rounded-full text-[7px] leading-none"
                            style={{
                              width: 10, height: 10,
                              backgroundColor: isTodayCell ? color : undefined,
                              color: isTodayCell ? '#fff' : undefined,
                            }}
                          >
                            {day}
                          </span>
                          {dayEvs.length > 0 && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {dayEvs.slice(0, 3).map((ev, ei) => (
                                <div
                                  key={ei}
                                  className="rounded-full"
                                  style={{ width: 3, height: 3, backgroundColor: ev.color }}
                                  title={ev.label}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarBlock({ title, data, color, onUpdate, isInteractive }: CalendarBlockProps) {
  const safeData = { ...data, events: data.events || [] };
  if (safeData.view === 'week') return <WeekView data={safeData} color={color} onUpdate={onUpdate} isInteractive={isInteractive} />;
  if (safeData.view === 'year') return <YearView data={safeData} color={color} onUpdate={onUpdate} isInteractive={isInteractive} />;
  return <MonthView data={safeData} color={color} onUpdate={onUpdate} isInteractive={isInteractive} />;
}
