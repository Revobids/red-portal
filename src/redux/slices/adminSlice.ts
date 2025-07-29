import { reduxAdminSliceInitialStates } from '@/data/redux-state';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdminTabs, Office, Employee, Project, EmployeeRole } from '@/types';

interface IAddOfficeForm {
  name: string;
  address: string;
  city: string;
  state: string;
  region: string;
  phone: string;
  isMainOffice: boolean;
}

interface IAddEmployeeForm {
  username: string;
  password: string;
  name: string;
  email: string;
  role: EmployeeRole;
  officeId: string;
  employeeId: string;
}

interface IAddProjectForm {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  projectType: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE';
  propertyType: 'APARTMENT' | 'VILLA' | 'PLOT' | 'OFFICE' | 'SHOP' | 'WAREHOUSE';
  totalUnits: number;
  totalArea: number;
  areaUnit: string;
  expectedCompletionDate: string;
  constructionStartDate: string;
  amenities: string[];
  projectManagerId: string;
  salesManagerId: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  reraNumber: string;
  reraApprovalDate: string;
  reraWebsite: string;
  legalDetails: string;
  approvals: any[];
  floorPlans: any[];
  images: any[];
  brochures: any[];
}

interface IAdminState {
  addOfficeForm: IAddOfficeForm;
  addEmployeeForm: IAddEmployeeForm;
  addProjectForm: IAddProjectForm;
  offices: Office[];
  employees: Employee[];
  projects: Project[];
  selectedTab: AdminTabs;
  isLoading: boolean;
  error: string | null;
}

const initialState: IAdminState = {
  addOfficeForm: reduxAdminSliceInitialStates.ADD_OFFICE_FORM_INITIAL_STATE,
  addEmployeeForm: reduxAdminSliceInitialStates.ADD_EMPLOYEE_FORM_INITIAL_STATE,
  addProjectForm: reduxAdminSliceInitialStates.ADD_PROJECT_FORM_INITIAL_STATE,
  offices: reduxAdminSliceInitialStates.OFFICES_INITIAL_STATE,
  employees: reduxAdminSliceInitialStates.EMPLOYEES_INITIAL_STATE,
  projects: reduxAdminSliceInitialStates.PROJECTS_INITIAL_STATE,
  selectedTab: 'dashboard',
  isLoading: false,
  error: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSelectedTab: (state, action: PayloadAction<AdminTabs>) => {
      state.selectedTab = action.payload;
    },
    
    // Office Form Actions
    setOfficeFormField: (state, action: PayloadAction<{ field: keyof IAddOfficeForm; value: any }>) => {
      const { field, value } = action.payload;
      state.addOfficeForm[field] = value;
    },
    resetOfficeForm: (state) => {
      state.addOfficeForm = { ...reduxAdminSliceInitialStates.ADD_OFFICE_FORM_INITIAL_STATE };
    },
    
    // Employee Form Actions
    setEmployeeFormField: (state, action: PayloadAction<{ field: keyof IAddEmployeeForm; value: any }>) => {
      const { field, value } = action.payload;
      state.addEmployeeForm[field] = value;
    },
    resetEmployeeForm: (state) => {
      state.addEmployeeForm = { ...reduxAdminSliceInitialStates.ADD_EMPLOYEE_FORM_INITIAL_STATE };
    },
    
    // Project Form Actions
    setProjectFormField: (state, action: PayloadAction<{ field: keyof IAddProjectForm; value: any }>) => {
      const { field, value } = action.payload;
      state.addProjectForm[field] = value;
    },
    resetProjectForm: (state) => {
      state.addProjectForm = { ...reduxAdminSliceInitialStates.ADD_PROJECT_FORM_INITIAL_STATE };
    },
    
    // Data Actions
    setOffices: (state, action: PayloadAction<Office[]>) => {
      state.offices = action.payload;
    },
    addOffice: (state, action: PayloadAction<Office>) => {
      state.offices.push(action.payload);
    },
    
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push(action.payload);
    },
    
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
    
    // Loading and Error Actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  setSelectedTab,
  setOfficeFormField,
  resetOfficeForm,
  setEmployeeFormField,
  resetEmployeeForm,
  setProjectFormField,
  resetProjectForm,
  setOffices,
  addOffice,
  setEmployees,
  addEmployee,
  setProjects,
  addProject,
  setLoading,
  setError
} = adminSlice.actions;

export default adminSlice;