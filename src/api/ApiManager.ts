import ApiMethods from "./ApiMethods";
import ENDPOINTS from "./endpoints";

const PROD_BASE_URL = 'http://localhost:3000/api/';
const DEV_BASE_URL = 'http://localhost:3000/';

export const BASE_URL = DEV_BASE_URL;

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
    location?: any;
    propertyDetails?: any;
    approvals?: any;
    floorPlans?: any;
    images?: any;
    brochures?: any;
}

interface AssignEmployeeBody {
    employeeId: string;
    role: string;
    assignedDate?: Date;
}

interface PublishProjectBody {
    status: string;
}

class ApiManager {

    // Authentication
    static login = (loginData: LoginBody) => {
        const url = BASE_URL + ENDPOINTS.LOGIN();
        return ApiMethods.post(url, loginData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static register = (registerData: RegisterBody) => {
        const url = BASE_URL + ENDPOINTS.REGISTER();
        return ApiMethods.post(url, registerData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    // Real Estate Developers
    static createDeveloper = (developerData: CreateDeveloperBody) => {
        const url = BASE_URL + ENDPOINTS.CREATE_DEVELOPER();
        return ApiMethods.post(url, developerData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static getDevelopers = () => {
        const url = BASE_URL + ENDPOINTS.GET_DEVELOPERS();
        return ApiMethods.get(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static getDeveloper = (id: string) => {
        const url = BASE_URL + ENDPOINTS.GET_DEVELOPER(id);
        return ApiMethods.get(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static updateDeveloper = (id: string, updateData: Partial<CreateDeveloperBody>) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_DEVELOPER(id);
        return ApiMethods.patch(url, updateData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static deleteDeveloper = (id: string) => {
        const url = BASE_URL + ENDPOINTS.DELETE_DEVELOPER(id);
        return ApiMethods.delete(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    // Office Management
    static createOffice = (officeData: CreateOfficeBody) => {
        const url = BASE_URL + ENDPOINTS.CREATE_OFFICE();
        return ApiMethods.post(url, officeData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static getOffices = () => {
        const url = BASE_URL + ENDPOINTS.GET_OFFICES();
        return ApiMethods.get(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static getOffice = (id: string) => {
        const url = BASE_URL + ENDPOINTS.GET_OFFICE(id);
        return ApiMethods.get(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static updateOffice = (id: string, updateData: Partial<CreateOfficeBody>) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_OFFICE(id);
        return ApiMethods.patch(url, updateData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static deleteOffice = (id: string) => {
        const url = BASE_URL + ENDPOINTS.DELETE_OFFICE(id);
        return ApiMethods.delete(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    // Employee Management
    static createEmployee = (employeeData: CreateEmployeeBody) => {
        const url = BASE_URL + ENDPOINTS.CREATE_EMPLOYEE();
        return ApiMethods.post(url, employeeData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static getEmployees = () => {
        const url = BASE_URL + ENDPOINTS.GET_EMPLOYEES();
        return ApiMethods.get(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static getEmployee = (id: string) => {
        const url = BASE_URL + ENDPOINTS.GET_EMPLOYEE(id);
        return ApiMethods.get(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static updateEmployee = (id: string, updateData: Partial<CreateEmployeeBody>) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_EMPLOYEE(id);
        return ApiMethods.patch(url, updateData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static deleteEmployee = (id: string) => {
        const url = BASE_URL + ENDPOINTS.DELETE_EMPLOYEE(id);
        return ApiMethods.delete(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static changePassword = (passwordData: ChangePasswordBody) => {
        const url = BASE_URL + ENDPOINTS.CHANGE_PASSWORD();
        return ApiMethods.post(url, passwordData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    // Project Management
    static createProject = (projectData: CreateProjectBody) => {
        const url = BASE_URL + ENDPOINTS.CREATE_PROJECT();
        return ApiMethods.post(url, projectData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static getProjects = () => {
        const url = BASE_URL + ENDPOINTS.GET_PROJECTS();
        return ApiMethods.get(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static getPublishedProjects = () => {
        const url = BASE_URL + ENDPOINTS.GET_PUBLISHED_PROJECTS();
        return ApiMethods.get(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static getProject = (id: string) => {
        const url = BASE_URL + ENDPOINTS.GET_PROJECT(id);
        return ApiMethods.get(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static updateProject = (id: string, updateData: Partial<CreateProjectBody>) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_PROJECT(id);
        return ApiMethods.patch(url, updateData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static publishProject = (id: string, publishData: PublishProjectBody) => {
        const url = BASE_URL + ENDPOINTS.PUBLISH_PROJECT(id);
        return ApiMethods.patch(url, publishData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static assignEmployeeToProject = (id: string, employeeData: AssignEmployeeBody) => {
        const url = BASE_URL + ENDPOINTS.ASSIGN_EMPLOYEE_TO_PROJECT(id);
        return ApiMethods.post(url, employeeData).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static removeEmployeeFromProject = (id: string, employeeId: string) => {
        const url = BASE_URL + ENDPOINTS.REMOVE_EMPLOYEE_FROM_PROJECT(id, employeeId);
        return ApiMethods.delete(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    static deleteProject = (id: string) => {
        const url = BASE_URL + ENDPOINTS.DELETE_PROJECT(id);
        return ApiMethods.delete(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    // Health Check
    static healthCheck = () => {
        const url = BASE_URL + ENDPOINTS.HEALTH_CHECK();
        return ApiMethods.get(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

    // User Profile
    static getUserInfo = () => {
        const url = BASE_URL + ENDPOINTS.GET_USER_PROFILE();
        return ApiMethods.get(url).then((res: any) => {
            console.log(res);
            return res;
        });
    };

}

export default ApiManager;