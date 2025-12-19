import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'MEMBER'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true
        }
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        user,
        token
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Demo mode - create demo account with mock data
router.post('/demo', async (req, res) => {
  try {
    
    // Check if demo user already exists
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    });

    if (!demoUser) {
      // Create demo user
      const hashedPassword = await bcrypt.hash('demo123456', 10);
      demoUser = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          password: hashedPassword,
          name: 'Demo User',
          role: 'MEMBER'
        }
      });

      // Create mock projects
      const project1 = await prisma.project.create({
        data: {
          name: 'Website Redesign',
          description: 'Redesign and rebuild the company website with modern UI/UX',
          color: '#3b82f6',
          creatorId: demoUser.id,
          members: {
            create: {
              userId: demoUser.id,
              role: 'MANAGER'
            }
          }
        }
      });

      const project2 = await prisma.project.create({
        data: {
          name: 'Mobile App Development',
          description: 'Build a mobile application for iOS and Android',
          color: '#10b981',
          creatorId: demoUser.id,
          members: {
            create: {
              userId: demoUser.id,
              role: 'MANAGER'
            }
          }
        }
      });

      const project3 = await prisma.project.create({
        data: {
          name: 'Marketing Campaign',
          description: 'Plan and execute Q1 marketing campaign',
          color: '#f59e0b',
          creatorId: demoUser.id,
          members: {
            create: {
              userId: demoUser.id,
              role: 'MANAGER'
            }
          }
        }
      });

      // Create mock tasks for project 1
      const tasks1 = [
        {
          title: 'Design homepage mockup',
          description: 'Create initial design mockup for the homepage',
          status: 'DONE',
          priority: 'HIGH',
          assigneeNames: JSON.stringify(['John Doe', 'Jane Smith']),
          projectId: project1.id,
          creatorId: demoUser.id,
          position: 1
        },
        {
          title: 'Review design feedback',
          description: 'Gather and review feedback from stakeholders',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          assigneeNames: JSON.stringify(['Jane Smith']),
          projectId: project1.id,
          creatorId: demoUser.id,
          position: 2
        },
        {
          title: 'Implement responsive layout',
          description: 'Make the design responsive for mobile devices',
          status: 'TODO',
          priority: 'HIGH',
          assigneeNames: JSON.stringify(['John Doe']),
          projectId: project1.id,
          creatorId: demoUser.id,
          position: 3
        },
        {
          title: 'Setup development environment',
          description: 'Configure development tools and environment',
          status: 'TODO',
          priority: 'MEDIUM',
          assigneeNames: JSON.stringify(['Demo User']),
          projectId: project1.id,
          creatorId: demoUser.id,
          position: 4
        }
      ];

      // Create mock tasks for project 2
      const tasks2 = [
        {
          title: 'Wireframe mobile screens',
          description: 'Create wireframes for main app screens',
          status: 'DONE',
          priority: 'HIGH',
          assigneeNames: JSON.stringify(['Sarah Johnson']),
          projectId: project2.id,
          creatorId: demoUser.id,
          position: 1
        },
        {
          title: 'Setup React Native project',
          description: 'Initialize React Native project structure',
          status: 'IN_PROGRESS',
          priority: 'URGENT',
          assigneeNames: JSON.stringify(['Mike Wilson']),
          projectId: project2.id,
          creatorId: demoUser.id,
          position: 2
        },
        {
          title: 'Design app icons',
          description: 'Create app icons for iOS and Android',
          status: 'IN_REVIEW',
          priority: 'MEDIUM',
          assigneeNames: JSON.stringify(['Sarah Johnson', 'Jane Smith']),
          projectId: project2.id,
          creatorId: demoUser.id,
          position: 3
        },
        {
          title: 'Implement authentication',
          description: 'Add user authentication flow',
          status: 'TODO',
          priority: 'HIGH',
          assigneeNames: JSON.stringify(['Mike Wilson']),
          projectId: project2.id,
          creatorId: demoUser.id,
          position: 4
        },
        {
          title: 'Write unit tests',
          description: 'Create unit tests for core features',
          status: 'TODO',
          priority: 'LOW',
          assigneeNames: JSON.stringify(['Demo User']),
          projectId: project2.id,
          creatorId: demoUser.id,
          position: 5
        }
      ];

      // Create mock tasks for project 3
      const tasks3 = [
        {
          title: 'Research target audience',
          description: 'Conduct market research on target demographics',
          status: 'DONE',
          priority: 'MEDIUM',
          assigneeNames: JSON.stringify(['Emily Brown']),
          projectId: project3.id,
          creatorId: demoUser.id,
          position: 1
        },
        {
          title: 'Create campaign content',
          description: 'Write copy and create visual content',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assigneeNames: JSON.stringify(['Emily Brown', 'Jane Smith']),
          projectId: project3.id,
          creatorId: demoUser.id,
          position: 2
        },
        {
          title: 'Schedule social media posts',
          description: 'Plan and schedule posts across platforms',
          status: 'TODO',
          priority: 'MEDIUM',
          assigneeNames: JSON.stringify(['Emily Brown']),
          projectId: project3.id,
          creatorId: demoUser.id,
          position: 3
        }
      ];

      // Create all tasks
      await prisma.task.createMany({
        data: [...tasks1, ...tasks2, ...tasks3]
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: demoUser.id, email: demoUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        avatar: demoUser.avatar
      },
      token
    });
  } catch (error) {
    console.error('Demo mode error:', error);
    res.status(500).json({ error: 'Failed to create demo account' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
