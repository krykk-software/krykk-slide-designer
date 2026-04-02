import { SimpleValueData } from '@/lib/types';
import { colorWithAlpha } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface SimpleValueBlockProps {
  title: string;
  icon: string;
  data: SimpleValueData;
  color: string;
  onTitleChange?: (title: string) => void;
  onDataChange?: (data: SimpleValueData) => void;
}

export function SimpleValueBlock({ title, icon, data, color, onTitleChange, onDataChange }: SimpleValueBlockProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[icon] || LucideIcons.Hash;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editValue, setEditValue] = useState(data.value);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  useEffect(() => {
    setEditValue(data.value);
  }, [data.value]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingValue && valueInputRef.current) {
      valueInputRef.current.focus();
      valueInputRef.current.select();
    }
  }, [isEditingValue]);

  const commitTitleEdit = useCallback(() => {
    setIsEditingTitle(false);
    if (onTitleChange && editTitle !== title && editTitle.trim()) {
      onTitleChange(editTitle.trim());
    } else {
      setEditTitle(title);
    }
  }, [editTitle, title, onTitleChange]);

  const commitValueEdit = useCallback(() => {
    setIsEditingValue(false);
    if (onDataChange && editValue !== data.value) {
      onDataChange({ ...data, value: editValue });
    } else {
      setEditValue(data.value);
    }
  }, [editValue, data, onDataChange]);

  return (
    <div className="bg-card rounded-xl border border-card-border p-4 h-full flex flex-col shadow-sm overflow-hidden" data-testid="simple-value-block">
      <div className="flex items-center gap-2 mb-2 min-w-0">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: colorWithAlpha(color, 0.125) }}
        >
          <IconComponent className="w-3.5 h-3.5" style={{ color }} />
        </div>
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
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
            data-testid="inline-simple-title-editor"
          />
        ) : (
          <span
            className="text-xs font-medium text-muted-foreground truncate cursor-text"
            onDoubleClick={() => onTitleChange && setIsEditingTitle(true)}
            data-testid="simple-value-title"
          >
            {title}
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center min-w-0">
        {isEditingValue ? (
          <input
            ref={valueInputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitValueEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitValueEdit();
              if (e.key === 'Escape') {
                setEditValue(data.value);
                setIsEditingValue(false);
              }
              e.stopPropagation();
            }}
            className="text-xl font-bold text-foreground bg-transparent border-b-2 border-primary outline-none w-full"
            data-testid="inline-simple-value-editor"
          />
        ) : (
          <div
            className={`text-xl font-bold text-foreground truncate ${onDataChange ? 'cursor-text' : ''}`}
            onClick={(e) => {
              if (!onDataChange) return;
              e.stopPropagation();
              e.preventDefault();
              setIsEditingValue(true);
            }}
            data-testid="simple-value-display"
          >
            {data.prefix || ''}{data.value}{data.suffix || ''}
          </div>
        )}
      </div>
    </div>
  );
}
