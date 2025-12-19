'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsAPI } from '@/lib/api';
import { getMockAssignees } from '@/lib/mockData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ArrowLeft, Users, ChevronDown, ChevronUp } from 'lucide-react';
import type { TaskStatus } from '@/types';

interface Assignee {
  name: string;
  taskCount: number;
  projectCount: number;
  tasks: Array<{
    id: string;
    title: string;
    status: TaskStatus;
    project: {
      id: string;
      name: string;
      color: string;
    };
  }>;
}

const statusColors: Record<TaskStatus, string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
};

export default function AssigneesPage() {
  const { user, loading: authLoading, isDemoMode } = useAuth();
  const router = useRouter();
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAssignee, setExpandedAssignee] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchAssignees();
    }
  }, [user]);

  const fetchAssignees = async () => {
    try {
      if (isDemoMode) {
        // Use mock data in demo mode
        setAssignees(getMockAssignees());
      } else {
        const assigneesData = await analyticsAPI.getAssignees();
        setAssignees(assigneesData);
      }
    } catch (error) {
      console.error('Failed to fetch assignees:', error);
      // Fallback to mock data on error in demo mode
      if (isDemoMode) {
        setAssignees(getMockAssignees());
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>

        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Assignees</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              View all assignees and their assigned tasks
            </p>
          </div>
        </div>

        {/* Assignees Table */}
        {assignees.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No assignees found
            </h3>
            <p className="text-gray-600">
              Assign tasks to see assignees here
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignees.map((assignee) => (
                  <React.Fragment key={assignee.name}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        setExpandedAssignee(
                          expandedAssignee === assignee.name ? null : assignee.name
                        )
                      }
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 font-semibold text-xs sm:text-sm">
                              {assignee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3 sm:ml-4 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {assignee.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-medium">
                          {assignee.taskCount}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-medium">
                          {assignee.projectCount}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expandedAssignee === assignee.name ? (
                          <ChevronUp className="h-5 w-5 inline-block text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 inline-block text-gray-500" />
                        )}
                      </td>
                    </tr>
                    {expandedAssignee === assignee.name && (
                      <tr>
                        <td colSpan={4} className="px-4 sm:px-6 py-4 bg-gray-50">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                              Assigned Tasks ({assignee.tasks.length})
                            </h4>
                            <div className="space-y-2">
                              {assignee.tasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/projects/${task.project.id}`);
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: task.project.color }}
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                      {task.title}
                                    </span>
                                    <span
                                      className={`inline-block px-2 py-1 rounded text-xs font-medium border ${statusColors[task.status]}`}
                                    >
                                      {task.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {task.project.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

