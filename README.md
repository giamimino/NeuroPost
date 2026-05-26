# NeuroPost

A full-stack social platform for sharing and discussing neural network insights, AI research, and brain-related content. Built with modern web technologies including Next.js, WebSockets, and Node.js.

## Overview

NeuroPost is a monorepo-based application that enables users to create posts, engage with comments, manage notifications, search content, and interact with other users in real-time. The platform features real-time updates through WebSocket connections, efficient caching strategies, and a scalable backend architecture.

## Technology Stack

### Client (Next.js Frontend)
- **Framework**: Next.js 16.1.4 with App Router
- **UI**: React 19.2.3 with Tailwind CSS & Radix UI components
- **State Management**: Zustand
- **Real-time**: WebSocket (ws)
- **Authentication**: JWT with bcrypt
- **Database**: Neon (PostgreSQL)
- **Caching**: Redis with IORedis client
- **File Storage**: AWS S3
- **Email**: Resend
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript

### Server (Node.js Backend)
- **Runtime**: Node.js with ES modules
- **Framework**: Express-like HTTP server with WebSocket support
- **Database**: Neon (PostgreSQL) with serverless driver
- **Caching**: Redis (IORedis)
- **Job Queue**: BullMQ (for background jobs)
- **Authentication**: JWT with bcrypt
- **Validation**: Zod
- **Testing**: Vitest with WebSocket mocking
- **Code Quality**: ESLint, Prettier, TypeScript

## Project Structure

```
NeuroPost/
├── client/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages and layouts
│   │   ├── components/      # Reusable React components
│   │   ├── lib/             # Utility functions (API calls, auth, DB, JWT, utils)
│   │   ├── hooks/           # Custom React hooks (debounce, localStorage, etc.)
│   │   ├── store/           # State management (Zustand stores, contexts)
│   │   ├── types/           # TypeScript type definitions
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── constants/       # Application constants
│   │   ├── middlewares/     # Auth and rate-limiting middleware
│   │   ├── utils/           # Helper utilities (validators, scoring, etc.)
│   │   └── cache/           # Caching logic (search index cache)
│   ├── public/              # Static assets
│   └── package.json
│
├── server/                    # Node.js backend application
│   ├── src/
│   │   ├── server.ts        # Server entry point
│   │   ├── config/          # Configuration files
│   │   ├── lib/             # Core libraries (auth, DB, logger, redis, validators)
│   │   ├── types/           # TypeScript type definitions
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── modules/         # Feature modules (chat, etc.)
│   │   ├── middlewares/     # Express middlewares (error handling, rate limiting)
│   │   ├── rooms/           # WebSocket room management
│   │   ├── ws/              # WebSocket handlers
│   │   ├── workers/         # Background workers (search indexing, etc.)
│   │   ├── utils/           # Helper utilities
│   │   └── constants/       # Application constants
│   └── package.json
│
├── package.json             # Root package.json with workspace configuration
└── README.md               # This file
```

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v10 or higher (or yarn/pnpm)
- **Git**: For version control
- **Environment Variables**: Required for database, Redis, AWS, and authentication (see `.env` setup below)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/giamimino/NeuroPost.git
cd NeuroPost
```

### 2. Install Dependencies

This is a monorepo using npm workspaces, so installing dependencies at the root will install for all packages:

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local` file in the root directory (or in `client/` and `server/` directories as needed):

**Common variables needed:**
- `DATABASE_URL`: Neon PostgreSQL connection string
- `REDIS_URL`: Redis connection URL
- `JWT_SECRET`: Secret key for JWT tokens
- `AWS_ACCESS_KEY_ID`: AWS S3 credentials
- `AWS_SECRET_ACCESS_KEY`: AWS S3 credentials
- `AWS_REGION`: AWS region for S3
- `RESEND_API_KEY`: Email service API key
- `NEXT_PUBLIC_API_URL`: Public API endpoint

Refer to each package's documentation or `.env.example` files (if available) for complete configuration requirements.

## Development

### Start Development Servers

Run both client and server simultaneously:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:client      # Start Next.js dev server (port 3000)
npm run dev:server      # Start Node.js backend server
```

### Client Development

```bash
cd client
npm run dev
```

- Next.js development server runs on `http://localhost:3000`
- Hot module replacement enabled
- File polling enabled for Docker/WSL environments

### Server Development

```bash
cd server
npm run dev
```

- Requires compiled TypeScript via `ts-node`
- Check logs for active port information

## Available Scripts

### Root Level Commands

```bash
# Development
npm run dev              # Start both client and server
npm run dev:client       # Start only client
npm run dev:server       # Start only server

# Building
npm run build            # Build both client and server
npm run build:client     # Build only client
npm run build:server     # Build only server

# Starting
npm start                # Start both client and server (production)
npm run start:client     # Start only client
npm run start:server     # Start only server

# Linting
npm run lint             # Run linter on all packages
npm run lint:fix         # Fix linting issues
npm run lint:client      # Lint client only
npm run lint:server      # Lint server only

# Formatting
npm run prettier         # Format all packages
npm run prettier:check   # Check formatting
npm run prettier:fix     # Auto-fix formatting

# Type Checking
npm run typecheck        # Type check all packages
npm run typecheck:client # Type check client only
npm run typecheck:server # Type check server only

# Testing
npm run test:client      # Run client tests in watch mode
npm run test:client:run  # Run client tests once
npm run test:server      # Run server tests in watch mode
npm run test:server:run  # Run server tests once

# Cleanup
npm run clean            # Clean build outputs and node_modules
npm run clean:client     # Clean client only
npm run clean:server     # Clean server only

# Workers
npm run worker           # Run background workers
npm run worker:dev       # Run workers in development mode
```

### Client-Specific Commands

```bash
cd client
npm run dev              # Development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run typecheck        # Type check with tsc
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run prettier:fix     # Format code
```

### Server-Specific Commands

```bash
cd server
npm run dev              # Development mode with ts-node
npm run build            # Compile TypeScript
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run typecheck        # Type check with tsc
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run worker           # Run search indexing worker
npm run worker:dev       # Run workers in dev mode
```

## Key Features

### Authentication & Authorization
- JWT-based authentication with secure token handling
- Role-based access control
- Rate limiting middleware for API endpoints

### Real-time Updates
- WebSocket connections for live notifications and updates
- Room-based communication system
- Efficient message broadcasting

### Post Management
- Create, read, update, and delete posts
- Comment system with threading support
- Like/reaction system with scoring

### Search & Discovery
- Full-text search with Redis caching
- Search index building for fast queries
- Tag-based content discovery

### User Profiles
- User authentication and profile management
- User statistics and previews
- Follow/connection system (implied by profile routes)

### Notifications
- Real-time notification system
- Email notifications via Resend
- Notification preferences management

### Performance Optimization
- AWS S3 for file storage with presigned URLs
- Redis caching for search index and session data
- BullMQ for background job processing
- Image validation and optimization

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following the project's conventions
- Add tests for new functionality
- Keep commits atomic and descriptive

### 3. Verify Your Changes

```bash
npm run lint             # Check code style
npm run lint:fix         # Auto-fix style issues
npm run typecheck        # Ensure types are correct
npm run prettier:fix     # Format code
npm run test:client:run  # Test client changes
npm run test:server:run  # Test server changes
```

### 4. Commit and Push

```bash
git add .
git commit -m "feat: describe your changes"
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

Create a PR against the `main` branch with a clear description of your changes.

## Architecture Highlights

### API Structure
- RESTful API endpoints for CRUD operations
- Server-side validation with Zod schemas
- Consistent error handling middleware
- Rate limiting for security

### Database Schema
- PostgreSQL (via Neon) for relational data
- User, post, comment, notification, and tag tables
- Optimized indexes for common queries

### Caching Strategy
- Redis for session data
- Search index caching
- Real-time cache invalidation on data changes

### WebSocket Architecture
- Room-based communication
- Efficient message broadcasting
- User presence tracking (implied by room manager)

## Deployment

### Build for Production

```bash
npm run build
```

This creates optimized builds for both client and server.

### Environment Variables for Production

Ensure all required environment variables are set in your production environment before deployment.

### Vercel Deployment (Client)

The client includes `vercel.json` configuration for easy deployment to Vercel:

```bash
npm run build:client
vercel deploy
```

## Troubleshooting

### Port Already in Use
- Client defaults to port 3000, server to port 3001 (check configuration)
- Use environment variables to change ports if needed

### Redis Connection Issues
- Verify Redis is running and accessible
- Check `REDIS_URL` environment variable
- Ensure firewall rules allow connections

### Database Connection Issues
- Verify Neon PostgreSQL connection string in `DATABASE_URL`
- Check network connectivity to database host
- Review database credentials

### TypeScript Errors
- Run `npm run typecheck` to identify all type issues
- Ensure all type definitions are imported correctly
- Check for missing type annotations

## Code Quality

This project maintains high code quality standards:

- **ESLint**: Enforces consistent code style
- **Prettier**: Automatic code formatting
- **TypeScript**: Static type checking
- **Vitest**: Fast unit testing framework
- **Pre-commit Hooks**: (Configure git hooks to run tests/lint)

## Testing

```bash
# Run all tests
npm run test:client:run
npm run test:server:run

# Watch mode (for development)
npm run test:client
npm run test:server
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary. Unauthorized use, distribution, or modification is prohibited.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository or contact the development team.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Neon PostgreSQL](https://neon.tech)
- [Redis Documentation](https://redis.io/docs)
- [BullMQ Documentation](https://docs.bullmq.io)
- [Zod Validation](https://zod.dev)
