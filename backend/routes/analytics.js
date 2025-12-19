import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get analytics for user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all projects user has access to
    const userProjects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    });

    const projectIds = userProjects.map(p => p.projectId);

    // Get user's own projects
    const ownProjects = await prisma.project.findMany({
      where: { creatorId: userId },
      select: { id: true }
    });

    const allProjectIds = [...projectIds, ...ownProjects.map(p => p.id)];

    // Task statistics
    const totalTasks = await prisma.task.count({
      where: {
        projectId: { in: allProjectIds }
      }
    });

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: {
        projectId: { in: allProjectIds }
      },
      _count: true
    });

    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      where: {
        projectId: { in: allProjectIds }
      },
      _count: true
    });

    // Tasks created by user
    const myCreatedTasks = await prisma.task.count({
      where: {
        creatorId: userId,
        projectId: { in: allProjectIds }
      }
    });

    // Overdue tasks
    const overdueTasks = await prisma.task.count({
      where: {
        projectId: { in: allProjectIds },
        dueDate: {
          lt: new Date()
        },
        status: {
          not: 'DONE'
        }
      }
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTasks = await prisma.task.count({
      where: {
        projectId: { in: allProjectIds },
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    const recentComments = await prisma.comment.count({
      where: {
        task: {
          projectId: { in: allProjectIds }
        },
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Project statistics
    const totalProjects = await prisma.project.count({
      where: {
        OR: [
          { id: { in: allProjectIds } }
        ]
      }
    });

    // Count unique assignees from all tasks (based on assigneeNames)
    const tasksWithAssignees = await prisma.task.findMany({
      where: {
        projectId: { in: allProjectIds },
        assigneeNames: { not: null }
      },
      select: {
        assigneeNames: true
      }
    });

    // Extract all assignee names and get unique count
    const allAssigneeNames = new Set();
    tasksWithAssignees.forEach(task => {
      if (task.assigneeNames) {
        try {
          const names = typeof task.assigneeNames === 'string' 
            ? JSON.parse(task.assigneeNames) 
            : task.assigneeNames;
          if (Array.isArray(names)) {
            names.forEach(name => {
              if (name && name.trim()) {
                allAssigneeNames.add(name.trim());
              }
            });
          }
        } catch (error) {
          console.error('Error parsing assigneeNames:', error);
        }
      }
    });
    const totalMembers = allAssigneeNames.size;

    res.json({
      overview: {
        totalProjects,
        totalTasks,
        myCreatedTasks,
        overdueTasks,
        totalMembers
      },
      tasksByStatus: tasksByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      tasksByPriority: tasksByPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {}),
      recentActivity: {
        tasksCreated: recentTasks,
        commentsAdded: recentComments
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get all assignees
router.get('/assignees', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all projects user has access to
    const userProjects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    });

    const projectIds = userProjects.map(p => p.projectId);

    // Get user's own projects
    const ownProjects = await prisma.project.findMany({
      where: { creatorId: userId },
      select: { id: true }
    });

    const allProjectIds = [...projectIds, ...ownProjects.map(p => p.id)];

    // Get all tasks with assignee names
    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: allProjectIds },
        assigneeNames: { not: null }
      },
      select: {
        id: true,
        title: true,
        status: true,
        assigneeNames: true,
        projectId: true,
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    // Process assignees: create a map of assignee name to their tasks and projects
    const assigneeMap = new Map();

    tasks.forEach(task => {
      if (task.assigneeNames) {
        try {
          const names = typeof task.assigneeNames === 'string'
            ? JSON.parse(task.assigneeNames)
            : task.assigneeNames;

          if (Array.isArray(names)) {
            names.forEach(name => {
              if (name && name.trim()) {
                const trimmedName = name.trim();
                if (!assigneeMap.has(trimmedName)) {
                  assigneeMap.set(trimmedName, {
                    name: trimmedName,
                    taskCount: 0,
                    projects: new Set(),
                    tasks: []
                  });
                }
                const assignee = assigneeMap.get(trimmedName);
                assignee.taskCount++;
                assignee.projects.add(task.project.id);
                assignee.tasks.push({
                  id: task.id,
                  title: task.title,
                  status: task.status,
                  project: task.project
                });
              }
            });
          }
        } catch (error) {
          console.error('Error parsing assigneeNames:', error);
        }
      }
    });

    // Convert map to array and format response
    const assignees = Array.from(assigneeMap.values()).map(assignee => ({
      name: assignee.name,
      taskCount: assignee.taskCount,
      projectCount: assignee.projects.size,
      tasks: assignee.tasks
    }));

    // Sort by task count descending
    assignees.sort((a, b) => b.taskCount - a.taskCount);

    res.json(assignees);
  } catch (error) {
    console.error('Get assignees error:', error);
    res.status(500).json({ error: 'Failed to fetch assignees' });
  }
});

// Get project-specific analytics
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify project access
    const hasAccess = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    if (!hasAccess && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId },
      _count: true
    });

    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      where: { projectId },
      _count: true
    });

    const totalTasks = await prisma.task.count({
      where: { projectId }
    });

    const completedTasks = await prisma.task.count({
      where: {
        projectId,
        status: 'DONE'
      }
    });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    res.json({
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      tasksByStatus: tasksByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      tasksByPriority: tasksByPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get project analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch project analytics' });
  }
});

export default router;
