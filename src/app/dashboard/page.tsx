'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { setSelectedTab, setOffices, setEmployees, setProjects } from '@/redux/slices/adminSlice';
import { useAuthInit } from '@/hooks/useAuth';
import { getCookieValue } from '@/lib/auth';
import ApiManager from '@/api/ApiManager';
import { 
  Building2, 
  Users, 
  FolderOpen, 
  BarChart3, 
  LogOut,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import OfficeManagement from '@/components/dashboard/OfficeManagement';
import EmployeeManagement from '@/components/dashboard/EmployeeManagement';
import ProjectManagement from '@/components/dashboard/ProjectManagement';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedTab } = useAppSelector((state) => state.admin);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give time for auth state to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!isAuthenticated && !getCookieValue('access_token')) {
        router.push('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Load initial data when authenticated
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user.id) {
        try {
          // Load offices
          const officesResponse = await ApiManager.getOffices();
          // API returns array directly, not wrapped in {success, data}
          if (Array.isArray(officesResponse)) {
            dispatch(setOffices(officesResponse));
          } else if (officesResponse && officesResponse.data) {
            dispatch(setOffices(officesResponse.data));
          }

          // Load employees
          const employeesResponse = await ApiManager.getEmployees();
          // API returns array directly, not wrapped in {success, data}
          if (Array.isArray(employeesResponse)) {
            dispatch(setEmployees(employeesResponse));
          } else if (employeesResponse && employeesResponse.data) {
            dispatch(setEmployees(employeesResponse.data));
          }

          // Load projects
          const projectsResponse = await ApiManager.getProjects();
          // API returns array directly, not wrapped in {success, data}
          if (Array.isArray(projectsResponse)) {
            dispatch(setProjects(projectsResponse));
          } else if (projectsResponse && projectsResponse.data) {
            dispatch(setProjects(projectsResponse.data));
          }
        } catch (error) {
          console.error('Failed to load dashboard data:', error);
        }
      }
    };

    loadData();
  }, [isAuthenticated, user.id, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  const handleTabChange = (value: string) => {
    dispatch(setSelectedTab(value as 'dashboard' | 'offices' | 'employees' | 'projects'));
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Real Estate Portal</h1>
                <p className="text-sm text-slate-600">Management Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {user.role}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="offices" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Offices
              </TabsTrigger>
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <DashboardOverview />
            </TabsContent>

            <TabsContent value="offices" className="space-y-6">
              <OfficeManagement />
            </TabsContent>

            <TabsContent value="employees" className="space-y-6">
              <EmployeeManagement />
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <ProjectManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}