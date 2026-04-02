import { ImageData } from '@/lib/types';

interface ImageBlockProps {
  data: ImageData;
  width: number;
  height: number;
}

export default function ImageBlock({ data, width, height }: ImageBlockProps) {
  if (!data.src) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground text-sm"
        style={{ width, height }}
      >
        No image
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden" style={{ width, height }}>
      <img
        src={data.src}
        alt={data.alt || 'Uploaded image'}
        className="w-full h-full"
        style={{ objectFit: data.objectFit || 'contain' }}
        data-testid="image-block-img"
      />
    </div>
  );
}
