import { Block, CanvasSize, DEFAULT_CANVAS_SIZE, FooterSettings } from '@/lib/types';
import { DraggableBlock } from './DraggableBlock';
import { forwardRef } from 'react';

interface SlideCanvasProps {
  blocks: Block[];
  onDragBlock: (id: string, position: { x: number; y: number }) => void;
  onDeleteBlock: (id: string) => void;
  onEditBlock: (id: string) => void;
  onResizeBlock?: (id: string, size: { width: number; height: number }) => void;
  onUpdateBlock?: (block: Block) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  isExporting?: boolean;
  canvasSize?: CanvasSize;
  footer?: FooterSettings;
}

export const SlideCanvas = forwardRef<HTMLDivElement, SlideCanvasProps>(
  ({ blocks, onDragBlock, onDeleteBlock, onEditBlock, onResizeBlock, onUpdateBlock, onInteractionStart, onInteractionEnd, isExporting, canvasSize = DEFAULT_CANVAS_SIZE, footer }, ref) => {
    const footerHeight = footer?.enabled ? footer.height : 0;
    const contentHeight = canvasSize.height - footerHeight;

    return (
      <div
        ref={ref}
        className={`slide-canvas relative w-full h-full ${isExporting ? 'export-mode' : ''}`}
        style={{ width: canvasSize.width, height: canvasSize.height }}
        data-testid="slide-canvas"
      >
        <div 
          className="relative"
          style={{ width: canvasSize.width, height: contentHeight }}
        >
          {blocks.length === 0 && !isExporting && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-muted-foreground text-lg">
                  Your slide is empty
                </p>
                <p className="text-muted-foreground/60 text-sm mt-1">
                  Add blocks from the sidebar to get started
                </p>
              </div>
            </div>
          )}
          
          {blocks.map((block) => (
            <DraggableBlock
              key={block.id}
              block={block}
              onDrag={onDragBlock}
              onDelete={onDeleteBlock}
              onEdit={onEditBlock}
              onResize={onResizeBlock}
              onUpdateBlock={onUpdateBlock}
              onInteractionStart={onInteractionStart}
              onInteractionEnd={onInteractionEnd}
              isExporting={isExporting}
            />
          ))}
        </div>

        {footer?.enabled && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center px-4"
            style={{
              height: footer.height,
              backgroundColor: footer.backgroundColor,
            }}
            data-testid="slide-footer"
          >
            {footer.logoSrc && footer.logoPosition === 'left' && (
              <img
                src={footer.logoSrc}
                alt="Logo"
                className="h-full py-2 object-contain"
                style={{ maxHeight: footer.height - 16 }}
                data-testid="footer-logo"
              />
            )}
            
            <div 
              className={`flex-1 ${footer.logoPosition === 'center' ? 'text-center' : footer.logoPosition === 'right' ? 'text-left' : 'text-right'}`}
              style={{ color: footer.textColor }}
            >
              {footer.text}
            </div>

            {footer.logoSrc && footer.logoPosition === 'center' && (
              <img
                src={footer.logoSrc}
                alt="Logo"
                className="absolute left-1/2 -translate-x-1/2 h-full py-2 object-contain"
                style={{ maxHeight: footer.height - 16 }}
                data-testid="footer-logo"
              />
            )}

            {footer.logoSrc && footer.logoPosition === 'right' && (
              <img
                src={footer.logoSrc}
                alt="Logo"
                className="h-full py-2 object-contain"
                style={{ maxHeight: footer.height - 16 }}
                data-testid="footer-logo"
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

SlideCanvas.displayName = 'SlideCanvas';
