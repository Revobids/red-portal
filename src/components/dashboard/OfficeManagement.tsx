'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Building2, MapPin, Phone, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setOfficeFormField, resetOfficeForm, setOffices, setLoading, setError } from '@/redux/slices/adminSlice';
import ApiManager from '@/api/ApiManager';

const officeSchema = z.object({
  name: z.string().min(1, 'Office name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional(),
  isMainOffice: z.boolean().optional(),
});

type OfficeFormData = z.infer<typeof officeSchema>;

export default function OfficeManagement() {
  const [showForm, setShowForm] = useState(false);
  const dispatch = useAppDispatch();
  const { addOfficeForm, offices, isLoading } = useAppSelector((state) => state.admin);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OfficeFormData>({
    resolver: zodResolver(officeSchema),
    values: addOfficeForm,
  });

  const onSubmit = async (data: OfficeFormData) => {
    dispatch(setLoading(true));
    
    try {
      const response = await ApiManager.createOffice(data);
      
      if (response.success && response.data) {
        // Refresh the offices list
        const officesResponse = await ApiManager.getOffices();
        if (officesResponse.success && officesResponse.data) {
          dispatch(setOffices(officesResponse.data));
        }
        
        dispatch(resetOfficeForm());
        reset();
        setShowForm(false);
        dispatch(setError(null));
      } else {
        dispatch(setError(response.message || 'Failed to create office'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFormFieldChange = (field: keyof OfficeFormData, value: string | boolean) => {
    dispatch(setOfficeFormField({ field, value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Office Management</h2>
          <p className="text-slate-600">Manage your office locations and details</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Office
        </Button>
      </div>

      {/* Add Office Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Office</CardTitle>
            <CardDescription>Create a new office location for your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Office Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Office, Branch Office"
                    {...register('name')}
                    onChange={(e) => handleFormFieldChange('name', e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., +1 (555) 123-4567"
                    {...register('phone')}
                    onChange={(e) => handleFormFieldChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  {...register('address')}
                  onChange={(e) => handleFormFieldChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    {...register('city')}
                    onChange={(e) => handleFormFieldChange('city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    {...register('state')}
                    onChange={(e) => handleFormFieldChange('state', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    placeholder="Region"
                    {...register('region')}
                    onChange={(e) => handleFormFieldChange('region', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="isMainOffice"
                  type="checkbox"
                  className="rounded border-slate-300"
                  {...register('isMainOffice')}
                  onChange={(e) => handleFormFieldChange('isMainOffice', e.target.checked)}
                />
                <Label htmlFor="isMainOffice" className="text-sm">
                  This is the main office
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Office'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    dispatch(resetOfficeForm());
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

      {/* Offices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offices.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No offices yet</h3>
            <p className="text-slate-600 mb-4">Create your first office to get started</p>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Office
            </Button>
          </div>
        ) : (
          offices.map((office, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    {office.name}
                  </CardTitle>
                  {office.isMainOffice && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Main Office
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {office.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-slate-600">
                      <p>{office.address}</p>
                      {(office.city || office.state) && (
                        <p>{[office.city, office.state].filter(Boolean).join(', ')}</p>
                      )}
                      {office.region && <p>{office.region}</p>}
                    </div>
                  </div>
                )}
                
                {office.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{office.phone}</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Office
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}