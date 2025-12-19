'use client';

import { useRouter } from 'next/navigation';
import type { Analytics } from '@/types';
import { BarChart3, CheckSquare, AlertCircle, Users } from 'lucide-react';

interface AnalyticsDashboardProps {
  analytics: Analytics;
}

export default function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const router = useRouter();
  const { overview, tasksByStatus, tasksByPriority, recentActivity } = analytics;

  const statusColors: Record<string, string> = {
    TODO: 'bg-gray-500',
    IN_PROGRESS: 'bg-blue-500',
    IN_REVIEW: 'bg-yellow-500',
    DONE: 'bg-green-500',
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-400',
    MEDIUM: 'bg-blue-400',
    HIGH: 'bg-orange-400',
    URGENT: 'bg-red-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-6 w-6 text-gray-700" />
        <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="bg-blue-50 rounded-lg shadow-sm border-2 border-blue-300 p-4 hover:shadow-md transition-all cursor-pointer group hover:bg-blue-100" 
          onClick={() => router.push('/projects')}
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
            <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">Projects</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-blue-900">{overview.totalProjects}</p>
            <span className="text-xs text-blue-600 group-hover:text-blue-700 font-semibold">View All →</span>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => router.push('/dashboard/assignees')}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-purple-600 group-hover:text-purple-700" />
            <span className="text-sm text-gray-600 group-hover:text-gray-900">Members</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">{overview.totalMembers}</p>
            <span className="text-xs text-purple-600 group-hover:text-purple-700 font-medium">View All →</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">Total Tasks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{overview.totalTasks}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-gray-600">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{overview.overdueTasks}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
          <div className="space-y-3">
            {Object.entries(tasksByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{status.replace('_', ' ')}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
                    style={{
                      width: `${overview.totalTasks > 0 ? (count / overview.totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
          <div className="space-y-3">
            {Object.entries(tasksByPriority).map(([priority, count]) => (
              <div key={priority}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{priority}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${priorityColors[priority] || 'bg-gray-400'}`}
                    style={{
                      width: `${overview.totalTasks > 0 ? (count / overview.totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity (7 days)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tasks Created</p>
            <p className="text-2xl font-bold text-gray-900">{recentActivity.tasksCreated}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Comments Added</p>
            <p className="text-2xl font-bold text-gray-900">{recentActivity.commentsAdded}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
