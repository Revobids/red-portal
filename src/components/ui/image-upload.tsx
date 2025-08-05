'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export type ImageType = 'EXTERIOR' | 'INTERIOR' | 'FLOOR_PLAN' | 'AMENITY' | 'LOCATION' | 'CONSTRUCTION' | 'OTHER';

export interface ImageData {
  file?: File;
  url?: string;
  type: ImageType;
  caption: string;
  preview?: string;
}

interface ImageUploadProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  maxImages?: number;
  onDeleteExisting?: (imageUrl: string) => Promise<void>;
}

const IMAGE_TYPE_OPTIONS = [
  { value: 'EXTERIOR', label: 'Exterior' },
  { value: 'INTERIOR', label: 'Interior' },
  { value: 'FLOOR_PLAN', label: 'Floor Plan' },
  { value: 'AMENITY', label: 'Amenity' },
  { value: 'LOCATION', label: 'Location' },
  { value: 'CONSTRUCTION', label: 'Construction' },
  { value: 'OTHER', label: 'Other' },
];

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  onDeleteExisting 
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages: ImageData[] = [];
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image`);
        continue;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);

      newImages.push({
        file,
        type: 'OTHER',
        caption: '',
        preview,
      });
    }

    onImagesChange([...images, ...newImages]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const updateImage = (index: number, updates: Partial<ImageData>) => {
    const updatedImages = images.map((img, i) => 
      i === index ? { ...img, ...updates } : img
    );
    onImagesChange(updatedImages);
  };

  const removeImage = async (index: number) => {
    const image = images[index];
    
    // If it's an existing image (has URL but not file), call delete callback
    if (image.url && !image.file && onDeleteExisting) {
      setIsUploading(true);
      try {
        await onDeleteExisting(image.url);
        // The parent component handles the state update after successful API call
      } catch (error) {
        console.error('Failed to delete image:', error);
        // The parent component will show the error
      } finally {
        setIsUploading(false);
      }
    } else {
      // For new images, just remove from local state
      // Clean up preview URL if it exists
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }

      const updatedImages = images.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Project Images</Label>
        <Badge variant="secondary" className="text-xs">
          {images.length} / {maxImages}
        </Badge>
      </div>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            Click to upload or drag and drop images here
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, JPEG, WebP up to 5MB each
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image Preview */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {(image.preview || image.url) ? (
                        <img
                          src={image.preview || image.url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Delete Button */}
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-md"
                      onClick={() => removeImage(index)}
                      disabled={isUploading}
                      title={image.url && !image.file ? 'Delete image permanently' : 'Remove image'}
                    >
                      {isUploading ? (
                        <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {/* Image Details */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`image-type-${index}`} className="text-xs">
                          Image Type
                        </Label>
                        {image.url && !image.file && (
                          <Badge variant="secondary" className="text-xs">
                            Existing
                          </Badge>
                        )}
                        {image.file && (
                          <Badge variant="outline" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <Select
                        value={image.type}
                        onValueChange={(value) => updateImage(index, { type: value as ImageType })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMAGE_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`image-caption-${index}`} className="text-xs">
                        Caption (Optional)
                      </Label>
                      <Input
                        id={`image-caption-${index}`}
                        placeholder="Describe this image..."
                        value={image.caption}
                        onChange={(e) => updateImage(index, { caption: e.target.value })}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}