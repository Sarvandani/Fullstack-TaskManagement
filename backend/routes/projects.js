import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authorizeProjectAccess } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all projects for user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { members: { some: { userId } } }
        ]
      },
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
          select: { tasks: true, members: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:projectId', authorizeProjectAccess, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
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
        tasks: {
          include: {
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
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { tasks: true, members: true, files: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
    body('color').optional().isHexColor()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, color } = req.body;
      const userId = req.user.id;

      const project = await prisma.project.create({
        data: {
          name,
          description,
          color: color || '#3b82f6',
          creatorId: userId,
          members: {
            create: {
              userId,
              role: 'MANAGER'
            }
          }
        },
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
          }
        }
      });

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`project-${project.id}`).emit('project-created', project);

      res.status(201).json(project);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
);

// Update project
router.put('/:projectId', authorizeProjectAccess, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, color } = req.body;
    const userId = req.user.id;

    // Check if user is creator or manager
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    const member = project.members.find(m => m.userId === userId);
    const canEdit = project.creatorId === userId || 
                   member?.role === 'MANAGER' || 
                   req.user.role === 'ADMIN';

    if (!canEdit) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color })
      },
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
        }
      }
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${projectId}`).emit('project-updated', updatedProject);

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:projectId', authorizeProjectAccess, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (project.creatorId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only project creator can delete' });
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${projectId}`).emit('project-deleted', { projectId });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Add member to project
router.post('/:projectId/members',
  [
    body('userId').notEmpty(),
    body('role').isIn(['MEMBER', 'MANAGER', 'VIEWER'])
  ],
  authorizeProjectAccess,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { projectId } = req.params;
      const { userId, role } = req.body;

      const member = await prisma.projectMember.create({
        data: {
          projectId,
          userId,
          role: role || 'MEMBER'
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, role: true }
          }
        }
      });

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`project-${projectId}`).emit('member-added', member);

      res.status(201).json(member);
    } catch (error) {
      console.error('Add member error:', error);
      res.status(500).json({ error: 'Failed to add member' });
    }
  }
);

// Remove member from project
router.delete('/:projectId/members/:userId', authorizeProjectAccess, async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${projectId}`).emit('member-removed', { userId, projectId });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

export default router;
