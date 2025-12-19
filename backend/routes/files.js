import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types, but you can add restrictions here
    cb(null, true);
  }
});

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { projectId, taskId } = req.body;
    const userId = req.user.id;

    // Verify project access if projectId provided
    if (projectId) {
      const hasAccess = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId
          }
        }
      });

      if (!hasAccess && req.user.role !== 'ADMIN') {
        // Delete uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ error: 'Access denied to this project' });
      }
    }

    const file = await prisma.file.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        projectId: projectId || null,
        taskId: taskId || null,
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
    if (projectId) {
      io.to(`project-${projectId}`).emit('file-uploaded', file);
    }

    res.status(201).json(file);
  } catch (error) {
    console.error('Upload file error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get files
router.get('/', async (req, res) => {
  try {
    const { projectId, taskId } = req.query;
    const userId = req.user.id;

    const where = {};

    if (projectId) {
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

      where.projectId = projectId;
    }

    if (taskId) {
      where.taskId = taskId;
    }

    const files = await prisma.file.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Delete file
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Only file owner, project manager, or admin can delete
    const canDelete = file.userId === userId || req.user.role === 'ADMIN';

    if (!canDelete && file.projectId) {
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: file.projectId,
            userId
          }
        }
      });
      if (member?.role === 'MANAGER') {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Delete file from filesystem
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await prisma.file.delete({
      where: { id: fileId }
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (file.projectId) {
      io.to(`project-${file.projectId}`).emit('file-deleted', { fileId });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
