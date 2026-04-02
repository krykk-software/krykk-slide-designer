import { useState, useCallback } from 'react';
import { TableData } from '@/lib/types';

interface TableBlockProps {
  title: string;
  data: TableData;
  color: string;
  width?: number;
  height?: number;
  onUpdateData?: (data: TableData) => void;
}

export default function TableBlock({ title, data, color, width, height, onUpdateData }: TableBlockProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleCellDoubleClick = useCallback((rowIndex: number, colIndex: number, value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCell({ row: rowIndex, col: colIndex });
    setEditValue(value);
  }, []);

  const handleCellCommit = useCallback(() => {
    if (editingCell && onUpdateData) {
      const newRows = data.rows.map((row, ri) =>
        ri === editingCell.row
          ? row.map((cell, ci) => (ci === editingCell.col ? editValue : cell))
          : [...row]
      );
      onUpdateData({ ...data, rows: newRows });
    }
    setEditingCell(null);
  }, [editingCell, editValue, data, onUpdateData]);

  const handleHeaderDoubleClick = useCallback((colIndex: number, value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCell({ row: -1, col: colIndex });
    setEditValue(value);
  }, []);

  const handleHeaderCommit = useCallback(() => {
    if (editingCell && editingCell.row === -1 && onUpdateData) {
      const newColumns = data.columns.map((col, ci) =>
        ci === editingCell.col ? editValue : col
      );
      onUpdateData({ ...data, columns: newColumns });
    }
    setEditingCell(null);
  }, [editingCell, editValue, data, onUpdateData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      if (editingCell && editingCell.row === -1) {
        handleHeaderCommit();
      } else {
        handleCellCommit();
      }
    }
    if (e.key === 'Escape') {
      setEditingCell(null);
    }
  }, [editingCell, handleCellCommit, handleHeaderCommit]);

  const colCount = data.columns.length;
  const colWidth = width ? Math.floor((width - 2) / colCount) : 120;
  const headerHeight = 32;
  const rowHeight = 28;

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ width, height }}
      data-testid="table-block"
    >
      <div
        className="text-xs font-semibold px-2 py-1 text-white truncate shrink-0"
        style={{ backgroundColor: color, minHeight: 24 }}
        data-testid="table-block-title"
      >
        {title}
      </div>
      <div className="flex-1 overflow-auto border border-t-0 border-border rounded-b-md">
        <table className="w-full border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              {data.columns.map((col, ci) => (
                <th
                  key={ci}
                  className="text-left px-2 py-1 font-semibold text-white truncate border-r border-white/20 last:border-r-0"
                  style={{
                    backgroundColor: data.headerColor || color,
                    width: colWidth,
                    height: headerHeight,
                  }}
                  onDoubleClick={(e) => handleHeaderDoubleClick(ci, col, e)}
                  data-testid={`table-header-${ci}`}
                >
                  {editingCell && editingCell.row === -1 && editingCell.col === ci ? (
                    <input
                      className="w-full bg-white/20 text-white text-xs px-1 py-0 border-0 outline-none rounded-sm"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleHeaderCommit}
                      onKeyDown={handleKeyDown}
                      onMouseDown={(e) => e.stopPropagation()}
                      autoFocus
                      data-testid={`table-header-editor-${ci}`}
                    />
                  ) : (
                    col
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr
                key={ri}
                className={data.stripedRows && ri % 2 === 1 ? 'bg-muted/30' : ''}
                style={{ height: rowHeight }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-2 py-1 text-foreground truncate border-r border-border/30 last:border-r-0 border-b border-border/20"
                    style={{ width: colWidth, height: rowHeight }}
                    onDoubleClick={(e) => handleCellDoubleClick(ri, ci, cell, e)}
                    data-testid={`table-cell-${ri}-${ci}`}
                  >
                    {editingCell && editingCell.row === ri && editingCell.col === ci ? (
                      <input
                        className="w-full bg-transparent text-xs px-0 py-0 border-0 border-b border-primary outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleCellCommit}
                        onKeyDown={handleKeyDown}
                        onMouseDown={(e) => e.stopPropagation()}
                        autoFocus
                        data-testid={`table-cell-editor-${ri}-${ci}`}
                      />
                    ) : (
                      cell || <span className="text-muted-foreground/40">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
