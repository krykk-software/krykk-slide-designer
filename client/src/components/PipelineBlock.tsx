import { PipelineData, PipelineMonth, PipelineOpportunity, BLOCK_COLORS } from '@/lib/types';
import { useState, useRef, useEffect, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface PipelineBlockProps {
  title: string;
  icon: string;
  data: PipelineData;
  color: string;
  onTitleChange?: (title: string) => void;
  onDataChange?: (data: PipelineData) => void;
}

const formatValue = (val: number, prefix?: string) => {
  if (val >= 1000000) return `${prefix || ''}${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${prefix || ''}${(val / 1000).toFixed(0)}K`;
  return `${prefix || ''}${val}`;
};

const oppColors = [
  BLOCK_COLORS.blue,
  BLOCK_COLORS.green,
  BLOCK_COLORS.purple,
  BLOCK_COLORS.yellow,
  BLOCK_COLORS.orange,
  BLOCK_COLORS.teal,
  BLOCK_COLORS.pink,
  BLOCK_COLORS.red,
];

export function PipelineBlock({ title, icon, data, color, onTitleChange, onDataChange }: PipelineBlockProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[icon] || LucideIcons.BarChart3;
  const [hoveredOpp, setHoveredOpp] = useState<{ monthIdx: number; oppIdx: number; x: number; y: number } | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditTitle(title);
  }, [title]);

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

  const maxTotal = Math.max(
    ...data.months.map(m => m.opportunities.reduce((sum, o) => sum + o.amount, 0)),
    1
  );

  const yAxisTicks = (() => {
    const ticks: number[] = [];
    const step = Math.pow(10, Math.floor(Math.log10(maxTotal)));
    const niceStep = maxTotal / step > 5 ? step * 2 : step;
    for (let v = 0; v <= maxTotal * 1.1; v += niceStep) {
      ticks.push(v);
    }
    if (ticks.length < 2) ticks.push(maxTotal);
    return ticks;
  })();

  const yMax = yAxisTicks[yAxisTicks.length - 1] || maxTotal;
  const chartPaddingLeft = 14;
  const chartPaddingBottom = 14;
  const chartPaddingTop = 4;
  const barGap = 8;

  return (
    <div ref={containerRef} className="bg-card rounded-xl border border-card-border p-4 h-full flex flex-col shadow-sm" data-testid="pipeline-block">
      <div className="flex items-center gap-2 mb-3">
        <IconComponent className="w-4 h-4 text-muted-foreground" />
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
            data-testid="inline-pipeline-title-editor"
          />
        ) : (
          <span
            className={`text-sm font-medium text-foreground ${onTitleChange ? 'cursor-text' : ''}`}
            onDoubleClick={() => onTitleChange && setIsEditingTitle(true)}
            data-testid="pipeline-block-title"
          >
            {title}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 relative">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
          {yAxisTicks.map((tick, i) => {
            const y = chartPaddingTop + ((yMax - tick) / yMax) * (100 - chartPaddingTop - chartPaddingBottom);
            return (
              <line
                key={i}
                x1={chartPaddingLeft}
                x2={100}
                y1={y}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="0.2"
                strokeDasharray="1,1"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex" style={{ paddingLeft: `${chartPaddingLeft}%`, paddingBottom: `${chartPaddingBottom}%`, paddingTop: `${chartPaddingTop}%` }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0" style={{ width: `${chartPaddingLeft}%`, paddingTop: `${chartPaddingTop}%`, paddingBottom: `${chartPaddingBottom}%` }}>
            {yAxisTicks.map((tick, i) => {
              const pct = ((yMax - tick) / yMax) * 100;
              return (
                <div
                  key={i}
                  className="absolute text-[8px] text-muted-foreground text-right pr-1"
                  style={{ top: `${pct}%`, right: 0, transform: 'translateY(-50%)' }}
                >
                  {formatValue(tick, data.prefix)}
                </div>
              );
            })}
          </div>

          {data.months.map((month, mi) => {
            const total = month.opportunities.reduce((s, o) => s + o.amount, 0);
            const barWidth = `${100 / data.months.length}%`;

            return (
              <div
                key={mi}
                className="flex flex-col justify-end items-center relative"
                style={{ width: barWidth, padding: `0 ${barGap}px` }}
                data-testid={`pipeline-month-${mi}`}
              >
                <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                  {month.opportunities.map((opp, oi) => {
                    const segHeight = (opp.amount / yMax) * 100;
                    const oppColor = opp.color || oppColors[oi % oppColors.length];
                    return (
                      <div
                        key={opp.id}
                        className="w-full relative cursor-pointer transition-opacity"
                        style={{
                          height: `${segHeight}%`,
                          backgroundColor: oppColor,
                          borderBottom: oi < month.opportunities.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                          borderRadius: oi === 0 ? '3px 3px 0 0' : undefined,
                          minHeight: segHeight > 0 ? '2px' : 0,
                        }}
                        onMouseEnter={(e) => {
                          const rect = containerRef.current?.getBoundingClientRect();
                          if (rect) {
                            setHoveredOpp({
                              monthIdx: mi,
                              oppIdx: oi,
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredOpp(null)}
                        data-testid={`pipeline-opp-${mi}-${oi}`}
                      >
                        {segHeight > 8 && (
                          <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white font-medium truncate px-0.5">
                            {formatValue(opp.amount, data.prefix)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div
                  className="text-[9px] text-muted-foreground text-center mt-1 font-medium"
                  style={{ position: 'absolute', bottom: `-${chartPaddingBottom + 2}%`, left: 0, right: 0 }}
                >
                  {month.month}
                </div>
              </div>
            );
          })}
        </div>

        {hoveredOpp && (() => {
          const month = data.months[hoveredOpp.monthIdx];
          const opp = month?.opportunities[hoveredOpp.oppIdx];
          if (!opp) return null;
          return (
            <div
              className="absolute z-50 pointer-events-none bg-popover border border-border rounded-md shadow-lg px-3 py-2"
              style={{
                left: Math.min(hoveredOpp.x + 10, (containerRef.current?.offsetWidth || 300) - 150),
                top: Math.max(hoveredOpp.y - 50, 0),
              }}
              data-testid="pipeline-tooltip"
            >
              <div className="text-xs font-medium text-foreground">{opp.name}</div>
              <div className="text-[10px] text-muted-foreground">{formatValue(opp.amount, data.prefix)}</div>
              <div className="text-[10px] text-muted-foreground">{month.month}</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
