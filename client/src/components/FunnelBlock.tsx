import { FunnelData, FunnelStage } from '@/lib/types';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Filter } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface FunnelBlockProps {
  title: string;
  icon: string;
  data: FunnelData;
  color: string;
  onTitleChange?: (title: string) => void;
  onDataChange?: (data: FunnelData) => void;
}

const formatNumber = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString();
};

export function FunnelBlock({ title, icon, data, color, onTitleChange, onDataChange }: FunnelBlockProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[icon] || Filter;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editingStage, setEditingStage] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEditTitle(title); }, [title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (editingStage !== null && valueInputRef.current) {
      valueInputRef.current.focus();
      valueInputRef.current.select();
    }
  }, [editingStage]);

  const commitTitleEdit = useCallback(() => {
    setIsEditingTitle(false);
    if (onTitleChange && editTitle !== title && editTitle.trim()) {
      onTitleChange(editTitle.trim());
    } else {
      setEditTitle(title);
    }
  }, [editTitle, title, onTitleChange]);

  const commitValueEdit = useCallback(() => {
    if (editingStage === null || !onDataChange) {
      setEditingStage(null);
      return;
    }
    const newStages = [...data.stages];
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      newStages[editingStage] = { ...newStages[editingStage], value: parsed };
    }
    setEditingStage(null);
    onDataChange({ ...data, stages: newStages });
  }, [editingStage, editValue, data, onDataChange]);

  const maxValue = Math.max(...data.stages.map(s => s.value), 1);
  const stages = data.stages;

  return (
    <div className="bg-card rounded-xl border border-card-border p-4 h-full flex flex-col shadow-sm" data-testid="funnel-block">
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
            data-testid="inline-funnel-title-editor"
          />
        ) : (
          <span
            className={`text-sm font-medium text-foreground ${onTitleChange ? 'cursor-text' : ''}`}
            onDoubleClick={() => onTitleChange && setIsEditingTitle(true)}
            data-testid="funnel-block-title"
          >
            {title}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-0" data-testid="funnel-stages">
        {stages.map((stage, i) => {
          const widthPct = 30 + (70 * (stage.value / maxValue));
          const isLast = i === stages.length - 1;
          const convRate = i > 0 ? ((stage.value / stages[i - 1].value) * 100) : null;

          return (
            <div key={i} className="w-full flex flex-col items-center" data-testid={`funnel-stage-${i}`}>
              {i > 0 && convRate !== null && (
                <div className="text-[8px] text-muted-foreground py-0.5" data-testid={`funnel-conversion-${i}`}>
                  {convRate.toFixed(0)}%
                </div>
              )}
              <div
                className="relative flex items-center justify-center transition-all"
                style={{
                  width: `${widthPct}%`,
                  minHeight: '28px',
                  flex: '1 1 0',
                  maxHeight: `${100 / stages.length}%`,
                  backgroundColor: stage.color,
                  clipPath: isLast
                    ? `polygon(${(100 - widthPct) / 2}% 0%, ${100 - (100 - widthPct) / 2}% 0%, ${100 - (100 - widthPct) / 2}% 100%, ${(100 - widthPct) / 2}% 100%)`
                    : undefined,
                  borderRadius: i === 0 ? '6px 6px 0 0' : isLast ? '0 0 4px 4px' : '0',
                }}
              >
                <div className="flex items-center gap-2 px-3">
                  <span className="text-[10px] font-medium text-white whitespace-nowrap">{stage.label}</span>
                  {editingStage === i ? (
                    <input
                      ref={valueInputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitValueEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitValueEdit();
                        if (e.key === 'Escape') setEditingStage(null);
                        e.stopPropagation();
                      }}
                      className="text-xs font-bold text-white bg-white/20 border-b border-white/50 outline-none w-16 text-center rounded-sm"
                      data-testid={`inline-funnel-value-editor-${i}`}
                    />
                  ) : (
                    <span
                      className={`text-xs font-bold text-white ${onDataChange ? 'cursor-text' : ''}`}
                      onClick={(e) => {
                        if (!onDataChange) return;
                        e.stopPropagation();
                        setEditValue(String(stage.value));
                        setEditingStage(i);
                      }}
                      data-testid={`funnel-value-${i}`}
                    >
                      {formatNumber(stage.value)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
