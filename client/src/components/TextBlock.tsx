import { TextData } from '@/lib/types';
import { useState, useRef, useEffect, useCallback } from 'react';

interface TextBlockProps {
  data: TextData;
  onDataChange?: (data: TextData) => void;
}

export function TextBlock({ data, onDataChange }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(data.content);
  }, [data.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const commitEdit = useCallback(() => {
    setIsEditing(false);
    if (onDataChange && editValue !== data.content) {
      onDataChange({ ...data, content: editValue });
    }
  }, [editValue, data, onDataChange]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!onDataChange) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditValue(data.content);
      setIsEditing(false);
    }
    e.stopPropagation();
  };

  if (isEditing) {
    return (
      <div className="rounded-xl border-2 border-primary px-3 py-1 h-full flex items-center shadow-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-transparent border-none outline-none resize-none font-semibold text-foreground"
          style={{ fontSize: data.fontSize || 24, caretColor: 'hsl(217, 91%, 60%)' }}
          data-testid="inline-text-editor"
        />
      </div>
    );
  }

  return (
    <div
      className="bg-card rounded-xl border border-card-border px-3 py-1 h-full flex items-center shadow-sm cursor-text overflow-hidden"
      onDoubleClick={handleDoubleClick}
      data-testid="text-block-content"
    >
      <div
        className="font-semibold text-foreground whitespace-pre-wrap w-full overflow-hidden"
        style={{ fontSize: data.fontSize || 24 }}
      >
        {data.content}
      </div>
    </div>
  );
}
