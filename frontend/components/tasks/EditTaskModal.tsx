'use client';

import { useState, useEffect } from 'react';
import type { Task, TaskStatus, Priority } from '@/types';
import { X } from 'lucide-react';
import MultiNameInput from './MultiNameInput';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export default function EditTaskModal({
  task,
  onClose,
  onUpdate,
}: EditTaskModalProps) {
  console.log('EditTaskModal: task prop received:', task);
  console.log('EditTaskModal: task.assigneeNames:', task.assigneeNames);
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [assigneeNames, setAssigneeNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize assigneeNames when task changes
  useEffect(() => {
    console.log('EditTaskModal: task.assigneeNames:', task.assigneeNames);
    console.log('EditTaskModal: task.assigneeName:', task.assigneeName);
    
    // Handle both array and single string for backward compatibility
    if (task.assigneeNames) {
      const names = Array.isArray(task.assigneeNames) ? task.assigneeNames : [];
      console.log('Setting assigneeNames from task.assigneeNames:', names);
      setAssigneeNames(names);
    } else if (task.assigneeName) {
      console.log('Setting assigneeNames from task.assigneeName:', [task.assigneeName]);
      setAssigneeNames([task.assigneeName]);
    } else {
      setAssigneeNames([]);
    }
  }, [task.id, task.assigneeNames, task.assigneeName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      console.log('Updating task with assigneeNames:', assigneeNames);
      await onUpdate(task.id, {
        title,
        description: description || undefined,
        status,
        priority,
        assigneeNames: assigneeNames.length > 0 ? assigneeNames : undefined,
        dueDate: dueDate || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Task title"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Task description..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <MultiNameInput
              value={assigneeNames}
              onChange={(names) => {
                console.log('EditTaskModal: assigneeNames changed to:', names);
                setAssigneeNames(names);
              }}
              placeholder="Enter person name..."
            />
            {assigneeNames.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {assigneeNames.length} name{assigneeNames.length > 1 ? 's' : ''} added
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
