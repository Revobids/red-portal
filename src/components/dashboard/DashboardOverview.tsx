'use client';

import { Building2, Users, FolderOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/redux/hooks';

export default function DashboardOverview() {
  const { offices, employees, projects } = useAppSelector((state) => state.admin);

  const stats = [
    {
      title: 'Total Offices',
      value: offices.length,
      description: 'Active office locations',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Employees',
      value: employees.length,
      description: 'Active team members',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Projects',
      value: projects.filter(p => p.status === 'PUBLISHED').length,
      description: 'Published projects',
      icon: FolderOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Draft Projects',
      value: projects.filter(p => p.status === 'UNPUBLISHED').length,
      description: 'Projects in development',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-600">Monitor your real estate business at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-xs text-slate-600 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Projects</CardTitle>
            <CardDescription>Latest project activities</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No projects created yet</p>
                <p className="text-sm">Create your first project to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 3).map((project, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{project.name}</h4>
                      <p className="text-sm text-slate-600">{project.description || 'No description'}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {project.status === 'PUBLISHED' ? 'Active' : 'Draft'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Overview</CardTitle>
            <CardDescription>Employee distribution by role</CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No employees added yet</p>
                <p className="text-sm">Add team members to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {['ADMIN', 'MANAGER', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SALES', 'FINANCE'].map((role) => {
                  const count = employees.filter(emp => emp.role === role).length;
                  if (count === 0) return null;
                  
                  return (
                    <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-900">{role}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}