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
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  status: 'UNPUBLISHED' | 'PUBLISHED';
  projectType: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE';
  propertyType: 'APARTMENT' | 'VILLA' | 'PLOT' | 'OFFICE' | 'SHOP' | 'WAREHOUSE';
  totalUnits: number;
  totalArea: number;
  areaUnit: string;
  expectedCompletionDate: string;
  constructionStartDate: string;
  amenities?: string[];
  amenitiesDescription?: string;
  reraNumber?: string;
  reraApprovalDate?: string;
  reraWebsite?: string;
  legalDetails?: string;
  approvals?: {
    name: string;
    authority: string;
    approvalNumber: string;
    approvalDate: string;
  }[];
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  floorPlans?: {
    type: string;
    area: number;
    areaUnit: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
  }[];
  images?: {
    url: string;
    type: string;
    caption: string;
  }[];
  brochures?: {
    url: string;
    name: string;
  }[];
  realEstateDeveloperId: string;
  projectManagerId: string;
  salesManagerId: string;
  projectManager?: Employee;
  salesManager?: Employee;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateDeveloper {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}