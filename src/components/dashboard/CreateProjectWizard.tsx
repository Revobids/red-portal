'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  MapPin, 
  Building2, 
  Calendar, 
  Users, 
  Sparkles, 
  DollarSign,
  FileText,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector } from '@/redux/hooks';
import ImageUpload, { ImageData } from '@/components/ui/image-upload';
import ApiManager from '@/api/ApiManager';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const projectSchema = z.object({
  // Step 1: Basic Info
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  projectType: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE']),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'PLOT', 'OFFICE', 'SHOP', 'WAREHOUSE']),
  
  // Step 2: Location
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  
  // Step 3: Property Details
  totalUnits: z.number().min(1),
  totalArea: z.number().min(0),
  areaUnit: z.string().min(1, 'Area unit is required'),
  constructionStartDate: z.string().min(1, 'Construction start date is required'),
  expectedCompletionDate: z.string().min(1, 'Expected completion date is required'),
  
  // Step 4: Management
  projectManagerId: z.string().min(1, 'Project manager is required'),
  salesManagerId: z.string().min(1, 'Sales manager is required'),
  
  // Step 5: Amenities
  amenities: z.array(z.string()).min(1, 'At least one amenity is required'),
  amenitiesDescription: z.string().optional(),
  
  // Step 6: Pricing (Optional)
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  
  // Step 7: Legal (Optional)
  reraNumber: z.string().optional(),
  reraApprovalDate: z.string().optional(),
  reraWebsite: z.string().url().optional().or(z.literal('')),
  legalDetails: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

const steps = [
  { id: 1, name: 'Basic Info', icon: Building2 },
  { id: 2, name: 'Location', icon: MapPin },
  { id: 3, name: 'Property Details', icon: Building2 },
  { id: 4, name: 'Management', icon: Users },
  { id: 5, name: 'Amenities', icon: Sparkles },
  { id: 6, name: 'Pricing', icon: DollarSign },
  { id: 7, name: 'Legal Info', icon: FileText },
  { id: 8, name: 'Images', icon: ImageIcon },
];

export default function CreateProjectWizard({ onClose, onSuccess }: CreateProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [projectImages, setProjectImages] = useState<ImageData[]>([]);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  
  const employees = useAppSelector((state) => state.admin.employees);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectType: 'RESIDENTIAL',
      propertyType: 'APARTMENT',
      areaUnit: 'sqft',
      currency: 'INR',
      amenities: [],
    },
  });

  // Get manager options
  const managerOptions = employees.filter(emp => {
    const role = emp.role?.toLowerCase();
    return role === 'admin' || role === 'manager' || role === 'sales_manager';
  });
  const availableManagers = managerOptions.length > 0 ? managerOptions : employees;

  const validateStep = async (step: number) => {
    const fieldsToValidate: (keyof ProjectFormData)[][] = [
      ['name', 'description', 'projectType', 'propertyType'],
      ['address', 'city', 'state', 'pincode', 'latitude', 'longitude'],
      ['totalUnits', 'totalArea', 'areaUnit', 'constructionStartDate', 'expectedCompletionDate'],
      ['projectManagerId', 'salesManagerId'],
      ['amenities', 'amenitiesDescription'],
      ['minPrice', 'maxPrice', 'currency'],
      ['reraNumber', 'reraApprovalDate', 'reraWebsite', 'legalDetails'],
      [], // Images step - no validation needed
    ];

    if (step <= fieldsToValidate.length) {
      const fields = fieldsToValidate[step - 1];
      const result = await trigger(fields);
      return result;
    }
    return true;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      if (currentStep === 7 && !createdProjectId) {
        // Create project before moving to images step
        await createProject();
      } else if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createProject = async () => {
    const data = watch();
    setIsLoading(true);
    setError(null);
    
    try {
      const projectData = {
        ...data,
        amenities: amenities.filter(a => a.trim() !== ''),
        // Convert empty strings to undefined for optional fields
        description: data.description?.trim() || undefined,
        amenitiesDescription: data.amenitiesDescription?.trim() || undefined,
        reraNumber: data.reraNumber?.trim() || undefined,
        reraApprovalDate: data.reraApprovalDate?.trim() || undefined,
        reraWebsite: data.reraWebsite?.trim() || undefined,
        legalDetails: data.legalDetails?.trim() || undefined,
        minPrice: data.minPrice || undefined,
        maxPrice: data.maxPrice || undefined,
        currency: data.currency?.trim() || undefined,
        // Add empty arrays for now
        approvals: [],
        floorPlans: [],
        images: [],
        brochures: [],
      };

      const response = await ApiManager.createProject(projectData);
      
      if (response.success && response.data) {
        setCreatedProjectId(response.data.id);
        toast.success('Project created successfully');
        // Move to images step
        setCurrentStep(8);
      } else {
        const errorMessage = response.message || 'Failed to create project';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Project creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImages = async () => {
    if (!createdProjectId || projectImages.length === 0) {
      onSuccess();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const imagesToUpload = projectImages.filter(img => img.file);
      if (imagesToUpload.length > 0) {
        // Group images by type and caption since backend applies same metadata to all images in one request
        const imageGroups = new Map<string, typeof imagesToUpload>();
        
        imagesToUpload.forEach(img => {
          const key = `${img.type}|${img.caption || ''}`;
          if (!imageGroups.has(key)) {
            imageGroups.set(key, []);
          }
          imageGroups.get(key)!.push(img);
        });
        
        // Upload each group separately
        for (const [key, groupImages] of imageGroups) {
          const [type, caption] = key.split('|');
          const files = groupImages.map(img => img.file!);
          
          const metadata = {
            type: type as 'EXTERIOR' | 'INTERIOR' | 'FLOOR_PLAN' | 'AMENITY' | 'LOCATION' | 'CONSTRUCTION' | 'OTHER',
            caption: caption || undefined
          };
          
          await ApiManager.uploadProjectImages(createdProjectId, files, metadata);
        }
      }
      toast.success(`Images uploaded successfully!`);
      onSuccess();
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = 'Project created successfully, but some images failed to upload';
      setError(errorMessage);
      toast.error(errorMessage);
      // Still call success since project was created
      setTimeout(onSuccess, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async () => {
    if (currentStep === 8) {
      await uploadImages();
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      const newAmenities = [...amenities, amenityInput.trim()];
      setAmenities(newAmenities);
      setValue('amenities', newAmenities);
      setAmenityInput('');
    }
  };

  const removeAmenity = (index: number) => {
    const newAmenities = amenities.filter((_, i) => i !== index);
    setAmenities(newAmenities);
    setValue('amenities', newAmenities);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>Step {currentStep} of {steps.length}: {steps[currentStep - 1].name}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id || (createdProjectId && step.id <= 7);
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center relative">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                        isActive && "border-blue-600 bg-blue-600 text-white",
                        isCompleted && "border-green-600 bg-green-600 text-white",
                        !isActive && !isCompleted && "border-gray-300 bg-white text-gray-400"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs mt-1 absolute -bottom-5 whitespace-nowrap",
                      isActive && "text-blue-600 font-medium",
                      isCompleted && "text-green-600",
                      !isActive && !isCompleted && "text-gray-400"
                    )}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-2",
                      currentStep > step.id || (createdProjectId && step.id < 7) ? "bg-green-600" : "bg-gray-300"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Sunset Residences"
                    {...register('name')}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of the project..."
                    rows={4}
                    {...register('description')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select
                      value={watch('projectType')}
                      onValueChange={(value) => setValue('projectType', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                        <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                        <SelectItem value="MIXED_USE">Mixed Use</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.projectType && <p className="text-sm text-red-600">{errors.projectType.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={watch('propertyType')}
                      onValueChange={(value) => setValue('propertyType', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APARTMENT">Apartment</SelectItem>
                        <SelectItem value="VILLA">Villa</SelectItem>
                        <SelectItem value="PLOT">Plot</SelectItem>
                        <SelectItem value="OFFICE">Office</SelectItem>
                        <SelectItem value="SHOP">Shop</SelectItem>
                        <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.propertyType && <p className="text-sm text-red-600">{errors.propertyType.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Street address"
                    {...register('address')}
                  />
                  {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      {...register('city')}
                    />
                    {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      {...register('state')}
                    />
                    {errors.state && <p className="text-sm text-red-600">{errors.state.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="Pincode"
                      {...register('pincode')}
                    />
                    {errors.pincode && <p className="text-sm text-red-600">{errors.pincode.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 12.9716"
                      {...register('latitude', { valueAsNumber: true })}
                    />
                    {errors.latitude && <p className="text-sm text-red-600">{errors.latitude.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 77.5946"
                      {...register('longitude', { valueAsNumber: true })}
                    />
                    {errors.longitude && <p className="text-sm text-red-600">{errors.longitude.message}</p>}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 Tip: You can find coordinates using Google Maps. Right-click on a location and select "What's here?" to see the latitude and longitude.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Property Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalUnits">Total Units *</Label>
                    <Input
                      id="totalUnits"
                      type="number"
                      min="1"
                      placeholder="e.g., 100"
                      {...register('totalUnits', { valueAsNumber: true })}
                    />
                    {errors.totalUnits && <p className="text-sm text-red-600">{errors.totalUnits.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalArea">Total Area *</Label>
                    <Input
                      id="totalArea"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g., 50000"
                      {...register('totalArea', { valueAsNumber: true })}
                    />
                    {errors.totalArea && <p className="text-sm text-red-600">{errors.totalArea.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="areaUnit">Area Unit *</Label>
                    <Select
                      value={watch('areaUnit')}
                      onValueChange={(value) => setValue('areaUnit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sqft">Square Feet</SelectItem>
                        <SelectItem value="sqm">Square Meters</SelectItem>
                        <SelectItem value="acres">Acres</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.areaUnit && <p className="text-sm text-red-600">{errors.areaUnit.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="constructionStartDate">Construction Start Date *</Label>
                    <Input
                      id="constructionStartDate"
                      type="date"
                      {...register('constructionStartDate')}
                    />
                    {errors.constructionStartDate && <p className="text-sm text-red-600">{errors.constructionStartDate.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedCompletionDate">Expected Completion Date *</Label>
                    <Input
                      id="expectedCompletionDate"
                      type="date"
                      {...register('expectedCompletionDate')}
                    />
                    {errors.expectedCompletionDate && <p className="text-sm text-red-600">{errors.expectedCompletionDate.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Management */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectManagerId">Project Manager *</Label>
                  <Select
                    value={watch('projectManagerId')}
                    onValueChange={(value) => setValue('projectManagerId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableManagers.length === 0 ? (
                        <SelectItem value="no-managers" disabled>
                          No employees available
                        </SelectItem>
                      ) : (
                        availableManagers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} ({manager.role})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.projectManagerId && <p className="text-sm text-red-600">{errors.projectManagerId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salesManagerId">Sales Manager *</Label>
                  <Select
                    value={watch('salesManagerId')}
                    onValueChange={(value) => setValue('salesManagerId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sales manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableManagers.length === 0 ? (
                        <SelectItem value="no-managers" disabled>
                          No employees available
                        </SelectItem>
                      ) : (
                        availableManagers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} ({manager.role})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.salesManagerId && <p className="text-sm text-red-600">{errors.salesManagerId.message}</p>}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    💡 Tip: You can assign additional team members to this project later from the project details page.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Amenities */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add amenity (e.g., Swimming Pool, Gym)"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                  />
                  <Button type="button" onClick={addAmenity} variant="outline">
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1.5 px-3">
                      {amenity}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                        onClick={() => removeAmenity(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                {amenities.length === 0 && (
                  <p className="text-sm text-red-600">At least one amenity is required</p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amenitiesDescription">Amenities Description (Optional)</Label>
                  <Textarea
                    id="amenitiesDescription"
                    placeholder="Provide additional details about amenities..."
                    rows={3}
                    {...register('amenitiesDescription')}
                  />
                </div>

                {/* Common amenities suggestions */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Common amenities:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Swimming Pool', 'Gym', 'Clubhouse', 'Children\'s Play Area', 'Garden', 'Parking', 'Security', 'Power Backup'].map((amenity) => (
                      <Button
                        key={amenity}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!amenities.includes(amenity)) {
                            const newAmenities = [...amenities, amenity];
                            setAmenities(newAmenities);
                            setValue('amenities', newAmenities);
                          }
                        }}
                        disabled={amenities.includes(amenity)}
                      >
                        {amenity}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Pricing (Optional) */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPrice">Minimum Price</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g., 5000000"
                      {...register('minPrice', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Maximum Price</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g., 10000000"
                      {...register('maxPrice', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={watch('currency')}
                      onValueChange={(value) => setValue('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    This section is optional. You can add pricing information later if needed.
                  </p>
                </div>
              </div>
            )}

            {/* Step 7: Legal Information (Optional) */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reraNumber">RERA Number</Label>
                    <Input
                      id="reraNumber"
                      placeholder="e.g., RERA123456789"
                      {...register('reraNumber')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reraApprovalDate">RERA Approval Date</Label>
                    <Input
                      id="reraApprovalDate"
                      type="date"
                      {...register('reraApprovalDate')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reraWebsite">RERA Website URL</Label>
                  <Input
                    id="reraWebsite"
                    type="url"
                    placeholder="https://example-rera-website.com"
                    {...register('reraWebsite')}
                  />
                  {errors.reraWebsite && <p className="text-sm text-red-600">{errors.reraWebsite.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalDetails">Legal Details</Label>
                  <Textarea
                    id="legalDetails"
                    placeholder="Enter any legal information or compliance details..."
                    rows={4}
                    {...register('legalDetails')}
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    This section is optional. You can add legal information later if needed.
                  </p>
                </div>
              </div>
            )}

            {/* Step 8: Images */}
            {currentStep === 8 && (
              <div className="space-y-4">
                {createdProjectId ? (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800">
                        ✅ Project created successfully! Now you can add images to showcase your project.
                      </p>
                    </div>
                    <ImageUpload
                      images={projectImages}
                      onImagesChange={setProjectImages}
                      maxImages={10}
                    />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Please complete the previous steps first.</p>
                  </div>
                )}
              </div>
            )}
          </form>
        </CardContent>

        <div className="border-t p-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep < 7 && (
              <Button
                type="button"
                onClick={nextStep}
                disabled={isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            
            {currentStep === 7 && (
              <Button
                type="button"
                onClick={nextStep}
                disabled={isLoading || amenities.length === 0}
              >
                {isLoading ? 'Creating Project...' : 'Create Project & Add Images'}
              </Button>
            )}
            
            {currentStep === 8 && (
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? 'Uploading...' : projectImages.length > 0 ? 'Upload Images & Finish' : 'Finish'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}