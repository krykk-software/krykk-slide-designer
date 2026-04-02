import { BLOCK_TEMPLATES, CATEGORIES, BlockTemplate, ImageData, BLOCK_COLORS } from '@/lib/types';
import { colorWithAlpha } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LucideIcon, Upload, Image } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { SiHubspot } from 'react-icons/si';
import { HubSpotPanel } from './HubSpotPanel';

interface BlockPickerProps {
  onAddBlock: (template: BlockTemplate) => void;
  onAddImageBlock?: (imageData: ImageData) => void;
}

export function BlockPicker({ onAddBlock, onAddImageBlock }: BlockPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTemplatesByCategory = (category: string) => {
    return BLOCK_TEMPLATES.filter(t => t.category === category);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAddImageBlock) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        onAddImageBlock({ src, objectFit: 'contain' });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Add Blocks</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click or drag blocks to your slide
        </p>
      </div>

      <Tabs defaultValue="blocks" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-3 mb-0 grid grid-cols-2 shrink-0" data-testid="tabs-block-picker">
          <TabsTrigger value="blocks" data-testid="tab-blocks">Blocks</TabsTrigger>
          <TabsTrigger value="hubspot" className="flex items-center gap-1.5" data-testid="tab-hubspot">
            <SiHubspot className="w-3 h-3 text-orange-500" />
            HubSpot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="mb-4 p-3 border border-dashed border-border rounded-lg bg-card/50">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Upload Image</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Add your own images, logos, or graphics
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  data-testid="input-image-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-image"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              </div>

              <Accordion type="multiple" defaultValue={CATEGORIES.map(c => c)} className="space-y-2">
                {CATEGORIES.map((category) => {
                  const templates = getTemplatesByCategory(category);
                  if (templates.length === 0) return null;

                  return (
                    <AccordionItem
                      key={category}
                      value={category}
                      className="border rounded-md bg-card/50"
                    >
                      <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
                        {category} KPIs
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <div className="grid grid-cols-2 gap-2">
                          {templates.map((template, index) => {
                            const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[template.icon] || LucideIcons.Activity;

                            return (
                              <Card
                                key={`${template.title}-${index}`}
                                className="p-2 cursor-grab hover-elevate active-elevate-2 transition-all active:cursor-grabbing"
                                onClick={() => onAddBlock(template)}
                                draggable
                                onDragStart={(e) => {
                                  const templateIndex = BLOCK_TEMPLATES.indexOf(template);
                                  e.dataTransfer.setData('application/block-template-index', String(templateIndex));
                                  e.dataTransfer.effectAllowed = 'copy';
                                }}
                                data-testid={`add-block-${template.title.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <div className="flex items-center gap-2 pointer-events-none">
                                  <div
                                    className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: colorWithAlpha(template.color, 0.125) }}
                                  >
                                    <IconComponent
                                      className="w-3 h-3"
                                      style={{ color: template.color }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-foreground truncate">
                                    {template.title}
                                  </span>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="hubspot" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <HubSpotPanel onAddBlock={onAddBlock} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
