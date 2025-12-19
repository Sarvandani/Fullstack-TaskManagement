'use client';

import { useState } from 'react';
import type { Project } from '@/types';
import { projectsAPI } from '@/lib/api';
import { Settings, Users, Trash2 } from 'lucide-react';

interface ProjectHeaderProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export default function ProjectHeader({ project, onUpdate, onDelete }: ProjectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');

  const handleSave = async () => {
    try {
      const updated = await projectsAPI.update(project.id, { name, description });
      onUpdate(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-2xl font-bold border-b-2 border-blue-500 focus:outline-none"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Project description..."
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setName(project.name);
                setDescription(project.description || '');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{project.name}</h1>
            </div>
            {project.description && (
              <p className="text-gray-600 mb-4 break-words">{project.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{project._count?.members || 0} members</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onDelete && (
              <button
                onClick={() => onDelete(project.id)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete project"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Edit project"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
