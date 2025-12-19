export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  creator: User;
  creatorId: string;
  members?: ProjectMember[];
  tasks?: Task[];
  _count?: {
    tasks: number;
    members: number;
    files: number;
  };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: UserRole;
  joinedAt: string;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  assigneeName?: string; // For backward compatibility
  assigneeNames?: string[]; // Array of assignee names
  position: number;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: Project;
  creatorId: string;
  creator?: User;
  comments?: Comment[];
  files?: File[];
  _count?: {
    comments: number;
    files: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  userId: string;
  user: User;
}

export interface File {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  user: User;
}

export interface Analytics {
  overview: {
    totalProjects: number;
    totalTasks: number;
    myCreatedTasks: number;
    overdueTasks: number;
    totalMembers: number;
  };
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<Priority, number>;
  recentActivity: {
    tasksCreated: number;
    commentsAdded: number;
  };
  topProjects: Array<{
    id: string;
    name: string;
    color: string;
    _count: {
      tasks: number;
      members: number;
    };
  }>;
}
