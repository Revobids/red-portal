'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Users, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiManager from '@/api/ApiManager';
import { Project, Employee } from '@/types';
import { useAppSelector } from '@/redux/hooks';
import { toast } from 'sonner';

const editProjectSchema = z.object({
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
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  reraNumber: z.string().optional(),
  reraApprovalDate: z.string().optional(),
  reraWebsite: z.string().optional(),
  legalDetails: z.string().optional(),
  status: z.enum(['UNPUBLISHED', 'PUBLISHED']).optional(),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

interface AssignedEmployee {
  employee: Employee;
  role: string;
  assignedDate?: Date;
}

export default function EditProjectModal({ project, isOpen, onClose, onSuccess }: EditProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [assignedEmployees, setAssignedEmployees] = useState<AssignedEmployee[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  
  const employees = useAppSelector((state) => state.admin.employees);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
  });

  useEffect(() => {
    if (project) {
      // Reset form with project data
      reset({
        name: project.name,
        description: project.description || '',
        address: project.address,
        city: project.city,
        state: project.state,
        pincode: project.pincode,
        latitude: project.latitude,
        longitude: project.longitude,
        projectType: project.projectType,
        propertyType: project.propertyType,
        totalUnits: project.totalUnits,
        totalArea: project.totalArea,
        areaUnit: project.areaUnit,
        expectedCompletionDate: project.expectedCompletionDate,
        constructionStartDate: project.constructionStartDate,
        amenities: project.amenities || [],
        amenitiesDescription: project.amenitiesDescription || '',
        minPrice: project.minPrice || 0,
        maxPrice: project.maxPrice || 0,
        currency: project.currency || 'INR',
        reraNumber: project.reraNumber || '',
        reraApprovalDate: project.reraApprovalDate || '',
        reraWebsite: project.reraWebsite || '',
        legalDetails: project.legalDetails || '',
        status: project.status,
      });
      setAmenities(project.amenities || []);
      
      
      // Load project manager and sales manager as assigned employees
      const projectAssignments: AssignedEmployee[] = [];
      if (project.projectManager) {
        projectAssignments.push({
          employee: project.projectManager,
          role: 'PROJECT_MANAGER'
        });
      }
      if (project.salesManager && project.salesManager.id !== project.projectManager?.id) {
        projectAssignments.push({
          employee: project.salesManager,
          role: 'SALES_MANAGER'
        });
      }
      setAssignedEmployees(projectAssignments);
    } else {
      setAssignedEmployees([]);
    }
  }, [project, reset]);

  const onSubmit = async (data: EditProjectFormData) => {
    if (!project) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updateData = {
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
      };

      const response = await ApiManager.updateProject(project.id, updateData);
      
      // API returns the updated project object directly
      if (response && response.id) {
        toast.success('Project updated successfully');
        
        // Call onSuccess first to trigger data refresh
        await onSuccess(); // Wait for data refresh to complete
        
        // Small delay to ensure UI updates before closing
        setTimeout(() => {
          onClose();
        }, 100);
      } else {
        const errorMessage = 'Failed to update project';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Project update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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


  const handleAssignEmployee = async () => {
    if (!project || !selectedEmployeeId || !selectedRole) return;
    
    setIsLoading(true);
    try {
      const response = await ApiManager.assignEmployeeToProject(project.id, {
        employeeId: selectedEmployeeId,
        role: selectedRole
      });
      
      if (response.success) {
        const employee = employees.find(emp => emp.id === selectedEmployeeId);
        if (employee) {
          setAssignedEmployees(prev => [...prev, {
            employee,
            role: selectedRole,
            assignedDate: new Date()
          }]);
          toast.success(`${employee.name} assigned as ${selectedRole.replace('_', ' ').toLowerCase()}`);
        }
        setSelectedEmployeeId('');
        setSelectedRole('');
        await onSuccess(); // Refresh data
      } else {
        const errorMessage = response.message || 'Failed to assign employee';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Employee assignment error:', error);
      const errorMessage = 'Failed to assign employee';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!project) return;
    
    const employeeToRemove = assignedEmployees.find(emp => emp.employee.id === employeeId);
    
    setIsLoading(true);
    try {
      const response = await ApiManager.removeEmployeeFromProject(project.id, employeeId);
      
      if (response.success) {
        setAssignedEmployees(prev => prev.filter(emp => emp.employee.id !== employeeId));
        if (employeeToRemove) {
          toast.success(`${employeeToRemove.employee.name} removed from project`);
        }
        await onSuccess(); // Refresh data
      } else {
        const errorMessage = response.message || 'Failed to remove employee';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Employee removal error:', error);
      const errorMessage = 'Failed to remove employee';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get available employees (excluding already assigned ones)
  const availableEmployees = employees.filter(
    emp => !assignedEmployees.some(assigned => assigned.employee.id === emp.id)
  );

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Project: {project?.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="team">Team Management</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto max-h-[60vh]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <TabsContent value="details" className="space-y-6 mt-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                      />
                      {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={watch('status')}
                        onValueChange={(value) => setValue('status', value as 'UNPUBLISHED' | 'PUBLISHED')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNPUBLISHED">Unpublished</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      {...register('description')}
                    />
                  </div>
                </div>

                {/* Location Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      {...register('address')}
                    />
                    {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        {...register('city')}
                      />
                      {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        {...register('state')}
                      />
                      {errors.state && <p className="text-sm text-red-600">{errors.state.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
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
                        {...register('longitude', { valueAsNumber: true })}
                      />
                      {errors.longitude && <p className="text-sm text-red-600">{errors.longitude.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectType">Project Type *</Label>
                      <Select
                        value={watch('projectType')}
                        onValueChange={(value) => setValue('projectType', value as 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE')}
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
                        onValueChange={(value) => setValue('propertyType', value as 'APARTMENT' | 'VILLA' | 'PLOT' | 'OFFICE' | 'SHOP' | 'WAREHOUSE')}
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalUnits">Total Units *</Label>
                      <Input
                        id="totalUnits"
                        type="number"
                        min="1"
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
                </div>

                {/* Project Timeline */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Project Timeline</h3>
                  
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

                  {/* Amenities */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Amenities</h3>
            
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

                    <div className="space-y-2">
                      <Label htmlFor="amenitiesDescription">Amenities Description</Label>
                      <Textarea
                        id="amenitiesDescription"
                        placeholder="Provide additional details about amenities..."
                        rows={3}
                        {...register('amenitiesDescription')}
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pricing</h3>
            
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minPrice">Minimum Price</Label>
                        <Input
                          id="minPrice"
                          type="number"
                          min="0"
                          step="any"
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
                            <SelectItem value="INR">INR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* RERA Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">RERA Information</h3>
            
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reraNumber">RERA Number</Label>
                        <Input
                          id="reraNumber"
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
                        {...register('reraWebsite')}
                      />
                      {errors.reraWebsite && <p className="text-sm text-red-600">{errors.reraWebsite.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="legalDetails">Legal Details</Label>
                      <Textarea
                        id="legalDetails"
                        rows={3}
                        {...register('legalDetails')}
                      />
                    </div>
                  </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-6 mt-6">
                {/* Team Management */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Management
                  </h3>
                  
                  {/* Assign New Employee */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Assign Employee</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Employee</Label>
                          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableEmployees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.name} ({employee.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                              <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                              <SelectItem value="SALES_EXECUTIVE">Sales Executive</SelectItem>
                              <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>&nbsp;</Label>
                          <Button
                            type="button"
                            onClick={handleAssignEmployee}
                            disabled={!selectedEmployeeId || !selectedRole || isLoading}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Assign
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Assigned Employees */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Assigned Team Members</h4>
                    {assignedEmployees.length === 0 ? (
                      <Card>
                        <CardContent className="p-6 text-center text-gray-500">
                          No team members assigned yet
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-2">
                        {assignedEmployees.map((assigned) => (
                          <Card key={assigned.employee.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{assigned.employee.name}</p>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        {assigned.role.replace('_', ' ')}
                                      </Badge>
                                      <span className="text-sm text-gray-500">
                                        {assigned.employee.email}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveEmployee(assigned.employee.id)}
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>


              <div className="flex gap-3 pt-6 border-t">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Project'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}