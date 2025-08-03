const ENDPOINTS = {
    // Authentication
    LOGIN: () => 'auth/login',
    REGISTER: () => 'auth/register',
    
    // Real Estate Developers
    CREATE_DEVELOPER: () => 'real-estate-developers',
    GET_DEVELOPERS: () => 'real-estate-developers',
    GET_DEVELOPER: (id: string) => `real-estate-developers/${id}`,
    UPDATE_DEVELOPER: (id: string) => `real-estate-developers/${id}`,
    DELETE_DEVELOPER: (id: string) => `real-estate-developers/${id}`,
    
    // Office Management
    CREATE_OFFICE: () => 'offices',
    GET_OFFICES: () => 'offices',
    GET_OFFICE: (id: string) => `offices/${id}`,
    UPDATE_OFFICE: (id: string) => `offices/${id}`,
    DELETE_OFFICE: (id: string) => `offices/${id}`,
    
    // Employee Management
    CREATE_EMPLOYEE: () => 'employees',
    GET_EMPLOYEES: () => 'employees',
    GET_EMPLOYEE: (id: string) => `employees/${id}`,
    UPDATE_EMPLOYEE: (id: string) => `employees/${id}`,
    DELETE_EMPLOYEE: (id: string) => `employees/${id}`,
    CHANGE_PASSWORD: () => 'employees/change-password',
    
    // Project Management
    CREATE_PROJECT: () => 'projects',
    GET_PROJECTS: () => 'projects',
    GET_PUBLISHED_PROJECTS: () => 'projects/published',
    GET_PROJECT: (id: string) => `projects/${id}`,
    UPDATE_PROJECT: (id: string) => `projects/${id}`,
    PUBLISH_PROJECT: (id: string) => `projects/${id}/publish`,
    ASSIGN_EMPLOYEE_TO_PROJECT: (id: string) => `projects/${id}/employees`,
    REMOVE_EMPLOYEE_FROM_PROJECT: (id: string, employeeId: string) => `projects/${id}/employees/${employeeId}`,
    UPLOAD_PROJECT_IMAGES: (id: string) => `projects/${id}/upload-images`,
    DELETE_PROJECT_IMAGE: (id: string) => `projects/${id}/images`,
    DELETE_PROJECT: (id: string) => `projects/${id}`,
    
    // Health Check
    HEALTH_CHECK: () => '',
    
    // User Profile
    GET_USER_PROFILE: () => 'auth/profile',
};

export default ENDPOINTS;