'use client';

import type { Project } from '@/types';
import { Calendar, Users, CheckSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete?: (projectId: string) => void;
}

export default function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(project.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow relative"
    >
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors z-10"
          title="Delete project"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
        </div>
      </div>

      {project.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <CheckSquare className="h-4 w-4" />
          <span>{project._count?.tasks || 0} tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{project._count?.members || 0} members</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(project.updatedAt), 'MMM d')}</span>
        </div>
      </div>
    </div>
  );
}
