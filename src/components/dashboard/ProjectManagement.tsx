'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  Eye, 
  Edit, 
  X, 
  MoreHorizontal,
  Trash2,
  Users,
  Building2,
  MapPin,
  Badge as BadgeIcon,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Image as ImageIcon
} from 'lucide-react';
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
import CreateProjectWizard from './CreateProjectWizard';
import ProjectImageModal from './ProjectImageModal';
import { Project } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PUBLISHED' | 'UNPUBLISHED'>('all');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageProject, setImageProject] = useState<Project | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const dispatch = useAppDispatch();
  const { addProjectForm, projects, employees, isLoading } = useAppSelector((state) => state.admin);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    dispatch(setLoading(true));
    try {
      const response = await ApiManager.getProjects();
      if (response.success && response.data) {
        dispatch(setProjects(response.data));
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

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
      
      // API returns the created project object directly
      if (response && response.id) {
        const projectId = response.id;
        
        // Refresh the projects list
        const projectsResponse = await ApiManager.getProjects();
        if (projectsResponse.success && projectsResponse.data) {
          dispatch(setProjects(projectsResponse.data));
        }
        
        dispatch(resetProjectForm());
        reset();
        setShowForm(false);
        dispatch(setError(null));
        toast.success('Project created successfully');
      } else {
        const errorMessage = 'Failed to create project';
        dispatch(setError(errorMessage));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Project creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
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
    const role = emp.role?.toLowerCase();
    return role === 'admin' || role === 'manager' || role === 'sales_manager';
  });

  // If no managers found, show all employees as fallback for testing
  const availableManagers = managerOptions.length > 0 ? managerOptions : employees;

  console.log('All employees:', employees.map(emp => ({ name: emp.name, role: emp.role })));
  console.log('Filtered manager options:', managerOptions.map(emp => ({ name: emp.name, role: emp.role })));
  console.log('Available managers for dropdown:', availableManagers.map(emp => ({ name: emp.name, role: emp.role })));

  const handleEditProject = (project: Project) => {
    // Find the latest version of the project from the store
    const latestProject = projects.find(p => p.id === project.id) || project;
    setEditingProject(latestProject);
    setShowEditModal(true);
  };

  const handleManageImages = (project: Project) => {
    // Find the latest version of the project from the store
    const latestProject = projects.find(p => p.id === project.id) || project;
    setImageProject(latestProject);
    setShowImageModal(true);
  };

  const handleEditSuccess = async () => {
    await loadProjects();
    setEditingProject(null);
    setShowEditModal(false);
  };

  const handleCreateSuccess = async () => {
    await loadProjects();
    setShowWizard(false);
  };

  const handleImageSuccess = async () => {
    await loadProjects();
    setImageProject(null);
    setShowImageModal(false);
  };

  const handlePublishToggle = async (project: Project) => {
    dispatch(setLoading(true));
    try {
      const newStatus = project.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
      const response = await ApiManager.publishProject(project.id, { status: newStatus });
      
      if (response.success) {
        await loadProjects();
        const action = newStatus === 'PUBLISHED' ? 'published' : 'unpublished';
        toast.success(`Project ${action} successfully`);
      } else {
        const errorMessage = response.message || 'Failed to update project status';
        dispatch(setError(errorMessage));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Publish toggle error:', error);
      const errorMessage = 'Failed to update project status';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    setDeletingProject(true);
    try {
      const response = await ApiManager.deleteProject(projectToDelete.id);
      
      // For DELETE requests, a successful response might be empty or have a message
      // If we get here without throwing, it was successful
      await loadProjects();
      toast.success(`Project "${projectToDelete.name}" deleted successfully`);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Delete project error:', error);
      const errorMessage = 'Failed to delete project';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      setDeletingProject(false);
    }
  };

  const handleViewProject = (project: Project) => {
    // TODO: Navigate to project details page
    console.log('View project:', project);
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.state?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Project Management</h2>
          <p className="text-slate-600">Manage your real estate projects and listings</p>
        </div>
        <Button 
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects by name, city, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="UNPUBLISHED">Unpublished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {projects.filter(p => p.status === 'PUBLISHED').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-orange-600">
                  {projects.filter(p => p.status === 'UNPUBLISHED').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                              {manager.name} ({manager.role?.toUpperCase() || manager.role})
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
                              {manager.name} ({manager.role?.toUpperCase() || manager.role})
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

              {/* Images are now managed through the wizard and separate modal */}

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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-4">Create your first project to get started</p>
            <Button onClick={() => setShowWizard(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-all duration-200 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProject(project)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProject(project)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePublishToggle(project)}>
                            <BadgeIcon className="h-4 w-4 mr-2" />
                            {project.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManageImages(project)}>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Manage Images
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setProjectToDelete(project)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant={project.status === 'PUBLISHED' ? 'default' : 'secondary'}
                        className={cn(
                          project.status === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-100'
                        )}
                      >
                        {project.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {project.projectType.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {project.propertyType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Project Image */}
                {project.images && project.images.length > 0 && (
                  <div className="relative h-48 -mx-6 -mt-2 mb-4">
                    <img
                      src={project.images[0].url}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{project.city}, {project.state}</span>
                </div>

                {/* Project Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Units</p>
                    <p className="font-semibold">{project.totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Area</p>
                    <p className="font-semibold">{project.totalArea} {project.areaUnit}</p>
                  </div>
                </div>

                {/* Completion Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Expected by {new Date(project.expectedCompletionDate).toLocaleDateString()}</span>
                </div>

                {/* Price Range */}
                {project.minPrice && project.maxPrice && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">Price Range</p>
                    <p className="font-semibold">
                      {project.currency} {project.minPrice.toLocaleString()} - {project.maxPrice.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewProject(project)}
                  >
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

      {/* Create Project Wizard */}
      {showWizard && (
        <CreateProjectWizard
          onClose={() => setShowWizard(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Project Modal */}
      <EditProjectModal
        key={editingProject?.id || 'edit-modal'}
        project={editingProject}
        isOpen={showEditModal}
        onClose={() => {
          setEditingProject(null);
          setShowEditModal(false);
        }}
        onSuccess={handleEditSuccess}
      />

      {/* Project Image Management Modal */}
      <ProjectImageModal
        project={imageProject}
        isOpen={showImageModal}
        onClose={() => {
          setImageProject(null);
          setShowImageModal(false);
        }}
        onSuccess={handleImageSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProjectToDelete(null)}
              disabled={deletingProject}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={deletingProject}
            >
              {deletingProject ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}