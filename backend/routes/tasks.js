import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authorizeProjectAccess } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get tasks with filtering and search
router.get('/',
  [
    query('projectId').optional().isUUID(),
    query('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
    query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    query('search').optional().trim()
  ],
  async (req, res) => {
    try {
      const { projectId, status, priority, search } = req.query;
      const userId = req.user.id;

      const where = {};

      if (projectId) {
        // Verify user has access to project
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

        where.projectId = projectId;
      } else {
        // Get all projects user has access to
        const userProjects = await prisma.projectMember.findMany({
          where: { userId },
          select: { projectId: true }
        });

        where.projectId = {
          in: userProjects.map(p => p.projectId)
        };
      }

      if (status) where.status = status;
      if (priority) where.priority = priority;

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const tasks = await prisma.task.findMany({
        where,
        include: {
          project: {
            select: { id: true, name: true, color: true }
          },
          assignee: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          creator: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          _count: {
            select: { comments: true, files: true }
          }
        },
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      // Parse assigneeNames JSON for each task
      const tasksWithParsedNames = tasks.map(task => {
        try {
          return {
            ...task,
            assigneeNames: task.assigneeNames ? (typeof task.assigneeNames === 'string' ? JSON.parse(task.assigneeNames) : task.assigneeNames) : null
          };
        } catch (error) {
          console.error('Error parsing assigneeNames for task', task.id, error);
          return {
            ...task,
            assigneeNames: null
          };
        }
      });

      res.json(tasksWithParsedNames);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }
);

// Get single task
router.get('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true }
                }
              }
            }
          }
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        files: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Parse assigneeNames JSON
    let parsedAssigneeNames = null;
    if (task.assigneeNames) {
      try {
        parsedAssigneeNames = typeof task.assigneeNames === 'string' ? JSON.parse(task.assigneeNames) : task.assigneeNames;
      } catch (error) {
        console.error('Error parsing assigneeNames for task', taskId, error);
      }
    }
    
    const taskWithParsedNames = {
      ...task,
      assigneeNames: parsedAssigneeNames
    };

    res.json(taskWithParsedNames);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('projectId').isUUID().withMessage('Valid project ID is required'),
    body('description').optional().trim(),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    body('dueDate').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, projectId, description, status, priority, assigneeNames, dueDate } = req.body;
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
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // Get max position for this project
      const maxPosition = await prisma.task.findFirst({
        where: { projectId },
        orderBy: { position: 'desc' },
        select: { position: true }
      });

      // Handle assignee names - store as JSON
      let assigneeNamesJson = null;
      let membersAdded = false;
      if (assigneeNames && Array.isArray(assigneeNames) && assigneeNames.length > 0) {
        assigneeNamesJson = JSON.stringify(assigneeNames);
        
        // For each name, check if a user exists with that name and add as project member if not already a member
        // Note: This is a simplified approach - in production you'd want email-based invites
        for (const name of assigneeNames) {
          try {
            // Find user by name
            const user = await prisma.user.findFirst({
              where: { name: name.trim() }
            });
            
            if (user) {
              // Check if user is already a project member
              const existingMember = await prisma.projectMember.findUnique({
                where: {
                  projectId_userId: {
                    projectId,
                    userId: user.id
                  }
                }
              });
              
              // Add as project member if not already a member
              if (!existingMember) {
                await prisma.projectMember.create({
                  data: {
                    projectId,
                    userId: user.id,
                    role: 'MEMBER'
                  }
                });
                membersAdded = true;
              }
            }
          } catch (error) {
            // If user doesn't exist or other error, continue - we'll just store the name
            console.log(`Could not add member ${name}:`, error.message);
          }
        }
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          projectId,
          creatorId: userId,
          status: status || 'TODO',
          priority: priority || 'MEDIUM',
          assigneeNames: assigneeNamesJson,
          dueDate: dueDate ? new Date(dueDate) : null,
          position: (maxPosition?.position || 0) + 1
        },
        include: {
          project: {
            select: { id: true, name: true, color: true }
          },
          creator: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      // Parse assigneeNames JSON for response
      let parsedAssigneeNames = null;
      if (task.assigneeNames) {
        try {
          parsedAssigneeNames = typeof task.assigneeNames === 'string' ? JSON.parse(task.assigneeNames) : task.assigneeNames;
        } catch (error) {
          console.error('Error parsing assigneeNames', error);
        }
      }
      
      const taskWithParsedNames = {
        ...task,
        assigneeNames: parsedAssigneeNames
      };

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`project-${projectId}`).emit('task-created', taskWithParsedNames);

      // If members were added, emit project-updated event to refresh member count
      if (membersAdded) {
        const updatedProject = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            creator: {
              select: { id: true, name: true, email: true, avatar: true }
            },
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true, role: true }
                }
              }
            },
            _count: {
              select: { tasks: true, members: true, files: true }
            }
          }
        });
        if (updatedProject) {
          io.to(`project-${projectId}`).emit('project-updated', updatedProject);
        }
      }

      res.status(201).json(taskWithParsedNames);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
);

// Update task
router.put('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assigneeNames, dueDate, position } = req.body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify project access
    const hasAccess = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId: req.user.id
        }
      }
    });

    if (!hasAccess && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prepare update data
    const updateData = {};
    let membersAdded = false;
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assigneeNames !== undefined) {
      if (assigneeNames && Array.isArray(assigneeNames) && assigneeNames.length > 0) {
        updateData.assigneeNames = JSON.stringify(assigneeNames);
        
        // For each name, check if a user exists with that name and add as project member if not already a member
        for (const name of assigneeNames) {
          try {
            const user = await prisma.user.findFirst({
              where: { name: name.trim() }
            });
            
            if (user) {
              const existingMember = await prisma.projectMember.findUnique({
                where: {
                  projectId_userId: {
                    projectId: task.projectId,
                    userId: user.id
                  }
                }
              });
              
              if (!existingMember) {
                await prisma.projectMember.create({
                  data: {
                    projectId: task.projectId,
                    userId: user.id,
                    role: 'MEMBER'
                  }
                });
                membersAdded = true;
              }
            }
          } catch (error) {
            console.log(`Could not add member ${name}:`, error.message);
          }
        }
      } else {
        updateData.assigneeNames = null;
      }
    }
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (position !== undefined) updateData.position = position;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        project: {
          select: { id: true, name: true, color: true }
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    // Parse assigneeNames JSON for response
    let parsedAssigneeNames = null;
    if (updatedTask.assigneeNames) {
      try {
        parsedAssigneeNames = typeof updatedTask.assigneeNames === 'string' ? JSON.parse(updatedTask.assigneeNames) : updatedTask.assigneeNames;
      } catch (error) {
        console.error('Error parsing assigneeNames', error);
      }
    }
    
    const updatedTaskWithParsedNames = {
      ...updatedTask,
      assigneeNames: parsedAssigneeNames
    };

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${task.projectId}`).emit('task-updated', updatedTaskWithParsedNames);

    // If members were added, emit project-updated event to refresh member count
    if (membersAdded) {
      const updatedProject = await prisma.project.findUnique({
        where: { id: task.projectId },
        include: {
          creator: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true, role: true }
              }
            }
          },
          _count: {
            select: { tasks: true, members: true, files: true }
          }
        }
      });
      if (updatedProject) {
        io.to(`project-${task.projectId}`).emit('project-updated', updatedProject);
      }
    }

    res.json(updatedTaskWithParsedNames);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Update task positions (for drag and drop)
router.put('/:projectId/reorder', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tasks } = req.body; // Array of { id, position }

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }

    // Verify project access
    const hasAccess = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id
        }
      }
    });

    if (!hasAccess && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update positions in transaction
    await prisma.$transaction(
      tasks.map(({ id, position }) =>
        prisma.task.update({
          where: { id },
          data: { position }
        })
      )
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${projectId}`).emit('tasks-reordered', { tasks });

    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

// Delete task
router.delete('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify project access
    const hasAccess = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId: req.user.id
        }
      }
    });

    if (!hasAccess && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${task.projectId}`).emit('task-deleted', { taskId });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Add comment to task
router.post('/:taskId/comments',
  [
    body('content').trim().notEmpty().withMessage('Comment content is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          taskId,
          userId
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`project-${task.projectId}`).emit('comment-added', comment);

      res.status(201).json(comment);
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  }
);

export default router;
