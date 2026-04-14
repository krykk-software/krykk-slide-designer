import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Block, StatData, SimpleValueData, ChartDataPoint, TextData, GanttData, ImageData, TableData, TimelineData, PipelineData, FunnelData, CalendarData, CalendarEventData, GRID_SIZE } from '@/lib/types';
import { StatBlock } from './StatBlock';
import { SimpleValueBlock } from './SimpleValueBlock';
import { ChartBlock } from './ChartBlock';
import { TextBlock } from './TextBlock';
import { GanttBlock } from './GanttBlock';
import ImageBlock from './ImageBlock';
import TableBlock from './TableBlock';
import { TimelineBlock } from './TimelineBlock';
import { PipelineBlock } from './PipelineBlock';
import { FunnelBlock } from './FunnelBlock';
import { CalendarBlock } from './CalendarBlock';
import { CalendarEventBlock } from './CalendarEventBlock';
import { X, Settings, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useCallback, useState } from 'react';
import { toPng } from 'html-to-image';

interface DraggableBlockProps {
  block: Block;
  onDrag: (id: string, position: { x: number; y: number }) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onResize?: (id: string, size: { width: number; height: number }) => void;
  onUpdateBlock?: (block: Block) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  isExporting?: boolean;
  snapToGrid?: boolean;
}

type ResizeDirection = 'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w' | 'n' | 's';

export function DraggableBlock({ block, onDrag, onDelete, onEdit, onResize, onUpdateBlock, onInteractionStart, onInteractionEnd, isExporting, snapToGrid = true }: DraggableBlockProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startPosX: number;
    startPosY: number;
    direction: ResizeDirection;
  } | null>(null);

  const snapToGridPosition = (x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE,
    };
  };

  const snapToGridSize = (w: number, h: number) => {
    if (!snapToGrid) return { width: w, height: h };
    return {
      width: Math.round(w / GRID_SIZE) * GRID_SIZE,
      height: Math.round(h / GRID_SIZE) * GRID_SIZE,
    };
  };

  const handleDragStart = () => {
    onInteractionStart?.();
  };

  const handleDrag = (_: DraggableEvent, data: DraggableData) => {
    const snappedPosition = snapToGridPosition(data.x, data.y);
    onDrag(block.id, snappedPosition);
  };

  const handleDragStop = (_: DraggableEvent, data: DraggableData) => {
    const snappedPosition = snapToGridPosition(data.x, data.y);
    onDrag(block.id, snappedPosition);
    onInteractionEnd?.();
  };

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onResize) return;

    onInteractionStart?.();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: block.size.width,
      startHeight: block.size.height,
      startPosX: block.position.x,
      startPosY: block.position.y,
      direction,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const { startX, startY, startWidth, startHeight, startPosX, startPosY, direction } = resizeRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newPosX = startPosX;
      let newPosY = startPosY;

      if (direction.includes('e')) {
        newWidth = Math.max(60, startWidth + deltaX);
      }
      if (direction.includes('w')) {
        newWidth = Math.max(60, startWidth - deltaX);
        newPosX = startPosX + (startWidth - newWidth);
      }
      if (direction.includes('s')) {
        newHeight = Math.max(40, startHeight + deltaY);
      }
      if (direction.includes('n')) {
        newHeight = Math.max(40, startHeight - deltaY);
        newPosY = startPosY + (startHeight - newHeight);
      }

      const snappedSize = snapToGridSize(newWidth, newHeight);
      const snappedPos = snapToGridPosition(newPosX, newPosY);

      onResize(block.id, snappedSize);
      if (direction.includes('w') || direction.includes('n')) {
        onDrag(block.id, snappedPos);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
      onInteractionEnd?.();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [block, onResize, onDrag, onInteractionStart, onInteractionEnd, snapToGrid]);

  const handleInlineUpdate = useCallback((updatedBlock: Block) => {
    if (onUpdateBlock) {
      onUpdateBlock(updatedBlock);
    }
  }, [onUpdateBlock]);

  const handleCopyAsImage = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const blockEl = nodeRef.current?.querySelector('.drag-handle');
    if (!blockEl) return;
    try {
      const dataUrl = await toPng(blockEl as HTMLElement, {
        backgroundColor: '#ffffff',
        quality: 1,
        pixelRatio: 2,
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
    } catch {
      try {
        const dataUrl = await toPng(blockEl as HTMLElement, {
          backgroundColor: '#ffffff',
          quality: 1,
          pixelRatio: 2,
        });
        const link = document.createElement('a');
        link.download = `${block.title.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = dataUrl;
        link.click();
      } catch { /* silent */ }
    }
  }, [block.title]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (isExporting) return;
    e.preventDefault();
    e.stopPropagation();
    handleCopyAsImage(e);
  }, [isExporting, handleCopyAsImage]);

  const renderBlockContent = () => {
    switch (block.type) {
      case 'stat':
        return (
          <StatBlock
            title={block.title}
            icon={block.icon}
            data={block.data as StatData}
            color={block.color}
            onTitleChange={onUpdateBlock ? (title: string) => {
              handleInlineUpdate({ ...block, title });
            } : undefined}
            onDataChange={onUpdateBlock ? (data: StatData) => {
              handleInlineUpdate({ ...block, data });
            } : undefined}
          />
        );
      case 'simple-value':
        return (
          <SimpleValueBlock
            title={block.title}
            icon={block.icon}
            data={block.data as SimpleValueData}
            color={block.color}
            onTitleChange={onUpdateBlock ? (title: string) => {
              handleInlineUpdate({ ...block, title });
            } : undefined}
            onDataChange={onUpdateBlock ? (data: SimpleValueData) => {
              handleInlineUpdate({ ...block, data });
            } : undefined}
          />
        );
      case 'pie-chart':
      case 'bar-chart':
        return (
          <ChartBlock
            title={block.title}
            icon={block.icon}
            type={block.type}
            data={block.data as ChartDataPoint[]}
            color={block.color}
            onTitleChange={onUpdateBlock ? (title: string) => {
              handleInlineUpdate({ ...block, title });
            } : undefined}
            onDataChange={onUpdateBlock ? (data: ChartDataPoint[]) => {
              handleInlineUpdate({ ...block, data });
            } : undefined}
          />
        );
      case 'text':
        return (
          <TextBlock
            data={block.data as TextData}
            onDataChange={onUpdateBlock ? (data: TextData) => {
              handleInlineUpdate({ ...block, data });
            } : undefined}
          />
        );
      case 'gantt':
        return (
          <GanttBlock
            title={block.title}
            data={block.data as GanttData}
            color={block.color}
          />
        );
      case 'image':
        return (
          <ImageBlock
            data={block.data as ImageData}
            width={block.size.width}
            height={block.size.height}
          />
        );
      case 'table':
        return (
          <TableBlock
            title={block.title}
            data={block.data as TableData}
            color={block.color}
            width={block.size.width}
            height={block.size.height}
            onUpdateData={onUpdateBlock ? (data: TableData) => {
              handleInlineUpdate({ ...block, data });
            } : undefined}
          />
        );
      case 'timeline':
        return (
          <TimelineBlock
            title={block.title}
            data={block.data as TimelineData}
            color={block.color}
            onTitleChange={onUpdateBlock ? (title: string) => {
              handleInlineUpdate({ ...block, title });
            } : undefined}
            onDataChange={onUpdateBlock ? (data: TimelineData) => {
              handleInlineUpdate({ ...block, data });
            } : undefined}
          />
        );
      case 'pipeline':
        return (
          <PipelineBlock
            title={block.title}
            icon={block.icon}
            data={block.data as PipelineData}
            color={block.color}
            onTitleChange={onUpdateBlock ? (title: string) => {
              handleInlineUpdate({ ...block, title });
            } : undefined}
            onDataChange={onUpdateBlock ? (data: PipelineData) => {
              handleInlineUpdate({ ...block, data });
            } : undefined}
          />
        );
      case 'funnel':
        return (
          <FunnelBlock
            title={block.title}
            icon={block.icon}
            data={block.data as FunnelData}
            color={block.color}
            onTitleChange={onUpdateBlock ? (title: string) => {
              handleInlineUpdate({ ...block, title });
            } : undefined}
            onDataChange={onUpdateBlock ? (data: FunnelData) => {
              handleInlineUpdate({ ...block, data });
            } : undefined}
          />
        );
      case 'calendar':
        return (
          <CalendarBlock
            title={block.title}
            data={block.data as CalendarData}
            color={block.color}
            onUpdate={onUpdateBlock ? (updates: Partial<CalendarData>) => {
              handleInlineUpdate({ ...block, data: { ...(block.data as CalendarData), ...updates } });
            } : undefined}
            isInteractive={!isExporting}
          />
        );
      case 'calendar-event':
        return (
          <CalendarEventBlock
            title={block.title}
            icon={block.icon}
            data={block.data as CalendarEventData}
            color={block.color}
            onTitleChange={onUpdateBlock ? (title: string) => {
              handleInlineUpdate({ ...block, title });
            } : undefined}
            onDataChange={onUpdateBlock ? (data: CalendarEventData) => {
              handleInlineUpdate({ ...block, data });
            } : undefined}
          />
        );
      default:
        return null;
    }
  };

  const resizeHandleClass = "absolute opacity-0 group-hover:opacity-100 transition-opacity z-10";

  return (
    <Draggable
      nodeRef={nodeRef}
      position={block.position}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      bounds="parent"
      handle=".drag-handle"
      grid={snapToGrid ? [GRID_SIZE, GRID_SIZE] : undefined}
      disabled={isResizing}
    >
      <div
        ref={nodeRef}
        className="absolute group"
        style={{
          width: block.size.width,
          height: block.size.height,
        }}
        onContextMenu={handleContextMenu}
        data-testid={`block-${block.id}`}
      >
        <div className="drag-handle w-full h-full">
          {renderBlockContent()}
        </div>
        
        {!isExporting && (
          <>
            <div className="block-controls absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Button
                size="icon"
                variant="secondary"
                className="w-6 h-6 rounded-full shadow-md"
                onClick={handleCopyAsImage}
                title="Copy as image"
                data-testid={`copy-block-${block.id}`}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-6 h-6 rounded-full shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(block.id);
                }}
                data-testid={`edit-block-${block.id}`}
              >
                <Settings className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="w-6 h-6 rounded-full shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(block.id);
                }}
                data-testid={`delete-block-${block.id}`}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            {onResize && (
              <>
                <div
                  className={`${resizeHandleClass} bottom-0 right-0 w-3 h-3 cursor-se-resize`}
                  onMouseDown={(e) => handleResizeStart(e, 'se')}
                  data-testid={`resize-se-${block.id}`}
                >
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-primary/60 rounded-br-sm" />
                </div>
                <div
                  className={`${resizeHandleClass} bottom-0 left-0 w-3 h-3 cursor-sw-resize`}
                  onMouseDown={(e) => handleResizeStart(e, 'sw')}
                  data-testid={`resize-sw-${block.id}`}
                >
                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-primary/60 rounded-bl-sm" />
                </div>
                <div
                  className={`${resizeHandleClass} top-0 right-0 w-3 h-3 cursor-ne-resize`}
                  onMouseDown={(e) => handleResizeStart(e, 'ne')}
                  data-testid={`resize-ne-${block.id}`}
                >
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-primary/60 rounded-tr-sm" />
                </div>
                <div
                  className={`${resizeHandleClass} top-0 left-0 w-3 h-3 cursor-nw-resize`}
                  onMouseDown={(e) => handleResizeStart(e, 'nw')}
                  data-testid={`resize-nw-${block.id}`}
                >
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-primary/60 rounded-tl-sm" />
                </div>
                <div
                  className={`${resizeHandleClass} top-0 left-3 right-3 h-1.5 cursor-n-resize`}
                  onMouseDown={(e) => handleResizeStart(e, 'n')}
                />
                <div
                  className={`${resizeHandleClass} bottom-0 left-3 right-3 h-1.5 cursor-s-resize`}
                  onMouseDown={(e) => handleResizeStart(e, 's')}
                />
                <div
                  className={`${resizeHandleClass} left-0 top-3 bottom-3 w-1.5 cursor-w-resize`}
                  onMouseDown={(e) => handleResizeStart(e, 'w')}
                />
                <div
                  className={`${resizeHandleClass} right-0 top-3 bottom-3 w-1.5 cursor-e-resize`}
                  onMouseDown={(e) => handleResizeStart(e, 'e')}
                />
              </>
            )}
          </>
        )}
      </div>
    </Draggable>
  );
}
