'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Users, Mail, User, Building2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setEmployeeFormField, resetEmployeeForm, setEmployees, setLoading, setError } from '@/redux/slices/adminSlice';
import ApiManager from '@/api/ApiManager';

const employeeSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SALES', 'FINANCE']),
  officeId: z.string().min(1, 'Office is required'),
  employeeId: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeeManagement() {
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { addEmployeeForm, employees, offices, isLoading } = useAppSelector((state) => state.admin);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    values: addEmployeeForm,
  });

  const onSubmit = async (data: EmployeeFormData) => {
    dispatch(setLoading(true));
    
    try {
      // Convert role to lowercase for API (SALES_MANAGER -> sales_manager)
      const apiData = {
        ...data,
        role: data.role.toLowerCase()
      };
      
      const response = await ApiManager.createEmployee(apiData);
      
      if (response.success && response.data) {
        // Refresh the employees list
        const employeesResponse = await ApiManager.getEmployees();
        if (employeesResponse.success && employeesResponse.data) {
          dispatch(setEmployees(employeesResponse.data));
        }
        
        dispatch(resetEmployeeForm());
        reset();
        setShowForm(false);
        dispatch(setError(null));
      } else {
        dispatch(setError(response.message || 'Failed to create employee'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFormFieldChange = (field: keyof EmployeeFormData, value: string) => {
    dispatch(setEmployeeFormField({ field, value }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-700';
      case 'SALES_MANAGER':
        return 'bg-green-100 text-green-700';
      case 'SALES_EXECUTIVE':
        return 'bg-emerald-100 text-emerald-700';
      case 'SALES':
        return 'bg-teal-100 text-teal-700';
      case 'FINANCE':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Employee Management</h2>
          <p className="text-slate-600">Manage your team members and their roles</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Add Employee Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Employee</CardTitle>
            <CardDescription>Create a new team member account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., John Smith"
                    {...register('name')}
                    onChange={(e) => handleFormFieldChange('name', e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    {...register('email')}
                    onChange={(e) => handleFormFieldChange('email', e.target.value)}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="e.g., johnsmith"
                    {...register('username')}
                    onChange={(e) => handleFormFieldChange('username', e.target.value)}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      {...register('password')}
                      onChange={(e) => handleFormFieldChange('password', e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={addEmployeeForm.role}
                    onValueChange={(value) => {
                      handleFormFieldChange('role', value);
                      setValue('role', value as 'ADMIN' | 'MANAGER' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'SALES' | 'FINANCE');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                      <SelectItem value="SALES_EXECUTIVE">Sales Executive</SelectItem>
                      <SelectItem value="SALES">Sales</SelectItem>
                      <SelectItem value="FINANCE">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officeId">Office *</Label>
                  <Select
                    value={addEmployeeForm.officeId}
                    onValueChange={(value) => {
                      handleFormFieldChange('officeId', value);
                      setValue('officeId', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select office" />
                    </SelectTrigger>
                    <SelectContent>
                      {offices.map((office, index) => (
                        <SelectItem key={index} value={office.id}>
                          {office.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.officeId && (
                    <p className="text-sm text-red-600">{errors.officeId.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID (Optional)</Label>
                <Input
                  id="employeeId"
                  placeholder="e.g., EMP001"
                  {...register('employeeId')}
                  onChange={(e) => handleFormFieldChange('employeeId', e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Employee'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    dispatch(resetEmployeeForm());
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

      {/* Employees List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No employees yet</h3>
            <p className="text-slate-600 mb-4">Add team members to get started</p>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Employee
            </Button>
          </div>
        ) : (
          employees.map((employee, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleBadgeColor(employee.role)}>
                        {employee.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{employee.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">@{employee.username}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {employee.office?.name || offices.find(o => o.id === employee.officeId)?.name || 'Unknown Office'}
                    </span>
                    {employee.office?.isMainOffice && (
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600">
                        Main Office
                      </Badge>
                    )}
                  </div>
                  {employee.office?.address && (
                    <div className="flex items-start gap-2 ml-6">
                      <span className="text-xs text-slate-500">{employee.office.address}</span>
                    </div>
                  )}
                </div>

                {employee.employeeId && (
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">ID:</span> {employee.employeeId}
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Edit Employee
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