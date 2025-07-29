export type EmployeeRole = 'ADMIN' | 'MANAGER' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'SALES' | 'FINANCE';

export type AdminTabs = 'dashboard' | 'offices' | 'employees' | 'projects';

export interface Employee {
  id: string;
  username: string;
  name: string;
  email: string;
  role: EmployeeRole;
  realEstateDeveloperId: string;
  officeId: string;
  employeeId?: string;
  office?: Office; // Nested office data from API
}

// Legacy alias for backward compatibility - remove after migration
export type UserRole = EmployeeRole;
export type User = Employee;

export interface Office {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  region?: string;
  phone?: string;
  isMainOffice?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'UNPUBLISHED' | 'PUBLISHED';
  location?: any;
  propertyDetails?: any;
  approvals?: any;
  floorPlans?: any;
  images?: any;
  brochures?: any;
}

export interface RealEstateDeveloper {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}