'use client';

/**
 * Garment Tag Preview Component
 *
 * Displays a preview of garment tags with print functionality.
 * V2.0: QR code support, batch printing, size options.
 *
 * @module components/features/printing/GarmentTagPreview
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Printer, QrCode, Tag, Maximize2, Settings2 } from 'lucide-react';
import type { GarmentTagData, TagGenerationOptions } from '@/lib/printing/garment-tag';
import {
  generateTagHtml,
  generateBatchTagsHtml,
  printTags,
  DEFAULT_TAG_OPTIONS,
  TAG_DIMENSIONS,
} from '@/lib/printing/garment-tag';

interface GarmentTagPreviewProps {
  /** Tag data to display */
  tags: GarmentTagData[];
  /** Show print options dialog */
  showOptions?: boolean;
  /** Initial tag size */
  initialSize?: 'small' | 'medium' | 'large';
  /** Callback when tags are printed */
  onPrint?: () => void;
}

export function GarmentTagPreview({
  tags,
  showOptions = true,
  initialSize = 'medium',
  onPrint,
}: GarmentTagPreviewProps) {
  const [options, setOptions] = useState<TagGenerationOptions>({
    ...DEFAULT_TAG_OPTIONS,
    tagSize: initialSize,
  });
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);

  // Generate preview when tags or options change
  useEffect(() => {
    const generatePreview = async () => {
      if (tags.length === 0) return;
      setLoading(true);
      try {
        if (selectedTagIndex !== null && tags[selectedTagIndex]) {
          const html = await generateTagHtml(tags[selectedTagIndex], options);
          setPreviewHtml(html);
        } else {
          // Show first tag as preview
          const html = await generateTagHtml(tags[0], options);
          setPreviewHtml(html);
        }
      } catch (error) {
        console.error('Failed to generate preview:', error);
      } finally {
        setLoading(false);
      }
    };

    generatePreview();
  }, [tags, options, selectedTagIndex]);

  const handlePrintAll = async () => {
    setLoading(true);
    try {
      const html = await generateBatchTagsHtml(tags, options);
      printTags(html);
      onPrint?.();
    } catch (error) {
      console.error('Failed to print tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintSingle = async (index: number) => {
    setLoading(true);
    try {
      const html = await generateBatchTagsHtml([tags[index]], options);
      printTags(html);
      onPrint?.();
    } catch (error) {
      console.error('Failed to print tag:', error);
    } finally {
      setLoading(false);
    }
  };

  if (tags.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No garments to generate tags for
        </CardContent>
      </Card>
    );
  }

  const dimensions = TAG_DIMENSIONS[options.tagSize];

  return (
    <div className="space-y-4">
      {/* Options Panel */}
      {showOptions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Tag Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Tag Size */}
              <div className="space-y-2">
                <Label className="text-xs">Tag Size</Label>
                <Select
                  value={options.tagSize}
                  onValueChange={(value: 'small' | 'medium' | 'large') =>
                    setOptions({ ...options, tagSize: value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (2x1&quot;)</SelectItem>
                    <SelectItem value="medium">Medium (3x2&quot;)</SelectItem>
                    <SelectItem value="large">Large (4x3&quot;)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Include QR Code */}
              <div className="space-y-2">
                <Label className="text-xs">QR Code</Label>
                <div className="flex items-center gap-2 h-8">
                  <Switch
                    checked={options.includeQr}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, includeQr: checked })
                    }
                  />
                  <span className="text-xs text-gray-500">
                    {options.includeQr ? 'Show' : 'Hide'}
                  </span>
                </div>
              </div>

              {/* Include Services */}
              <div className="space-y-2">
                <Label className="text-xs">Services</Label>
                <div className="flex items-center gap-2 h-8">
                  <Switch
                    checked={options.includeServices}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, includeServices: checked })
                    }
                  />
                  <span className="text-xs text-gray-500">
                    {options.includeServices ? 'Show' : 'Hide'}
                  </span>
                </div>
              </div>

              {/* Include Instructions */}
              <div className="space-y-2">
                <Label className="text-xs">Instructions</Label>
                <div className="flex items-center gap-2 h-8">
                  <Switch
                    checked={options.includeInstructions}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, includeInstructions: checked })
                    }
                  />
                  <span className="text-xs text-gray-500">
                    {options.includeInstructions ? 'Show' : 'Hide'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tag Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tag Preview
              <Badge variant="secondary" className="ml-2">
                {tags.length} tag{tags.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            <Button
              onClick={handlePrintAll}
              disabled={loading}
              size="sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {/* Preview Container */}
            <div
              className="bg-gray-100 p-4 rounded-lg flex items-center justify-center"
              style={{ minHeight: dimensions.height + 40 }}
            >
              {loading ? (
                <div className="text-gray-500 text-sm">Generating preview...</div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="transform scale-100"
                />
              )}
            </div>

            {/* Tag Selector */}
            {tags.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {tags.map((tag, index) => (
                  <Button
                    key={tag.garmentId}
                    variant={selectedTagIndex === index ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTagIndex(index)}
                    className="text-xs"
                  >
                    {tag.garmentType} ({tag.color})
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tag List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">All Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tags.map((tag, index) => (
              <div
                key={tag.garmentId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-black text-white text-xs px-2 py-1 rounded font-mono">
                    {tag.tagNumber}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {tag.garmentType} - {tag.color}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tag.brand !== 'No Brand' && `${tag.brand} | `}
                      {tag.services.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Tag Details</DialogTitle>
                        <DialogDescription>
                          {tag.tagNumber}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Order ID:</span>
                            <div className="font-medium">{tag.orderId}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Garment ID:</span>
                            <div className="font-medium">{tag.garmentId}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <div className="font-medium">{tag.garmentType}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Color:</span>
                            <div className="font-medium">{tag.color}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Brand:</span>
                            <div className="font-medium">{tag.brand}</div>
                          </div>
                          {tag.category && (
                            <div>
                              <span className="text-gray-500">Category:</span>
                              <div className="font-medium">{tag.category}</div>
                            </div>
                          )}
                          <div className="col-span-2">
                            <span className="text-gray-500">Services:</span>
                            <div className="font-medium">{tag.services.join(', ')}</div>
                          </div>
                          {tag.specialInstructions && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Instructions:</span>
                              <div className="font-medium">{tag.specialInstructions}</div>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-center">
                          {options.includeQr && (
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                              <QrCode className="h-4 w-4" />
                              QR code will be generated on print
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={() => handlePrintSingle(index)}>
                          <Printer className="h-4 w-4 mr-2" />
                          Print This Tag
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintSingle(index)}
                    disabled={loading}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GarmentTagPreview;
