import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  imageData: string | null;
}

export function ExportDialog({ open, onClose, imageData }: ExportDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.download = `slide-${Date.now()}.png`;
    link.href = imageData;
    link.click();
  };

  const handleCopy = async () => {
    if (!imageData) return;

    try {
      const response = await fetch(imageData);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl" data-testid="export-dialog">
        <DialogHeader>
          <DialogTitle>Export Slide</DialogTitle>
          <DialogDescription>
            Download or copy your slide as a PNG image.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {imageData ? (
            <div className="relative border border-border rounded-md overflow-hidden bg-muted/30">
              <img
                src={imageData}
                alt="Exported slide"
                className="w-full h-auto"
                data-testid="export-preview"
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-md">
              <p className="text-muted-foreground">Generating image...</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!imageData}
            data-testid="button-copy-image"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!imageData}
            data-testid="button-download-image"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
