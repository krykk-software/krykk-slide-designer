import { TimelineData, TimelineEvent, BLOCK_COLORS } from '@/lib/types';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Calendar, Users, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineBlockProps {
  title: string;
  data: TimelineData;
  color: string;
  onTitleChange?: (title: string) => void;
  onDataChange?: (data: TimelineData) => void;
}

const formatCurrency = (val: number) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val}`;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getMonthLabels = (startMonth: string, durationMonths: number) => {
  const labels: string[] = [];
  const [year, month] = startMonth.split('-').map(Number);
  for (let i = 0; i < durationMonths; i++) {
    const d = new Date(year, month - 1 + i, 1);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
  }
  return labels;
};

const getEventPosition = (event: TimelineEvent, startMonth: string, durationMonths: number) => {
  const [startYear, startMon] = startMonth.split('-').map(Number);
  const timelineStart = new Date(startYear, startMon - 1, 1).getTime();
  const timelineEnd = new Date(startYear, startMon - 1 + durationMonths, 0).getTime();
  const totalDuration = timelineEnd - timelineStart;

  const eventStart = new Date(event.startDate + 'T00:00:00').getTime();
  const eventEnd = new Date(event.endDate + 'T00:00:00').getTime();

  const left = Math.max(0, ((eventStart - timelineStart) / totalDuration) * 100);
  const width = Math.max(1, ((eventEnd - eventStart) / totalDuration) * 100);

  return { left, width };
};

const segmentColors = [
  BLOCK_COLORS.blue,
  BLOCK_COLORS.green,
  BLOCK_COLORS.purple,
  BLOCK_COLORS.yellow,
  BLOCK_COLORS.orange,
  BLOCK_COLORS.teal,
  BLOCK_COLORS.pink,
  BLOCK_COLORS.red,
];

export function TimelineBlock({ title, data, color, onTitleChange, onDataChange }: TimelineBlockProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEditTitle(title); }, [title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const commitTitleEdit = useCallback(() => {
    setIsEditingTitle(false);
    if (onTitleChange && editTitle !== title && editTitle.trim()) {
      onTitleChange(editTitle.trim());
    } else {
      setEditTitle(title);
    }
  }, [editTitle, title, onTitleChange]);

  const monthLabels = getMonthLabels(data.startMonth, data.durationMonths);

  const segmentMap = new Map<string, string>();
  data.segments.forEach((seg, i) => {
    segmentMap.set(seg.name, seg.color || segmentColors[i % segmentColors.length]);
  });

  const eventsBySegment = new Map<string, TimelineEvent[]>();
  const unsegmented: TimelineEvent[] = [];
  data.events.forEach(ev => {
    if (ev.segment) {
      const list = eventsBySegment.get(ev.segment) || [];
      list.push(ev);
      eventsBySegment.set(ev.segment, list);
    } else {
      unsegmented.push(ev);
    }
  });

  const sortedSegments = data.segments.length > 0
    ? data.segments.map(s => s.name)
    : [''];

  const allRows: { segment: string; events: TimelineEvent[] }[] = [];
  sortedSegments.forEach(segName => {
    const events = eventsBySegment.get(segName) || [];
    if (events.length > 0 || data.segments.find(s => s.name === segName)) {
      allRows.push({ segment: segName, events });
    }
  });
  if (unsegmented.length > 0) {
    allRows.push({ segment: '', events: unsegmented });
  }

  const toggleEvent = (eventId: string) => {
    setExpandedEvent(prev => prev === eventId ? null : eventId);
  };

  const headerHeight = 40;
  const segmentHeaderHeight = 22;
  const eventRowHeight = 32;
  const expandedHeight = 48;

  return (
    <div className="bg-card rounded-xl border border-card-border p-3 h-full flex flex-col shadow-sm overflow-hidden" data-testid="timeline-block">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={commitTitleEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitleEdit();
              if (e.key === 'Escape') { setEditTitle(title); setIsEditingTitle(false); }
              e.stopPropagation();
            }}
            className="text-sm font-medium text-foreground bg-transparent border-b border-primary outline-none flex-1 min-w-0"
            data-testid="inline-timeline-title-editor"
          />
        ) : (
          <span
            className={`text-sm font-medium text-foreground ${onTitleChange ? 'cursor-text' : ''}`}
            onDoubleClick={() => onTitleChange && setIsEditingTitle(true)}
            data-testid="timeline-title"
          >
            {title}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{data.durationMonths} months</span>
      </div>

      <div className="flex-1 min-h-0 relative">
        <div className="flex border-b border-border" style={{ height: headerHeight }}>
          <div className="w-[100px] shrink-0" />
          <div className="flex-1 flex">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="flex-1 text-center text-[10px] font-medium text-muted-foreground border-l border-border/50 flex items-end justify-center pb-1"
                data-testid={`timeline-month-${i}`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: `calc(100% - ${headerHeight}px)` }}>
          {allRows.map((row, ri) => (
            <div key={ri} data-testid={`timeline-segment-${ri}`}>
              {row.segment && (
                <div
                  className="flex items-center px-2 border-b border-border/30"
                  style={{
                    height: segmentHeaderHeight,
                    backgroundColor: `${segmentMap.get(row.segment) || BLOCK_COLORS.blue}10`,
                  }}
                >
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: segmentMap.get(row.segment) || BLOCK_COLORS.blue }}
                  >
                    {row.segment}
                  </span>
                </div>
              )}

              {row.events.map((event) => {
                const pos = getEventPosition(event, data.startMonth, data.durationMonths);
                const isExpanded = expandedEvent === event.id;
                const evColor = event.color || segmentMap.get(event.segment || '') || color;

                return (
                  <div key={event.id} className="border-b border-border/20" data-testid={`timeline-event-${event.id}`}>
                    <div className="flex" style={{ height: eventRowHeight }}>
                      <div className="w-[100px] shrink-0 flex items-center px-2 gap-1 overflow-hidden">
                        <span className="text-[9px] text-muted-foreground truncate">{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex-1 relative flex items-center">
                        {monthLabels.map((_, mi) => (
                          <div
                            key={mi}
                            className="absolute top-0 bottom-0 border-l border-border/20"
                            style={{ left: `${(mi / data.durationMonths) * 100}%` }}
                          />
                        ))}
                        <div
                          className="absolute flex items-center gap-1 rounded-full px-2 cursor-pointer transition-all"
                          style={{
                            left: `${pos.left}%`,
                            width: `${Math.max(pos.width, 3)}%`,
                            minWidth: '80px',
                            height: '22px',
                            backgroundColor: evColor,
                          }}
                          onClick={() => toggleEvent(event.id)}
                          data-testid={`timeline-event-bubble-${event.id}`}
                        >
                          <span className="text-[9px] font-medium text-white truncate">{event.name}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-2.5 h-2.5 text-white/80 shrink-0 ml-auto" />
                          ) : (
                            <ChevronDown className="w-2.5 h-2.5 text-white/80 shrink-0 ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        className="flex items-center gap-3 px-2 text-[9px] text-muted-foreground border-t border-border/10"
                        style={{
                          height: expandedHeight,
                          paddingLeft: '108px',
                          backgroundColor: `${evColor}08`,
                        }}
                        data-testid={`timeline-event-details-${event.id}`}
                      >
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                        </div>
                        {event.cost !== undefined && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{formatCurrency(event.cost)}</span>
                          </div>
                        )}
                        {event.attendees !== undefined && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{event.attendees}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
