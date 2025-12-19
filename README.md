# Task Management Platform

A professional full-stack task and project management platform built with Next.js, Express, PostgreSQL, and Socket.io.

## 🚀 Features

- ✅ **User Authentication** - JWT-based authentication with secure password hashing
- ✅ **Demo Mode** - Try the application with pre-loaded sample data
- ✅ **Real-time Updates** - WebSocket integration for live collaboration
- ✅ **File Uploads** - Upload and manage files for projects and tasks
- ✅ **Role-Based Access Control** - Admin, Manager, Member, and Viewer roles
- ✅ **Search and Filtering** - Advanced search and filter capabilities for tasks
- ✅ **Drag-and-Drop UI** - Intuitive Kanban board with drag-and-drop task management
- ✅ **Analytics Dashboard** - Comprehensive analytics and insights
- ✅ **Multiple Assignees** - Assign tasks to multiple team members
- ✅ **Project Management** - Create, manage, and collaborate on projects

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time updates
- **@dnd-kit** for drag-and-drop functionality
- **Lucide React** for icons
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Prisma** ORM
- **Socket.io** for WebSocket server
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

## 📦 Getting Started

### ⚠️ Important Note

**This application requires you to install and configure your own PostgreSQL database.** The application does not come with a pre-configured database - you must set up your own database instance (local or cloud) to use this platform.

### Prerequisites

- Node.js 18+ and npm
- **PostgreSQL database** (must be installed and configured by you)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PORTFOLIO
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Install and Set Up PostgreSQL Database**

   **You must install PostgreSQL on your computer or use a cloud database service.**
   
   **Option A: Local PostgreSQL (for development)**
   - Install PostgreSQL: https://www.postgresql.org/download/
   - Create a database:
     ```sql
     CREATE DATABASE taskmanagement;
     ```
   - Update connection string in `backend/.env`:
     ```env
     DATABASE_URL="postgresql://your_username:your_password@localhost:5432/taskmanagement?schema=public"
     ```
   
   **Option B: Cloud Database (for production/deployment)**
   - Use Supabase, Render PostgreSQL, Railway, or Neon
   - Get the connection string from your provider
   - Use it as `DATABASE_URL` in environment variables

4. **Configure environment variables**

   Create `backend/.env`:
   ```env
   PORT=5002
   DATABASE_URL="postgresql://user:password@localhost:5432/taskmanagement?schema=public"
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3002
   ```

   Create `frontend/.env.local` (optional, defaults are configured):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5002/api
   ```

5. **Run database migrations**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ```

6. **Start the development servers**

   From the root directory:
   ```bash
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

7. **Open your browser**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:5002/api

### ⚠️ Database Requirement Reminder

**This application requires a PostgreSQL database to function.** Without a properly configured database connection, the application will not work. Make sure:
- PostgreSQL is installed and running (for local development)
- OR you have a cloud database connection string (for deployment)
- The `DATABASE_URL` in `backend/.env` is correct and accessible

## 🎮 Demo Mode

Click the **"Try Demo Mode"** button on the login page to explore the application with pre-loaded sample data, including:
- 3 sample projects
- 12 sample tasks with various statuses and priorities
- Multiple assignees

No sign-up required!

## 📁 Project Structure

```
PORTFOLIO/
├── backend/
│   ├── middleware/       # Authentication & error handling
│   ├── routes/          # API routes (auth, projects, tasks, files, analytics)
│   ├── prisma/          # Database schema and migrations
│   ├── uploads/         # Uploaded files (gitignored)
│   └── server.js        # Express server setup
├── frontend/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── contexts/        # React contexts (Auth, Socket)
│   ├── lib/             # API utilities
│   └── types/           # TypeScript type definitions
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/demo` - Create demo account with sample data
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member
- `DELETE /api/projects/:id/members/:userId` - Remove member

### Tasks
- `GET /api/tasks` - Get tasks (with filters: projectId, status, priority, search)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:projectId/reorder` - Reorder tasks (drag-and-drop)

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - Get files (with projectId filter)
- `DELETE /api/files/:id` - Delete file

### Analytics
- `GET /api/analytics` - Get user analytics
- `GET /api/analytics/assignees` - Get all assignees with task details
- `GET /api/analytics/project/:id` - Get project analytics

## ✨ Key Features

### Authentication & Security
- Secure password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Protected routes with middleware
- Remember me functionality
- Password visibility toggle

### Real-time Collaboration
- WebSocket server for live updates
- Real-time task updates across all clients
- Live project member notifications
- Instant task status changes

### Task Management
- Kanban board with drag-and-drop
- Multiple assignees per task
- Priority levels (Low, Medium, High, Urgent)
- Task statuses (To Do, In Progress, In Review, Done)
- Due dates and task descriptions
- Task comments and file attachments

### Project Management
- Create and manage multiple projects
- Project color coding
- Project member management
- Automatic member addition when assigning tasks
- Project deletion with confirmation modal

### Analytics
- Dashboard with project and task statistics
- Task distribution by status and priority
- Member and assignee tracking
- Recent activity monitoring
- Assignee details page with task breakdown

## 🗄️ Database Schema

- **Users** - User accounts with authentication
- **Projects** - Project information
- **ProjectMembers** - User-project relationships
- **Tasks** - Task details with assignees and status
- **Comments** - Task comments
- **Files** - Uploaded files associated with projects

## 🚢 Production Deployment

### Environment Variables

Ensure all environment variables are set in your hosting platform:

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration time
- `PORT` - Server port
- `FRONTEND_URL` - Frontend application URL
- `NODE_ENV=production`

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Deployment Notes

- Use a cloud database (Supabase, Render PostgreSQL, Railway, etc.) - local databases won't work with cloud hosting
- Configure CORS to allow your frontend domain
- Set up file storage (AWS S3, Cloudinary, etc.) for production file uploads
- Use environment variables for all secrets - never commit `.env` files
- Run `npx prisma migrate deploy` for production database migrations

## 📝 Development

### Database Management
```bash
# Generate Prisma Client
cd backend
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Building for Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## ⚠️ Disclaimer

**This project is provided "as-is" for portfolio and educational purposes.**

- This software is intended for demonstration and learning purposes
- The authors and contributors make no warranties, expressed or implied
- Users are responsible for securing their own deployments and data
- This project should not be used for production applications without proper security audits
- Always use strong, unique credentials and environment variables
- Follow security best practices when deploying to production
- Review and update all dependencies regularly
- The demo account feature creates a shared account - not suitable for production use

**Security Reminders:**
- Never commit `.env` files or secrets to version control
- Use strong, unique JWT secrets and database passwords
- Enable HTTPS in production
- Implement rate limiting and input validation
- Regularly update dependencies and security patches

## 📄 License

This project is open source and available for portfolio and educational use.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

**Built with ❤️ using Next.js, Express, and PostgreSQL**
