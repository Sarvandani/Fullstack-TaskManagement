'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, Priority } from '@/types';
import { GripVertical, Calendar, User, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import EditTaskModal from './EditTaskModal';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const priorityColors: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-700 border-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-300',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
  URGENT: 'bg-red-100 text-red-700 border-red-300',
};

export default function TaskCard({ task, onClick, onUpdate, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const [showEditModal, setShowEditModal] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border border-gray-200 py-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          {/* Action buttons above title */}
          <div className="flex justify-end gap-1 mb-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleEdit}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit task"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Task title */}
          <h3 className="font-semibold text-gray-900 mb-3 break-words">{task.title}</h3>

          <div className="space-y-2.5">
            {/* Priority */}
            <div>
              <span
                className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${priorityColors[task.priority]}`}
              >
                {task.priority}
              </span>
            </div>

            {/* Assign To */}
            {(task.assigneeNames && task.assigneeNames.length > 0) || task.assigneeName ? (
              <div className="flex items-start gap-1.5 text-xs text-gray-600">
                <User className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span className="break-words">
                  {(task.assigneeNames && task.assigneeNames.length > 0
                    ? task.assigneeNames
                    : task.assigneeName
                    ? [task.assigneeName]
                    : []
                  ).join(', ')}
                </span>
              </div>
            ) : null}

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
              </div>
            )}

            {/* Comments and Files count */}
            {task._count && (task._count.comments > 0 || task._count.files > 0) && (
              <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
                {task._count.comments > 0 && (
                  <span>💬 {task._count.comments} comments</span>
                )}
                {task._count.files > 0 && (
                  <span>📎 {task._count.files} files</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
