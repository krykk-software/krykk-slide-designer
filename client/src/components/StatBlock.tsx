import { StatData } from '@/lib/types';
import { colorWithAlpha } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface StatBlockProps {
  title: string;
  icon: string;
  data: StatData;
  color: string;
  onTitleChange?: (title: string) => void;
  onDataChange?: (data: StatData) => void;
}

export function StatBlock({ title, icon, data, color, onTitleChange, onDataChange }: StatBlockProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[icon] || LucideIcons.Activity;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editingField, setEditingField] = useState<'current' | 'previous' | null>(null);
  const [editFieldValue, setEditFieldValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (editingField && fieldInputRef.current) {
      fieldInputRef.current.focus();
      fieldInputRef.current.select();
    }
  }, [editingField]);

  const commitTitleEdit = useCallback(() => {
    setIsEditingTitle(false);
    if (onTitleChange && editTitle !== title && editTitle.trim()) {
      onTitleChange(editTitle.trim());
    } else {
      setEditTitle(title);
    }
  }, [editTitle, title, onTitleChange]);

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString();
  };

  const parseInputValue = (input: string): number => {
    const cleaned = input.replace(/[,$%\s]/g, '');
    const lower = cleaned.toLowerCase();
    if (lower.endsWith('m')) {
      return parseFloat(lower.slice(0, -1)) * 1000000;
    }
    if (lower.endsWith('k')) {
      return parseFloat(lower.slice(0, -1)) * 1000;
    }
    return parseFloat(cleaned) || 0;
  };

  const getTrendInfo = () => {
    if (data.previous === undefined || data.previous === 0) {
      return { percent: 0, direction: 'neutral' as const };
    }
    const percent = ((data.current - data.previous) / data.previous) * 100;
    return {
      percent: Math.abs(percent),
      direction: percent > 0 ? 'up' as const : percent < 0 ? 'down' as const : 'neutral' as const,
    };
  };

  const trend = getTrendInfo();

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    if (!onTitleChange) return;
    e.stopPropagation();
    e.preventDefault();
    setIsEditingTitle(true);
  };

  const handleFieldClick = (field: 'current' | 'previous', e: React.MouseEvent) => {
    if (!onDataChange) return;
    e.stopPropagation();
    e.preventDefault();
    const value = field === 'current' ? data.current : data.previous;
    setEditFieldValue(String(value ?? 0));
    setEditingField(field);
  };

  const commitFieldEdit = useCallback(() => {
    if (!editingField || !onDataChange) {
      setEditingField(null);
      return;
    }
    const parsed = parseInputValue(editFieldValue);
    const newData = { ...data };
    if (editingField === 'current') {
      newData.current = parsed;
    } else {
      newData.previous = parsed;
    }
    setEditingField(null);
    onDataChange(newData);
  }, [editingField, editFieldValue, data, onDataChange]);

  const handleFieldKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitFieldEdit();
    }
    if (e.key === 'Escape') {
      setEditingField(null);
    }
    e.stopPropagation();
  };

  return (
    <div className="bg-card rounded-xl border border-card-border p-4 h-full flex flex-col shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-2 min-w-0">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: colorWithAlpha(color, 0.125) }}
        >
          <IconComponent className="w-3.5 h-3.5" style={{ color }} />
        </div>
        {isEditingTitle ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={commitTitleEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitleEdit();
              if (e.key === 'Escape') {
                setEditTitle(title);
                setIsEditingTitle(false);
              }
              e.stopPropagation();
            }}
            className="text-xs font-medium text-muted-foreground bg-transparent border-b border-primary outline-none flex-1 min-w-0"
            data-testid="inline-title-editor"
          />
        ) : (
          <span
            className="text-xs font-medium text-muted-foreground truncate cursor-text"
            onDoubleClick={handleTitleDoubleClick}
            data-testid="stat-block-title"
          >
            {title}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-end min-w-0">
        {editingField === 'current' ? (
          <input
            ref={fieldInputRef}
            value={editFieldValue}
            onChange={(e) => setEditFieldValue(e.target.value)}
            onBlur={commitFieldEdit}
            onKeyDown={handleFieldKeyDown}
            className="text-xl font-bold text-foreground bg-transparent border-b-2 border-primary outline-none w-full"
            data-testid="inline-current-value-editor"
          />
        ) : (
          <div
            className={`text-xl font-bold text-foreground truncate ${onDataChange ? 'cursor-text' : ''}`}
            onClick={(e) => handleFieldClick('current', e)}
            data-testid="stat-current-value"
          >
            {data.prefix || ''}{formatValue(data.current)}{data.suffix || ''}
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2 mt-1 min-w-0">
          {data.previous !== undefined && (
            editingField === 'previous' ? (
              <input
                ref={fieldInputRef}
                value={editFieldValue}
                onChange={(e) => setEditFieldValue(e.target.value)}
                onBlur={commitFieldEdit}
                onKeyDown={handleFieldKeyDown}
                className="text-[10px] text-muted-foreground bg-transparent border-b border-primary outline-none flex-1 min-w-0"
                data-testid="inline-previous-value-editor"
              />
            ) : (
              <div
                className={`text-[10px] text-muted-foreground truncate ${onDataChange ? 'cursor-text' : ''}`}
                onClick={(e) => handleFieldClick('previous', e)}
                data-testid="stat-previous-value"
              >
                vs {data.prefix || ''}{formatValue(data.previous)}{data.suffix || ''}
              </div>
            )
          )}
          
          {data.previous !== undefined && (
            <div className={`flex items-center gap-0.5 text-xs shrink-0 ${
              trend.direction === 'up' ? 'text-green-500' :
              trend.direction === 'down' ? 'text-red-500' :
              'text-muted-foreground'
            }`}>
              {trend.direction === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend.direction === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trend.direction === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              <span>{trend.percent.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
