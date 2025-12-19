'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { projectsAPI } from '@/lib/api';
import { mockProjects } from '@/lib/mockData';
import type { Project } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProjectCard from '@/components/projects/ProjectCard';
import ConfirmModal from '@/components/common/ConfirmModal';
import { ArrowLeft, FolderKanban, Plus } from 'lucide-react';

export default function AllProjectsPage() {
  const { user, loading: authLoading, isDemoMode } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: string | null; projectName: string }>({
    isOpen: false,
    projectId: null,
    projectName: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      if (isDemoMode) {
        // Use mock data in demo mode
        setProjects(mockProjects);
      } else {
        const projectsData = await projectsAPI.getAll();
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Fallback to mock data on error in demo mode
      if (isDemoMode) {
        setProjects(mockProjects);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    if (isDemoMode) {
      alert('This is a demo. Creating projects requires a database connection.');
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      return;
    }

    try {
      const project = await projectsAPI.create({
        name: newProjectName,
        description: newProjectDesc || undefined,
      });
      setProjects([project, ...projects]);
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleDeleteClick = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setDeleteModal({
        isOpen: true,
        projectId,
        projectName: project.name,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.projectId) return;

    if (isDemoMode) {
      alert('This is a demo. Deleting projects requires a database connection.');
      setDeleteModal({ isOpen: false, projectId: null, projectName: '' });
      return;
    }

    try {
      await projectsAPI.delete(deleteModal.projectId);
      setProjects((prev) => prev.filter((p) => p.id !== deleteModal.projectId));
      setDeleteModal({ isOpen: false, projectId: null, projectName: '' });
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      alert(error.response?.data?.error || 'Failed to delete project');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, projectId: null, projectName: '' });
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage and organize all your projects
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FolderKanban className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first project to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => router.push(`/projects/${project.id}`)}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My Project"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Project description..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewProjectName('');
                      setNewProjectDesc('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          title="Delete Project"
          message={`Are you sure you want to delete "${deleteModal.projectName}"? This action cannot be undone and will delete all tasks, comments, and files associated with this project.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
}
