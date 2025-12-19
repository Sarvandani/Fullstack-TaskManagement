'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Project, Task } from '@/types';
import { TaskStatus } from '@/types';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import { Plus } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  project: Project;
  onCreateTask: (task: Partial<Task>) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onReorderTasks: (tasks: Array<{ id: string; position: number }>) => Promise<void>;
}

const statuses: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.DONE];

export default function TaskBoard({
  tasks,
  project,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>(TaskStatus.TODO);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Update task status
    await onUpdateTask(taskId, { status: newStatus });

    // Reorder tasks within the new column
    const tasksInNewStatus = tasks
      .filter((t) => t.status === newStatus && t.id !== taskId)
      .sort((a, b) => a.position - b.position);

    const reorderedTasks = [
      ...tasksInNewStatus.map((t, index) => ({ id: t.id, position: index + 1 })),
      { id: taskId, position: tasksInNewStatus.length + 1 },
    ];

    await onReorderTasks(reorderedTasks);
  };

  const tasksByStatus = statuses.reduce((acc, status) => {
    acc[status] = tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Task Board</h2>
        <button
          onClick={() => {
            setCreateStatus('TODO');
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Task
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statuses.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status] || []}
              onTaskClick={(task) => {
                // Open task detail modal
                console.log('Task clicked:', task);
              }}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onCreateTask={() => {
                setCreateStatus(status);
                setShowCreateModal(true);
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-50">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showCreateModal && (
        <CreateTaskModal
          project={project}
          defaultStatus={createStatus}
          onClose={() => setShowCreateModal(false)}
          onCreate={async (taskData) => {
            await onCreateTask(taskData);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
