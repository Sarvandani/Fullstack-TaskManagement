'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { projectsAPI, tasksAPI, filesAPI, analyticsAPI } from '@/lib/api';
import { mockProjects, mockTasks } from '@/lib/mockData';
import type { Project, Task, File } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TaskBoard from '@/components/tasks/TaskBoard';
import ProjectHeader from '@/components/projects/ProjectHeader';
import FileList from '@/components/files/FileList';
import ConfirmModal from '@/components/common/ConfirmModal';
import { ArrowLeft } from 'lucide-react';

export default function ProjectPage() {
  const { user, loading: authLoading, isDemoMode } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'files'>('tasks');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && projectId) {
      fetchProjectData();
    }
  }, [user, projectId]);

  useEffect(() => {
    if (isDemoMode) return; // Skip socket connection in demo mode
    if (!socket || !projectId) return;

    socket.emit('join-project', projectId);

    socket.on('task-created', (newTask: Task) => {
      if (newTask.projectId === projectId) {
        setTasks((prev) => {
          // Check if task already exists to prevent duplicates
          const exists = prev.some((t) => t.id === newTask.id);
          if (exists) return prev;
          return [...prev, newTask];
        });
      }
    });

    socket.on('task-updated', (updatedTask: Task) => {
      if (updatedTask.projectId === projectId) {
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
      }
    });

    socket.on('task-deleted', ({ taskId }: { taskId: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    });

    socket.on('tasks-reordered', ({ tasks: reorderedTasks }: { tasks: Array<{ id: string; position: number }> }) => {
      setTasks((prev) => {
        const taskMap = new Map(prev.map((t) => [t.id, t]));
        reorderedTasks.forEach(({ id, position }) => {
          const task = taskMap.get(id);
          if (task) {
            task.position = position;
          }
        });
        return Array.from(taskMap.values()).sort((a, b) => a.position - b.position);
      });
    });

    socket.on('comment-added', (comment: any) => {
      setTasks((prev) =>
        prev.map((t): Task => {
          if (t.id === comment.taskId) {
            // Check if comment already exists to prevent duplicates
            const commentExists = t.comments?.some((c) => c.id === comment.id);
            if (commentExists) return t;
            
            return {
              ...t,
              comments: [...(t.comments || []), comment],
              _count: {
                comments: (t._count?.comments || 0) + 1,
                files: t._count?.files || 0,
              },
            } as Task;
          }
          return t;
        })
      );
    });

    socket.on('file-uploaded', (newFile: File) => {
      if (newFile.projectId === projectId) {
        setFiles((prev) => {
          // Check if file already exists to prevent duplicates
          const exists = prev.some((f) => f.id === newFile.id);
          if (exists) return prev;
          return [newFile, ...prev];
        });
      }
    });

    socket.on('file-deleted', ({ fileId }: { fileId: string }) => {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    });

    socket.on('project-updated', (updatedProject: Project) => {
      if (updatedProject.id === projectId) {
        setProject(updatedProject);
      }
    });

    return () => {
      socket.emit('leave-project', projectId);
      socket.off('task-created');
      socket.off('task-updated');
      socket.off('task-deleted');
      socket.off('tasks-reordered');
      socket.off('comment-added');
      socket.off('file-uploaded');
      socket.off('file-deleted');
      socket.off('project-updated');
    };
  }, [socket, projectId, isDemoMode]);

  const fetchProjectData = async () => {
    try {
      if (isDemoMode) {
        // Use mock data in demo mode
        const mockProject = mockProjects.find(p => p.id === projectId);
        if (!mockProject) {
          router.push('/dashboard');
          return;
        }
        const mockProjectTasks = mockTasks.filter(t => t.projectId === projectId);
        setProject(mockProject);
        setTasks(mockProjectTasks);
        setFiles([]); // No files in demo
      } else {
        const [projectData, tasksData, filesData] = await Promise.all([
          projectsAPI.getById(projectId),
          tasksAPI.getAll({ projectId }),
          filesAPI.getAll({ projectId }),
        ]);
        setProject(projectData);
        setTasks(tasksData);
        setFiles(filesData);
      }
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      // Fallback to mock data on error in demo mode
      if (isDemoMode) {
        const mockProject = mockProjects.find(p => p.id === projectId);
        if (mockProject) {
          const mockProjectTasks = mockTasks.filter(t => t.projectId === projectId);
          setProject(mockProject);
          setTasks(mockProjectTasks);
          setFiles([]);
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreate = async (taskData: Partial<Task>) => {
    if (isDemoMode) {
      alert('This is a demo. Creating tasks requires a database connection.');
      return;
    }

    try {
      const newTask = await tasksAPI.create({
        ...taskData,
        projectId,
      });
      setTasks((prev) => {
        // Check if task already exists to prevent duplicates
        const exists = prev.some((t) => t.id === newTask.id);
        if (exists) return prev;
        return [...prev, newTask];
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    if (isDemoMode) {
      // In demo mode, just update local state
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );
      return { ...mockTasks.find(t => t.id === taskId)!, ...updates };
    }

    try {
      console.log('handleTaskUpdate called with:', { taskId, updates });
      console.log('handleTaskUpdate: updates.assigneeNames:', updates.assigneeNames);
      const updatedTask = await tasksAPI.update(taskId, updates);
      console.log('Updated task from API:', updatedTask);
      console.log('Updated task from API - assigneeNames:', updatedTask.assigneeNames);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (isDemoMode) {
      alert('This is a demo. Deleting tasks requires a database connection.');
      return;
    }

    try {
      await tasksAPI.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleTaskReorder = async (reorderedTasks: Array<{ id: string; position: number }>) => {
    if (isDemoMode) {
      // In demo mode, just update local state
      setTasks((prev) => {
        const taskMap = new Map(prev.map((t) => [t.id, t]));
        reorderedTasks.forEach(({ id, position }) => {
          const task = taskMap.get(id);
          if (task) {
            task.position = position;
          }
        });
        return Array.from(taskMap.values()).sort((a, b) => a.position - b.position);
      });
      return;
    }

    try {
      await tasksAPI.reorder(projectId, reorderedTasks);
    } catch (error) {
      console.error('Failed to reorder tasks:', error);
      fetchProjectData(); // Revert on error
    }
  };

  const handleFileUpload = async (file: File) => {
    if (isDemoMode) {
      alert('This is a demo. Uploading files requires a database connection.');
      return;
    }

    try {
      const uploadedFile = await filesAPI.upload(file, projectId);
      setFiles((prev) => {
        // Check if file already exists to prevent duplicates
        const exists = prev.some((f) => f.id === uploadedFile.id);
        if (exists) return prev;
        return [uploadedFile, ...prev];
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (isDemoMode) {
      alert('This is a demo. Deleting files requires a database connection.');
      return;
    }

    try {
      await filesAPI.delete(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleDeleteProject = (projectIdToDelete: string) => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!project) return;

    if (isDemoMode) {
      alert('This is a demo. Deleting projects requires a database connection.');
      setShowDeleteModal(false);
      return;
    }

    try {
      await projectsAPI.delete(project.id);
      router.push('/projects');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      alert(error.response?.data?.error || 'Failed to delete project');
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <ProjectHeader project={project} onUpdate={setProject} onDelete={handleDeleteProject} />

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'files'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Files
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'tasks' ? (
          <TaskBoard
            tasks={tasks}
            project={project}
            onCreateTask={handleTaskCreate}
            onUpdateTask={handleTaskUpdate}
            onDeleteTask={handleTaskDelete}
            onReorderTasks={handleTaskReorder}
          />
        ) : (
          <FileList
            files={files}
            projectId={projectId}
            onUpload={handleFileUpload}
            onDelete={handleFileDelete}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Project"
          message={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will delete all tasks, comments, and files associated with this project.`}
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
