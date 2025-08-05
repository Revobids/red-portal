'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, FolderOpen, Calendar, Eye, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setProjectFormField, resetProjectForm, setProjects, setLoading, setError } from '@/redux/slices/adminSlice';
import ApiManager from '@/api/ApiManager';
import EditProjectModal from './EditProjectModal';
import ImageUpload, { ImageData } from '@/components/ui/image-upload';
import { Project } from '@/types';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  projectType: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE']),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'PLOT', 'OFFICE', 'SHOP', 'WAREHOUSE']),
  totalUnits: z.number().min(1),
  totalArea: z.number().min(0),
  areaUnit: z.string().min(1, 'Area unit is required'),
  expectedCompletionDate: z.string().min(1, 'Expected completion date is required'),
  constructionStartDate: z.string().min(1, 'Construction start date is required'),
  amenities: z.array(z.string()).optional(),
  amenitiesDescription: z.string().optional(),
  projectManagerId: z.string().min(1, 'Project manager is required'),
  salesManagerId: z.string().min(1, 'Sales manager is required'),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  reraNumber: z.string().optional(),
  reraApprovalDate: z.string().optional().refine((date) => {
    if (!date) return true; // Optional field
    return !isNaN(Date.parse(date)); // Must be valid date string
  }, 'Must be a valid date'),
  reraWebsite: z.string().optional().refine((url) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, 'Must be a valid URL'),
  legalDetails: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectManagement() {
  const [showForm, setShowForm] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectImages, setProjectImages] = useState<ImageData[]>([]);
  const dispatch = useAppDispatch();
  const { addProjectForm, projects, employees, isLoading } = useAppSelector((state) => state.admin);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    values: {
      name: addProjectForm.name,
      description: addProjectForm.description,
      address: addProjectForm.address,
      city: addProjectForm.city,
      state: addProjectForm.state,
      pincode: addProjectForm.pincode,
      latitude: addProjectForm.latitude,
      longitude: addProjectForm.longitude,
      projectType: addProjectForm.projectType,
      propertyType: addProjectForm.propertyType,
      totalUnits: addProjectForm.totalUnits,
      totalArea: addProjectForm.totalArea,
      areaUnit: addProjectForm.areaUnit,
      expectedCompletionDate: addProjectForm.expectedCompletionDate,
      constructionStartDate: addProjectForm.constructionStartDate,
      amenities: addProjectForm.amenities,
      amenitiesDescription: addProjectForm.amenitiesDescription,
      projectManagerId: addProjectForm.projectManagerId,
      salesManagerId: addProjectForm.salesManagerId,
      minPrice: addProjectForm.minPrice,
      maxPrice: addProjectForm.maxPrice,
      currency: addProjectForm.currency,
      reraNumber: addProjectForm.reraNumber,
      reraApprovalDate: addProjectForm.reraApprovalDate,
      reraWebsite: addProjectForm.reraWebsite,
      legalDetails: addProjectForm.legalDetails,
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    dispatch(setLoading(true));
    
    try {
      // Prepare the complete project data matching the API requirements
      const projectData = {
        ...data,
        amenities: addProjectForm.amenities.filter(a => a.trim() !== ''),
        amenitiesDescription: data.amenitiesDescription?.trim() || undefined,
        approvals: addProjectForm.approvals,
        floorPlans: addProjectForm.floorPlans,
        images: addProjectForm.images,
        brochures: addProjectForm.brochures,
        // Convert empty strings to undefined for optional fields
        reraNumber: data.reraNumber?.trim() || undefined,
        reraApprovalDate: data.reraApprovalDate?.trim() || undefined,
        reraWebsite: data.reraWebsite?.trim() || undefined,
        legalDetails: data.legalDetails?.trim() || undefined,
        minPrice: data.minPrice || undefined,
        maxPrice: data.maxPrice || undefined,
        currency: data.currency?.trim() || undefined,
      };

      console.log('Sending project data:', projectData);
      const response = await ApiManager.createProject(projectData);
      
      if (response.success && response.data) {
        const projectId = response.data.id;
        
        // Upload images if any
        if (projectImages.length > 0 && projectId) {
          try {
            const imagesToUpload = projectImages.filter(img => img.file);
            if (imagesToUpload.length > 0) {
              const files = imagesToUpload.map(img => img.file!);
              const metadata = imagesToUpload.map(img => ({
                imageType: img.type,
                caption: img.caption
              }));
              
              await ApiManager.uploadProjectImages(projectId, files, metadata);
            }
          } catch (imageError) {
            console.error('Image upload error:', imageError);
            // Don't fail the whole operation for image upload errors
          }
        }
        
        // Refresh the projects list
        const projectsResponse = await ApiManager.getProjects();
        if (projectsResponse.success && projectsResponse.data) {
          dispatch(setProjects(projectsResponse.data));
        }
        
        dispatch(resetProjectForm());
        reset();
        setProjectImages([]);
        setShowForm(false);
        dispatch(setError(null));
      } else {
        dispatch(setError(response.message || 'Failed to create project'));
      }
    } catch (error) {
      console.error('Project creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFormFieldChange = (field: string, value: string | number | boolean | string[]) => {
    dispatch(setProjectFormField({ field, value }));
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      const newAmenities = [...addProjectForm.amenities.filter(a => a.trim() !== ''), amenityInput.trim()];
      handleFormFieldChange('amenities', newAmenities);
      setAmenityInput('');
    }
  };

  const removeAmenity = (index: number) => {
    const newAmenities = addProjectForm.amenities.filter((_, i) => i !== index);
    handleFormFieldChange('amenities', newAmenities);
  };

  // Get manager options - handle both uppercase and lowercase role formats
  const managerOptions = employees.filter(emp => {
    const role = emp.role?.toUpperCase();
    return role === 'ADMIN' || role === 'MANAGER' || role === 'SALES_MANAGER';
  });

  // If no managers found, show all employees as fallback for testing
  const availableManagers = managerOptions.length > 0 ? managerOptions : employees;

  console.log('All employees:', employees.map(emp => ({ name: emp.name, role: emp.role })));
  console.log('Filtered manager options:', managerOptions.map(emp => ({ name: emp.name, role: emp.role })));
  console.log('Available managers for dropdown:', availableManagers.map(emp => ({ name: emp.name, role: emp.role })));

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    // Refresh the projects list
    const projectsResponse = await ApiManager.getProjects();
    if (projectsResponse.success && projectsResponse.data) {
      dispatch(setProjects(projectsResponse.data));
    }
    setEditingProject(null);
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Project Management</h2>
          <p className="text-slate-600">Manage your real estate projects and listings</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* Add Project Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Project</CardTitle>
            <CardDescription>Create a new real estate project with complete details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Sunset Residences"
                      {...register('name')}
                      onChange={(e) => handleFormFieldChange('name', e.target.value)}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select
                      value={addProjectForm.projectType}
                      onValueChange={(value) => {
                        handleFormFieldChange('projectType', value);
                        setValue('projectType', value as 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                        <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                        <SelectItem value="MIXED_USE">Mixed Use</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.projectType && <p className="text-sm text-red-600">{errors.projectType.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of the project..."
                    rows={3}
                    {...register('description')}
                    onChange={(e) => handleFormFieldChange('description', e.target.value)}
                  />
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Location Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Street address"
                    {...register('address')}
                    onChange={(e) => handleFormFieldChange('address', e.target.value)}
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
                      onChange={(e) => handleFormFieldChange('city', e.target.value)}
                    />
                    {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      {...register('state')}
                      onChange={(e) => handleFormFieldChange('state', e.target.value)}
                    />
                    {errors.state && <p className="text-sm text-red-600">{errors.state.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="Pincode"
                      {...register('pincode')}
                      onChange={(e) => handleFormFieldChange('pincode', e.target.value)}
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
                      onChange={(e) => handleFormFieldChange('latitude', parseFloat(e.target.value) || 0)}
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
                      onChange={(e) => handleFormFieldChange('longitude', parseFloat(e.target.value) || 0)}
                    />
                    {errors.longitude && <p className="text-sm text-red-600">{errors.longitude.message}</p>}
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Property Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={addProjectForm.propertyType}
                      onValueChange={(value) => {
                        handleFormFieldChange('propertyType', value);
                        setValue('propertyType', value as 'APARTMENT' | 'VILLA' | 'PLOT' | 'OFFICE' | 'SHOP' | 'WAREHOUSE');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
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

                  <div className="space-y-2">
                    <Label htmlFor="totalUnits">Total Units *</Label>
                    <Input
                      id="totalUnits"
                      type="number"
                      min="1"
                      {...register('totalUnits', { valueAsNumber: true })}
                      onChange={(e) => handleFormFieldChange('totalUnits', parseInt(e.target.value) || 1)}
                    />
                    {errors.totalUnits && <p className="text-sm text-red-600">{errors.totalUnits.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalArea">Total Area *</Label>
                    <Input
                      id="totalArea"
                      type="number"
                      min="0"
                      step="any"
                      {...register('totalArea', { valueAsNumber: true })}
                      onChange={(e) => handleFormFieldChange('totalArea', parseFloat(e.target.value) || 0)}
                    />
                    {errors.totalArea && <p className="text-sm text-red-600">{errors.totalArea.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="areaUnit">Area Unit *</Label>
                    <Select
                      value={addProjectForm.areaUnit}
                      onValueChange={(value) => {
                        handleFormFieldChange('areaUnit', value);
                        setValue('areaUnit', value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select area unit" />
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
              </div>

              {/* Project Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Project Timeline</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="constructionStartDate">Construction Start Date *</Label>
                    <Input
                      id="constructionStartDate"
                      type="date"
                      {...register('constructionStartDate')}
                      onChange={(e) => handleFormFieldChange('constructionStartDate', e.target.value)}
                    />
                    {errors.constructionStartDate && <p className="text-sm text-red-600">{errors.constructionStartDate.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedCompletionDate">Expected Completion Date *</Label>
                    <Input
                      id="expectedCompletionDate"
                      type="date"
                      {...register('expectedCompletionDate')}
                      onChange={(e) => handleFormFieldChange('expectedCompletionDate', e.target.value)}
                    />
                    {errors.expectedCompletionDate && <p className="text-sm text-red-600">{errors.expectedCompletionDate.message}</p>}
                  </div>
                </div>
              </div>

              {/* Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Project Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectManagerId">Project Manager *</Label>
                    <Select
                      value={addProjectForm.projectManagerId}
                      onValueChange={(value) => {
                        handleFormFieldChange('projectManagerId', value);
                        setValue('projectManagerId', value);
                      }}
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
                              {manager.name} ({manager.role?.toUpperCase()})
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
                      value={addProjectForm.salesManagerId}
                      onValueChange={(value) => {
                        handleFormFieldChange('salesManagerId', value);
                        setValue('salesManagerId', value);
                      }}
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
                              {manager.name} ({manager.role?.toUpperCase()})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.salesManagerId && <p className="text-sm text-red-600">{errors.salesManagerId.message}</p>}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Amenities *</h3>
                
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
                  {addProjectForm.amenities.filter(a => a.trim() !== '').map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {amenity}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeAmenity(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                {addProjectForm.amenities.filter(a => a.trim() !== '').length === 0 && (
                  <p className="text-sm text-red-600">At least one amenity is required</p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amenitiesDescription">Amenities Description (Optional)</Label>
                  <Textarea
                    id="amenitiesDescription"
                    placeholder="Provide additional details about amenities..."
                    rows={3}
                    {...register('amenitiesDescription')}
                    onChange={(e) => handleFormFieldChange('amenitiesDescription', e.target.value)}
                  />
                </div>
              </div>

              {/* Pricing (Optional) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Pricing (Optional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPrice">Minimum Price</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      min="0"
                      step="any"
                      {...register('minPrice', { valueAsNumber: true })}
                      onChange={(e) => handleFormFieldChange('minPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Maximum Price</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      min="0"
                      step="any"
                      {...register('maxPrice', { valueAsNumber: true })}
                      onChange={(e) => handleFormFieldChange('maxPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={addProjectForm.currency}
                      onValueChange={(value) => {
                        handleFormFieldChange('currency', value);
                        setValue('currency', value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* RERA Information (Optional) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">RERA Information (Optional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reraNumber">RERA Number</Label>
                    <Input
                      id="reraNumber"
                      placeholder="e.g., RERA123456789"
                      {...register('reraNumber')}
                      onChange={(e) => handleFormFieldChange('reraNumber', e.target.value)}
                    />
                    {errors.reraNumber && <p className="text-sm text-red-600">{errors.reraNumber.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reraApprovalDate">RERA Approval Date</Label>
                    <Input
                      id="reraApprovalDate"
                      type="date"
                      {...register('reraApprovalDate')}
                      onChange={(e) => handleFormFieldChange('reraApprovalDate', e.target.value)}
                    />
                    {errors.reraApprovalDate && <p className="text-sm text-red-600">{errors.reraApprovalDate.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reraWebsite">RERA Website URL</Label>
                  <Input
                    id="reraWebsite"
                    type="url"
                    placeholder="https://example-rera-website.com"
                    {...register('reraWebsite')}
                    onChange={(e) => handleFormFieldChange('reraWebsite', e.target.value)}
                  />
                  {errors.reraWebsite && <p className="text-sm text-red-600">{errors.reraWebsite.message}</p>}
                  <p className="text-xs text-slate-500">Enter a valid URL starting with http:// or https://</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalDetails">Legal Details</Label>
                  <Textarea
                    id="legalDetails"
                    placeholder="Enter any legal information or compliance details..."
                    rows={3}
                    {...register('legalDetails')}
                    onChange={(e) => handleFormFieldChange('legalDetails', e.target.value)}
                  />
                </div>
              </div>

              {/* Project Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Project Images (Optional)</h3>
                <ImageUpload
                  images={projectImages}
                  onImagesChange={setProjectImages}
                  maxImages={10}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading || addProjectForm.amenities.filter(a => a.trim() !== '').length === 0}>
                  {isLoading ? 'Creating...' : 'Create Project'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    dispatch(resetProjectForm());
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid - simplified for now */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-4">Create your first project to get started</p>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          projects.map((project, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className="mt-1">
                        <Badge 
                          className={
                            project.status === 'PUBLISHED' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }
                        >
                          {project.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {project.description && (
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" />
                  <span>Created recently</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditProject(project)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        project={editingProject}
        isOpen={showEditModal}
        onClose={() => {
          setEditingProject(null);
          setShowEditModal(false);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}