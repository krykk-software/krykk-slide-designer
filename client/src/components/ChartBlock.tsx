import { ChartDataPoint } from '@/lib/types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface ChartBlockProps {
  title: string;
  icon: string;
  type: 'pie-chart' | 'bar-chart';
  data: ChartDataPoint[];
  color: string;
  onTitleChange?: (title: string) => void;
  onDataChange?: (data: ChartDataPoint[]) => void;
}

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(160, 84%, 39%)',
  'hsl(43, 96%, 56%)',
  'hsl(280, 67%, 63%)',
  'hsl(0, 84%, 60%)',
  'hsl(25, 95%, 53%)',
  'hsl(175, 84%, 32%)',
  'hsl(330, 81%, 60%)',
];

export function ChartBlock({ title, icon, type, data, onTitleChange, onDataChange }: ChartBlockProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[icon] || LucideIcons.BarChart3;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editingItem, setEditingItem] = useState<{ index: number; field: 'label' | 'value' } | null>(null);
  const [editItemValue, setEditItemValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const itemInputRef = useRef<HTMLInputElement>(null);

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
    if (editingItem && itemInputRef.current) {
      itemInputRef.current.focus();
      itemInputRef.current.select();
    }
  }, [editingItem]);

  const commitTitleEdit = useCallback(() => {
    setIsEditingTitle(false);
    if (onTitleChange && editTitle !== title && editTitle.trim()) {
      onTitleChange(editTitle.trim());
    } else {
      setEditTitle(title);
    }
  }, [editTitle, title, onTitleChange]);

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    if (!onTitleChange) return;
    e.stopPropagation();
    e.preventDefault();
    setIsEditingTitle(true);
  };

  const handleItemClick = (index: number, field: 'label' | 'value', e: React.MouseEvent) => {
    if (!onDataChange) return;
    e.stopPropagation();
    e.preventDefault();
    const item = data[index];
    setEditItemValue(field === 'value' ? String(item.value) : item.label);
    setEditingItem({ index, field });
  };

  const commitItemEdit = useCallback(() => {
    if (!editingItem || !onDataChange) {
      setEditingItem(null);
      return;
    }
    const newData = [...data];
    if (editingItem.field === 'value') {
      newData[editingItem.index] = { ...newData[editingItem.index], value: parseFloat(editItemValue) || 0 };
    } else {
      newData[editingItem.index] = { ...newData[editingItem.index], label: editItemValue || newData[editingItem.index].label };
    }
    setEditingItem(null);
    onDataChange(newData);
  }, [editingItem, editItemValue, data, onDataChange]);

  const handleItemKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitItemEdit();
    }
    if (e.key === 'Escape') {
      setEditingItem(null);
    }
    e.stopPropagation();
  };

  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.color || COLORS[index % COLORS.length],
  }));

  const renderCustomLegend = () => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2 mt-1" data-testid="chart-legend">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
            />
            {editingItem?.index === index && editingItem?.field === 'label' ? (
              <input
                ref={itemInputRef}
                value={editItemValue}
                onChange={(e) => setEditItemValue(e.target.value)}
                onBlur={commitItemEdit}
                onKeyDown={handleItemKeyDown}
                className="text-[10px] text-foreground bg-transparent border-b border-primary outline-none w-16"
                data-testid={`inline-legend-label-editor-${index}`}
              />
            ) : (
              <span
                className={`text-[10px] text-foreground ${onDataChange ? 'cursor-text' : ''}`}
                onClick={(e) => handleItemClick(index, 'label', e)}
                data-testid={`chart-legend-label-${index}`}
              >
                {item.label}
              </span>
            )}
            {editingItem?.index === index && editingItem?.field === 'value' ? (
              <input
                ref={itemInputRef}
                value={editItemValue}
                onChange={(e) => setEditItemValue(e.target.value)}
                onBlur={commitItemEdit}
                onKeyDown={handleItemKeyDown}
                className="text-[10px] text-muted-foreground bg-transparent border-b border-primary outline-none w-10"
                data-testid={`inline-legend-value-editor-${index}`}
              />
            ) : (
              <span
                className={`text-[10px] text-muted-foreground ${onDataChange ? 'cursor-text' : ''}`}
                onClick={(e) => handleItemClick(index, 'value', e)}
                data-testid={`chart-legend-value-${index}`}
              >
                ({item.value})
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-card-border p-4 h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <IconComponent className="w-4 h-4 text-muted-foreground" />
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
            className="text-sm font-medium text-foreground bg-transparent border-b border-primary outline-none flex-1 min-w-0"
            data-testid="inline-chart-title-editor"
          />
        ) : (
          <span
            className="text-sm font-medium text-foreground cursor-text"
            onDoubleClick={handleTitleDoubleClick}
            data-testid="chart-block-title"
          >
            {title}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {type === 'pie-chart' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                nameKey="label"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {renderCustomLegend()}
    </div>
  );
}
