import ApiMethods from "./ApiMethods";
import ENDPOINTS from "./endpoints";
import { Employee, Office, Project, RealEstateDeveloper } from "../types";

// Use environment variable for API URL, fallback to default if not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://revobricks-backend-core.onrender.com/api';
// Ensure BASE_URL always ends with a slash
export const BASE_URL = API_URL.endsWith('/') ? API_URL : API_URL + '/';

// API Response Types
interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

interface LoginResponse {
    user: Employee;
    token: string;
}


interface LoginBody {
    username: string;
    password: string;
}

interface RegisterBody {
    username: string;
    password: string;
    name: string;
    email: string;
    role: string;
    realEstateDeveloperId: string;
    officeId: string;
    employeeId?: string;
}

interface CreateDeveloperBody {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    ownerUsername: string;
    ownerPassword: string;
    ownerEmail: string;
    ownerName: string;
}

interface CreateOfficeBody {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    region?: string;
    phone?: string;
    isMainOffice?: boolean;
}

interface CreateEmployeeBody {
    username: string;
    password: string;
    name: string;
    email: string;
    role: string; // Will be sent as lowercase: admin, manager, sales_manager, etc.
    officeId: string;
    employeeId?: string;
}

interface ChangePasswordBody {
    oldPassword: string;
    newPassword: string;
}

interface CreateProjectBody {
    name: string;
    description?: string;
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
    projectManagerId: string;
    salesManagerId: string;
}

interface AssignEmployeeBody {
    employeeId: string;
    role: string;
    assignedDate?: Date;
}

interface UpdateProjectBody {
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    projectType?: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE';
    propertyType?: 'APARTMENT' | 'VILLA' | 'PLOT' | 'OFFICE' | 'SHOP' | 'WAREHOUSE';
    totalUnits?: number;
    totalArea?: number;
    areaUnit?: string;
    expectedCompletionDate?: string;
    constructionStartDate?: string;
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
    status?: 'UNPUBLISHED' | 'PUBLISHED';
}

interface PublishProjectBody {
    status: string;
}

interface UploadImageBody {
    type?: 'EXTERIOR' | 'INTERIOR' | 'FLOOR_PLAN' | 'AMENITY' | 'LOCATION' | 'CONSTRUCTION' | 'OTHER';
    caption?: string;
}

interface DeleteImageBody {
    imageUrl: string;
}

class ApiManager {

    // Authentication
    static login = (loginData: LoginBody): Promise<ApiResponse<LoginResponse>> => {
        const url = BASE_URL + ENDPOINTS.LOGIN();
        return ApiMethods.post<ApiResponse<LoginResponse>>(url, loginData as unknown as Record<string, unknown>);
    };

    static register = (registerData: RegisterBody): Promise<ApiResponse<Employee>> => {
        const url = BASE_URL + ENDPOINTS.REGISTER();
        return ApiMethods.post<ApiResponse<Employee>>(url, registerData as unknown as Record<string, unknown>);
    };

    // Real Estate Developers
    static createDeveloper = (developerData: CreateDeveloperBody): Promise<ApiResponse<RealEstateDeveloper>> => {
        const url = BASE_URL + ENDPOINTS.CREATE_DEVELOPER();
        return ApiMethods.post<ApiResponse<RealEstateDeveloper>>(url, developerData as unknown as Record<string, unknown>);
    };

    static getDevelopers = (): Promise<ApiResponse<RealEstateDeveloper[]>> => {
        const url = BASE_URL + ENDPOINTS.GET_DEVELOPERS();
        return ApiMethods.get<ApiResponse<RealEstateDeveloper[]>>(url);
    };

    static getDeveloper = (id: string): Promise<ApiResponse<RealEstateDeveloper>> => {
        const url = BASE_URL + ENDPOINTS.GET_DEVELOPER(id);
        return ApiMethods.get<ApiResponse<RealEstateDeveloper>>(url);
    };

    static updateDeveloper = (id: string, updateData: Partial<CreateDeveloperBody>): Promise<ApiResponse<RealEstateDeveloper>> => {
        const url = BASE_URL + ENDPOINTS.UPDATE_DEVELOPER(id);
        return ApiMethods.patch<ApiResponse<RealEstateDeveloper>>(url, updateData as unknown as Record<string, unknown>);
    };

    static deleteDeveloper = (id: string): Promise<ApiResponse<void>> => {
        const url = BASE_URL + ENDPOINTS.DELETE_DEVELOPER(id);
        return ApiMethods.delete<ApiResponse<void>>(url);
    };

    // Office Management
    static createOffice = (officeData: CreateOfficeBody): Promise<ApiResponse<Office>> => {
        const url = BASE_URL + ENDPOINTS.CREATE_OFFICE();
        return ApiMethods.post<ApiResponse<Office>>(url, officeData as unknown as Record<string, unknown>);
    };

    static getOffices = (): Promise<ApiResponse<Office[]>> => {
        const url = BASE_URL + ENDPOINTS.GET_OFFICES();
        return ApiMethods.get<ApiResponse<Office[]>>(url);
    };

    static getOffice = (id: string): Promise<ApiResponse<Office>> => {
        const url = BASE_URL + ENDPOINTS.GET_OFFICE(id);
        return ApiMethods.get<ApiResponse<Office>>(url);
    };

    static updateOffice = (id: string, updateData: Partial<CreateOfficeBody>): Promise<ApiResponse<Office>> => {
        const url = BASE_URL + ENDPOINTS.UPDATE_OFFICE(id);
        return ApiMethods.patch<ApiResponse<Office>>(url, updateData as unknown as Record<string, unknown>);
    };

    static deleteOffice = (id: string): Promise<ApiResponse<void>> => {
        const url = BASE_URL + ENDPOINTS.DELETE_OFFICE(id);
        return ApiMethods.delete<ApiResponse<void>>(url);
    };

    // Employee Management
    static createEmployee = (employeeData: CreateEmployeeBody): Promise<ApiResponse<Employee>> => {
        const url = BASE_URL + ENDPOINTS.CREATE_EMPLOYEE();
        return ApiMethods.post<ApiResponse<Employee>>(url, employeeData as unknown as Record<string, unknown>);
    };

    static getEmployees = (): Promise<ApiResponse<Employee[]>> => {
        const url = BASE_URL + ENDPOINTS.GET_EMPLOYEES();
        return ApiMethods.get<ApiResponse<Employee[]>>(url);
    };

    static getEmployee = (id: string): Promise<ApiResponse<Employee>> => {
        const url = BASE_URL + ENDPOINTS.GET_EMPLOYEE(id);
        return ApiMethods.get<ApiResponse<Employee>>(url);
    };

    static updateEmployee = (id: string, updateData: Partial<CreateEmployeeBody>): Promise<ApiResponse<Employee>> => {
        const url = BASE_URL + ENDPOINTS.UPDATE_EMPLOYEE(id);
        return ApiMethods.patch<ApiResponse<Employee>>(url, updateData as unknown as Record<string, unknown>);
    };

    static deleteEmployee = (id: string): Promise<ApiResponse<void>> => {
        const url = BASE_URL + ENDPOINTS.DELETE_EMPLOYEE(id);
        return ApiMethods.delete<ApiResponse<void>>(url);
    };

    static changePassword = (passwordData: ChangePasswordBody): Promise<ApiResponse<{ message: string }>> => {
        const url = BASE_URL + ENDPOINTS.CHANGE_PASSWORD();
        return ApiMethods.post<ApiResponse<{ message: string }>>(url, passwordData as unknown as Record<string, unknown>);
    };

    // Project Management
    static createProject = (projectData: CreateProjectBody): Promise<ApiResponse<Project>> => {
        const url = BASE_URL + ENDPOINTS.CREATE_PROJECT();
        return ApiMethods.post<ApiResponse<Project>>(url, projectData as unknown as Record<string, unknown>);
    };

    static getProjects = (): Promise<ApiResponse<Project[]>> => {
        const url = BASE_URL + ENDPOINTS.GET_PROJECTS();
        return ApiMethods.get<ApiResponse<Project[]>>(url);
    };

    static getPublishedProjects = (): Promise<ApiResponse<Project[]>> => {
        const url = BASE_URL + ENDPOINTS.GET_PUBLISHED_PROJECTS();
        return ApiMethods.get<ApiResponse<Project[]>>(url);
    };

    static getProject = (id: string): Promise<ApiResponse<Project>> => {
        const url = BASE_URL + ENDPOINTS.GET_PROJECT(id);
        return ApiMethods.get<ApiResponse<Project>>(url);
    };

    static updateProject = (id: string, updateData: UpdateProjectBody): Promise<any> => {
        const url = BASE_URL + ENDPOINTS.UPDATE_PROJECT(id);
        return ApiMethods.patch<any>(url, updateData as unknown as Record<string, unknown>);
    };

    static publishProject = (id: string, publishData: PublishProjectBody): Promise<ApiResponse<Project>> => {
        const url = BASE_URL + ENDPOINTS.PUBLISH_PROJECT(id);
        return ApiMethods.patch<ApiResponse<Project>>(url, publishData as unknown as Record<string, unknown>);
    };

    static assignEmployeeToProject = (id: string, employeeData: AssignEmployeeBody): Promise<ApiResponse<Project>> => {
        const url = BASE_URL + ENDPOINTS.ASSIGN_EMPLOYEE_TO_PROJECT(id);
        return ApiMethods.post<ApiResponse<Project>>(url, employeeData as unknown as Record<string, unknown>);
    };

    static removeEmployeeFromProject = (id: string, employeeId: string): Promise<ApiResponse<Project>> => {
        const url = BASE_URL + ENDPOINTS.REMOVE_EMPLOYEE_FROM_PROJECT(id, employeeId);
        return ApiMethods.delete<ApiResponse<Project>>(url);
    };

    static uploadProjectImages = (id: string, files: File[], metadata?: UploadImageBody): Promise<any[]> => {
        const url = BASE_URL + ENDPOINTS.UPLOAD_PROJECT_IMAGES(id);
        const formData = new FormData();
        
        // Add files to form data with exact field name expected by backend
        files.forEach((file) => {
            formData.append('images', file);
        });
        
        // Add metadata fields if provided (applies to all images)
        if (metadata) {
            if (metadata.type) {
                formData.append('type', metadata.type);
            }
            if (metadata.caption) {
                formData.append('caption', metadata.caption);
            }
        }
        
        console.log('Uploading', files.length, 'files to:', url);
        console.log('FormData contents:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ':', pair[1]);
        }
        
        return ApiMethods.postFormData<any[]>(url, formData);
    };

    static deleteProjectImage = (id: string, deleteData: DeleteImageBody): Promise<any> => {
        const url = BASE_URL + ENDPOINTS.DELETE_PROJECT_IMAGE(id);
        return ApiMethods.delete<any>(url, deleteData as unknown as Record<string, unknown>);
    };

    static deleteProject = (id: string): Promise<ApiResponse<void>> => {
        const url = BASE_URL + ENDPOINTS.DELETE_PROJECT(id);
        return ApiMethods.delete<ApiResponse<void>>(url);
    };

    // Health Check
    static healthCheck = (): Promise<ApiResponse<{ status: string; timestamp: string }>> => {
        const url = BASE_URL + ENDPOINTS.HEALTH_CHECK();
        return ApiMethods.get<ApiResponse<{ status: string; timestamp: string }>>(url);
    };

    // User Profile
    static getUserInfo = (): Promise<ApiResponse<Employee>> => {
        const url = BASE_URL + ENDPOINTS.GET_USER_PROFILE();
        return ApiMethods.get<ApiResponse<Employee>>(url);
    };

}

export default ApiManager;