import type { Project, Task, Analytics, User, TaskStatus } from '@/types';
import { UserRole } from '@/types';

export const mockUser: User = {
  id: 'demo-user-1',
  email: 'demo@example.com',
  name: 'Demo User',
  role: UserRole.MEMBER,
};

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Redesign and rebuild the company website with modern UI/UX',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creatorId: 'demo-user-1',
    creator: mockUser,
    _count: {
      tasks: 4,
      members: 3,
      files: 2,
    },
  },
  {
    id: 'project-2',
    name: 'Mobile App Development',
    description: 'Build a mobile application for iOS and Android',
    color: '#10b981',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creatorId: 'demo-user-1',
    creator: mockUser,
    _count: {
      tasks: 5,
      members: 4,
      files: 1,
    },
  },
  {
    id: 'project-3',
    name: 'Marketing Campaign',
    description: 'Plan and execute Q1 marketing campaign',
    color: '#f59e0b',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creatorId: 'demo-user-1',
    creator: mockUser,
    _count: {
      tasks: 3,
      members: 2,
      files: 0,
    },
  },
];

export const mockTasks: Task[] = [
  // Project 1 tasks
  {
    id: 'task-1',
    title: 'Design homepage mockup',
    description: 'Create initial design mockup for the homepage',
    status: 'DONE',
    priority: 'HIGH',
    assigneeNames: ['John Doe', 'Jane Smith'],
    position: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-1',
    creatorId: 'demo-user-1',
    _count: {
      comments: 3,
      files: 1,
    },
  },
  {
    id: 'task-2',
    title: 'Review design feedback',
    description: 'Gather and review feedback from stakeholders',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assigneeNames: ['Jane Smith'],
    position: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-1',
    creatorId: 'demo-user-1',
    _count: {
      comments: 2,
      files: 0,
    },
  },
  {
    id: 'task-3',
    title: 'Implement responsive layout',
    description: 'Make the design responsive for mobile devices',
    status: 'TODO',
    priority: 'HIGH',
    assigneeNames: ['John Doe'],
    position: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-1',
    creatorId: 'demo-user-1',
    _count: {
      comments: 0,
      files: 0,
    },
  },
  {
    id: 'task-4',
    title: 'Setup development environment',
    description: 'Configure development tools and environment',
    status: 'TODO',
    priority: 'MEDIUM',
    assigneeNames: ['Demo User'],
    position: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-1',
    creatorId: 'demo-user-1',
    _count: {
      comments: 1,
      files: 1,
    },
  },
  // Project 2 tasks
  {
    id: 'task-5',
    title: 'Wireframe mobile screens',
    description: 'Create wireframes for main app screens',
    status: 'DONE',
    priority: 'HIGH',
    assigneeNames: ['Sarah Johnson'],
    position: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-2',
    creatorId: 'demo-user-1',
    _count: {
      comments: 4,
      files: 0,
    },
  },
  {
    id: 'task-6',
    title: 'Setup React Native project',
    description: 'Initialize React Native project structure',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    assigneeNames: ['Mike Wilson'],
    position: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-2',
    creatorId: 'demo-user-1',
    _count: {
      comments: 2,
      files: 1,
    },
  },
  {
    id: 'task-7',
    title: 'Design app icons',
    description: 'Create app icons for iOS and Android',
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    assigneeNames: ['Sarah Johnson', 'Jane Smith'],
    position: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-2',
    creatorId: 'demo-user-1',
    _count: {
      comments: 1,
      files: 0,
    },
  },
  {
    id: 'task-8',
    title: 'Implement authentication',
    description: 'Add user authentication flow',
    status: 'TODO',
    priority: 'HIGH',
    assigneeNames: ['Mike Wilson'],
    position: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-2',
    creatorId: 'demo-user-1',
    _count: {
      comments: 0,
      files: 0,
    },
  },
  {
    id: 'task-9',
    title: 'Write unit tests',
    description: 'Create unit tests for core features',
    status: 'TODO',
    priority: 'LOW',
    assigneeNames: ['Demo User'],
    position: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-2',
    creatorId: 'demo-user-1',
    _count: {
      comments: 0,
      files: 0,
    },
  },
  // Project 3 tasks
  {
    id: 'task-10',
    title: 'Research target audience',
    description: 'Conduct market research on target demographics',
    status: 'DONE',
    priority: 'MEDIUM',
    assigneeNames: ['Emily Brown'],
    position: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-3',
    creatorId: 'demo-user-1',
    _count: {
      comments: 2,
      files: 0,
    },
  },
  {
    id: 'task-11',
    title: 'Create campaign content',
    description: 'Write copy and create visual content',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigneeNames: ['Emily Brown', 'Jane Smith'],
    position: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-3',
    creatorId: 'demo-user-1',
    _count: {
      comments: 3,
      files: 0,
    },
  },
  {
    id: 'task-12',
    title: 'Schedule social media posts',
    description: 'Plan and schedule posts across platforms',
    status: 'TODO',
    priority: 'MEDIUM',
    assigneeNames: ['Emily Brown'],
    position: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'project-3',
    creatorId: 'demo-user-1',
    _count: {
      comments: 0,
      files: 0,
    },
  },
];

// Get unique assignee names from all tasks
const allAssigneeNames = new Set<string>();
mockTasks.forEach(task => {
  if (task.assigneeNames) {
    task.assigneeNames.forEach(name => allAssigneeNames.add(name));
  }
});

export const mockAnalytics: Analytics = {
  overview: {
    totalProjects: mockProjects.length,
    totalTasks: mockTasks.length,
    myCreatedTasks: mockTasks.length,
    overdueTasks: 2,
    totalMembers: allAssigneeNames.size,
  },
  tasksByStatus: {
    TODO: mockTasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: mockTasks.filter(t => t.status === 'IN_PROGRESS').length,
    IN_REVIEW: mockTasks.filter(t => t.status === 'IN_REVIEW').length,
    DONE: mockTasks.filter(t => t.status === 'DONE').length,
  },
  tasksByPriority: {
    LOW: mockTasks.filter(t => t.priority === 'LOW').length,
    MEDIUM: mockTasks.filter(t => t.priority === 'MEDIUM').length,
    HIGH: mockTasks.filter(t => t.priority === 'HIGH').length,
    URGENT: mockTasks.filter(t => t.priority === 'URGENT').length,
  },
  recentActivity: {
    tasksCreated: 5,
    commentsAdded: 12,
  },
  topProjects: [], // Empty array to match Analytics type
};

// Generate assignees data from mock tasks
export interface AssigneeOverview {
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

export function getMockAssignees(): AssigneeOverview[] {
  const assigneesMap = new Map<string, {
    name: string;
    taskCount: number;
    projects: Set<string>;
    tasks: AssigneeOverview['tasks'];
  }>();

  mockTasks.forEach(task => {
    if (task.assigneeNames) {
      const project = mockProjects.find(p => p.id === task.projectId);
      if (!project) return;

      task.assigneeNames.forEach(name => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        if (!assigneesMap.has(trimmedName)) {
          assigneesMap.set(trimmedName, {
            name: trimmedName,
            taskCount: 0,
            projects: new Set(),
            tasks: [],
          });
        }

        const assigneeData = assigneesMap.get(trimmedName)!;
        assigneeData.taskCount++;
        assigneeData.projects.add(project.id);
        assigneeData.tasks.push({
          id: task.id,
          title: task.title,
          status: task.status,
          project: {
            id: project.id,
            name: project.name,
            color: project.color,
          },
        });
      });
    }
  });

  return Array.from(assigneesMap.values()).map(assignee => ({
    name: assignee.name,
    taskCount: assignee.taskCount,
    projectCount: assignee.projects.size,
    tasks: assignee.tasks,
  }));
}

