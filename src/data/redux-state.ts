export const reduxAuthSliceInitialStates = {
  USER_INITIAL_STATE: {
    id: '',
    username: '',
    name: '',
    email: '',
    role: 'SALES_EXECUTIVE' as const,
    realEstateDeveloperId: '',
    officeId: '',
    employeeId: ''
  },
  // Legacy alias - can be removed after full migration
  EMPLOYEE_INITIAL_STATE: {
    id: '',
    username: '',
    name: '',
    email: '',
    role: 'SALES_EXECUTIVE' as const,
    realEstateDeveloperId: '',
    officeId: '',
    employeeId: ''
  }
};

export const reduxAdminSliceInitialStates = {
  ADD_OFFICE_FORM_INITIAL_STATE: {
    name: '',
    address: '',
    city: '',
    state: '',
    region: '',
    phone: '',
    isMainOffice: false
  },
  ADD_EMPLOYEE_FORM_INITIAL_STATE: {
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'SALES_EXECUTIVE' as const,
    officeId: '',
    employeeId: ''
  },
  ADD_PROJECT_FORM_INITIAL_STATE: {
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 0,
    longitude: 0,
    projectType: 'RESIDENTIAL' as const,
    propertyType: 'APARTMENT' as const,
    totalUnits: 1,
    totalArea: 0,
    areaUnit: 'sqft',
    expectedCompletionDate: '',
    constructionStartDate: '',
    amenities: [''],
    projectManagerId: '',
    salesManagerId: '',
    minPrice: 0,
    maxPrice: 0,
    currency: 'INR',
    reraNumber: '',
    reraApprovalDate: '',
    reraWebsite: '',
    legalDetails: '',
    approvals: [],
    floorPlans: [],
    images: [],
    brochures: []
  },
  OFFICES_INITIAL_STATE: [],
  EMPLOYEES_INITIAL_STATE: [],
  PROJECTS_INITIAL_STATE: []
};