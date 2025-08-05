'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ApiManager from '@/api/ApiManager';
import { Project } from '@/types';
import { toast } from 'sonner';

export type ImageType = 'EXTERIOR' | 'INTERIOR' | 'FLOOR_PLAN' | 'AMENITY' | 'LOCATION' | 'CONSTRUCTION' | 'OTHER';

export interface ProjectImage {
  url: string;
  type: ImageType;
  caption: string;
}

interface NewImage {
  file: File;
  type: ImageType;
  caption: string;
  preview: string;
}

interface ProjectImageModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function ProjectImageModal({ project, isOpen, onClose, onSuccess }: ProjectImageModalProps) {
  const [existingImages, setExistingImages] = useState<ProjectImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const loadProjectImages = () => {
    if (project) {
      // Load existing images
      const images = (project.images || []).map(img => ({
        url: img.url,
        type: img.type as ImageType,
        caption: img.caption
      }));
      setExistingImages(images);
    }
  };

  useEffect(() => {
    if (project && isOpen) {
      loadProjectImages();
      setNewImages([]);
      setError(null);
      setSuccess(null);
    }
  }, [project, isOpen]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !project) return;

    const validFiles: NewImage[] = [];
    const totalImages = existingImages.length + newImages.length;
    const remainingSlots = 10 - totalImages; // Max 10 images

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`File ${file.name} is not an image`);
        continue;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      validFiles.push({
        file,
        type: 'OTHER',
        caption: '',
        preview,
      });
    }

    setNewImages(prev => [...prev, ...validFiles]);
    setError(null);
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

  const updateNewImage = (index: number, updates: Partial<NewImage>) => {
    setNewImages(prev => prev.map((img, i) => 
      i === index ? { ...img, ...updates } : img
    ));
  };

  const removeNewImage = (index: number) => {
    const image = newImages[index];
    URL.revokeObjectURL(image.preview);
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async (imageUrl: string) => {
    if (!project) return;
    
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await ApiManager.deleteProjectImage(project.id, { imageUrl });
      
      // API returns success response with message property directly
      if (response.message && response.message.includes('successfully')) {
        // Update local state immediately for smooth UX
        setExistingImages(prev => prev.filter(img => img.url !== imageUrl));
        setError(null);
        toast.success('Image deleted successfully');
        
        // Refresh project data from API
        onSuccess();
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadNewImages = async () => {
    if (!project || newImages.length === 0) {
      onSuccess();
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      // Group images by type and caption since backend applies same metadata to all images in one request
      const imageGroups = new Map<string, NewImage[]>();
      
      newImages.forEach(img => {
        const key = `${img.type}|${img.caption || ''}`;
        if (!imageGroups.has(key)) {
          imageGroups.set(key, []);
        }
        imageGroups.get(key)!.push(img);
      });
      
      let totalUploaded = 0;
      
      // Upload each group separately
      for (const [key, groupImages] of imageGroups) {
        const [type, caption] = key.split('|');
        const files = groupImages.map(img => img.file);
        
        const metadata = {
          type: type as ImageType,
          caption: caption || undefined
        };
        
        const response = await ApiManager.uploadProjectImages(project.id, files, metadata);
        
        // API returns array of uploaded images directly, not wrapped in success/error response
        if (!Array.isArray(response)) {
          throw new Error('Failed to upload images');
        }
        
        totalUploaded += files.length;
      }
      
      // Clean up preview URLs
      newImages.forEach(img => URL.revokeObjectURL(img.preview));
      
      toast.success(`Successfully uploaded ${totalUploaded} image${totalUploaded > 1 ? 's' : ''}!`);
      
      // Refresh project data from API to get updated images list
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload some images. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    newImages.forEach(img => URL.revokeObjectURL(img.preview));
    setNewImages([]);
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!project) return null;

  const totalImages = existingImages.length + newImages.length;
  const canAddMore = totalImages < 10;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Manage Images: {project.name}
          </DialogTitle>
          <DialogDescription>
            Upload, manage, and organize images for this project. You can add up to 10 images with different types and captions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2" style={{ maxHeight: 'calc(90vh - 150px)' }}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Image Stats */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{existingImages.length}</p>
                <p className="text-sm text-gray-600">Existing</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{newImages.length}</p>
                <p className="text-sm text-gray-600">New</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalImages}/10</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
            <Badge variant="outline">
              {canAddMore ? `${10 - totalImages} slots remaining` : 'Maximum reached'}
            </Badge>
          </div>

          {/* Upload Area */}
          {canAddMore && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  handleFileSelect(target.files);
                };
                input.click();
              }}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-1">
                Click to upload or drag and drop images here
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG, WebP up to 5MB each
              </p>
            </div>
          )}

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Existing Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {existingImages.map((image, index) => (
                  <Card key={image.url} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {IMAGE_TYPE_OPTIONS.find(opt => opt.value === image.type)?.label}
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteExistingImage(image.url)}
                          disabled={isLoading}
                          title="Delete this image permanently"
                        >
                          {isLoading ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="aspect-video mb-3 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.caption || 'Project image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {image.caption || 'No caption'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {newImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">New Images to Upload</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newImages.map((image, index) => (
                  <Card key={index} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          New
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">Image Type</Label>
                        <Select
                          value={image.type}
                          onValueChange={(value) => updateNewImage(index, { type: value as ImageType })}
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

                      <div className="space-y-2">
                        <Label className="text-xs">Caption</Label>
                        <Textarea
                          placeholder="Describe this image..."
                          value={image.caption}
                          onChange={(e) => updateNewImage(index, { caption: e.target.value })}
                          className="h-16 text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          💡 Images with the same type and caption will be uploaded together
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalImages === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
              <p className="text-gray-600 mb-4">Upload some images to showcase your project</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t pt-4 flex justify-between items-center flex-shrink-0">
          <p className="text-sm text-gray-500">
            {existingImages.length} existing • {newImages.length} new images
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Close
            </Button>
            {newImages.length > 0 && (
              <Button onClick={uploadNewImages} disabled={isLoading}>
                {isLoading ? 'Uploading...' : `Upload ${newImages.length} Image${newImages.length > 1 ? 's' : ''}`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}