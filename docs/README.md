# EVAL Gaming - Complete Documentation Index

Welcome to the comprehensive documentation for the EVAL Gaming platform. This documentation covers all public APIs, functions, components, and utilities available in the system.

## 📖 Documentation Overview

This documentation is organized into several focused sections, each providing detailed information about different aspects of the platform:

### 🚀 [API Documentation](./api-documentation.md)

Complete reference for all public APIs, including tRPC routers, REST endpoints, and database schemas.

**What's Included:**

- Authentication & Authorization system
- tRPC API Reference with all routers and procedures
- REST API endpoints and webhooks
- Database schema and relationships
- Type definitions and validation schemas
- Comprehensive examples and usage patterns
- Error handling best practices
- Performance optimization guidelines

**Key Sections:**

- Player Profile Management
- Coach Profile & Onboarding
- Tryout Creation & Registration
- Messaging System
- Player Search & Discovery
- School & League Management
- Admin Functions

### 🧩 [Components Documentation](./components-documentation.md)

Detailed guide to all React components, from basic UI elements to complex application-specific components.

**What's Included:**

- shadcn/ui component library
- Form components and validation
- Layout and navigation components
- Data display and feedback components
- Game-specific components
- Custom components and patterns
- Styling guidelines and best practices
- Accessibility considerations

**Key Sections:**

- Button, Card, Dialog, Toast components
- Form inputs, selects, and validation
- Tables, data displays, and navigation
- VALORANT and game-specific components
- Component composition patterns
- Responsive design guidelines

### 🛠️ [Utilities and Hooks Documentation](./utilities-and-hooks-documentation.md)

Comprehensive reference for all utility functions, custom hooks, and helper libraries.

**What's Included:**

- Custom React hooks (useToast, useMobile, etc.)
- Database utilities and retry logic
- Time formatting and manipulation
- Permission and role management
- Metadata generation for SEO
- Admin utilities and access control
- Discord logging and monitoring
- Validation and error handling

**Key Sections:**

- Custom hooks for UI interactions
- Database operation helpers
- Time and date utilities
- Permission checking system
- Error handling and logging
- Validation functions

## 🏗️ Architecture Overview

### Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: tRPC, Prisma ORM, PostgreSQL
- **Authentication**: Clerk with role-based access
- **UI Framework**: Tailwind CSS, Radix UI, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Deployment**: Vercel with environment management

### Key Design Principles

1. **Type Safety**: End-to-end type safety with TypeScript and tRPC
2. **Modularity**: Composable components and reusable utilities
3. **Performance**: Optimized queries, caching, and lazy loading
4. **Accessibility**: WCAG compliant components and patterns
5. **Developer Experience**: Comprehensive tooling and documentation
6. **Error Resilience**: Robust error handling and retry mechanisms

## 🚀 Quick Start Guide

### For Developers

1. **Setting Up the Development Environment**

   ```bash
   git clone <repository-url>
   cd eval-next
   npm install --force
   cp .env.example .env
   # Configure environment variables
   npm run db:generate
   npm run db:migrate
   npm run dev
   ```

2. **Understanding the Project Structure**

   ```
   src/
   ├── app/                    # Next.js App Router pages
   ├── components/            # Reusable UI components
   ├── hooks/                 # Custom React hooks
   ├── lib/                   # Utility functions
   ├── server/                # Backend logic and tRPC routers
   ├── trpc/                  # tRPC client configuration
   └── types/                 # TypeScript type definitions
   ```

3. **Key Development Commands**
   ```bash
   npm run dev              # Start development server
   npm run build            # Build for production
   npm run lint             # Run ESLint
   npm run typecheck        # TypeScript checking
   npm run db:studio        # Open Prisma Studio
   ```

### For API Integration

1. **Using tRPC APIs**

   ```typescript
   import { api } from "@/trpc/react";

   // Query example
   const { data: profile } = api.playerProfile.getProfile.useQuery();

   // Mutation example
   const updateProfile = api.playerProfile.updateProfile.useMutation({
     onSuccess: () => {
       toast({ title: "Profile updated successfully" });
     },
   });
   ```

2. **Authentication Integration**

   ```typescript
   import { getUserRole, canAccessCoachFeatures } from "@/lib/permissions";

   const role = getUserRole(user);
   const canAccess = canAccessCoachFeatures(user);
   ```

3. **Component Usage**

   ```typescript
   import { Button } from "@/components/ui/button";
   import { useToast } from "@/hooks/use-toast";

   function MyComponent() {
     const { toast } = useToast();

     return (
       <Button onClick={() => toast({ title: "Hello!" })}>
         Click me
       </Button>
     );
   }
   ```

## 📊 Features by User Role

### For Players

- **Profile Management**: Complete gaming profiles with platform connections
- **Tryout Registration**: Browse and register for college tryouts
- **Performance Tracking**: EVAL scores and competitive analytics
- **Messaging**: Direct communication with coaches
- **League Participation**: Join competitive leagues and track rankings

### For Coaches

- **Player Discovery**: Advanced search and filtering tools
- **Tryout Management**: Create and manage recruitment events
- **Prospect Tracking**: Build and maintain recruit lists
- **Team Building**: Recruit across multiple games and skill levels
- **Analytics**: Access detailed player performance data

### For Administrators

- **User Management**: Manage player and coach accounts
- **School Associations**: Approve coach-school relationships
- **Content Moderation**: Monitor and moderate platform content
- **Analytics Dashboard**: Platform usage and performance metrics
- **System Configuration**: Manage games, schools, and leagues

## 🔍 Common Use Cases

### Player Profile Creation

```typescript
// Update player profile with gaming information
const updateProfile = api.playerProfile.updateProfile.useMutation();

await updateProfile.mutateAsync({
  bio: "Aspiring VALORANT professional",
  location: "Los Angeles, CA",
  gpa: 3.8,
  class_year: "2025",
  main_game_id: valorantGameId,
});

// Add platform connections
const updateConnection =
  api.playerProfile.updatePlatformConnection.useMutation();

await updateConnection.mutateAsync({
  platform: "valorant",
  username: "PlayerName#TAG",
});
```

### Tryout Management

```typescript
// Create a new tryout
const createTryout = api.tryouts.create.useMutation();

await createTryout.mutateAsync({
  title: "VALORANT Team Tryouts",
  description: "Open tryouts for our varsity team",
  game_id: valorantGameId,
  date: new Date("2024-02-15"),
  location: "Campus Gaming Center",
  type: "IN_PERSON",
  max_spots: 20,
  class_years: ["2024", "2025", "2026"],
});

// Register for a tryout
const register = api.tryouts.register.useMutation();

await register.mutateAsync({
  tryout_id: tryoutId,
  notes: "I main Duelist and have competitive experience",
});
```

### Player Search and Discovery

```typescript
// Advanced player search for coaches
const { data: searchResults } = api.playerSearch.search.useQuery({
  game_id: valorantGameId,
  state: "California",
  class_years: ["2024", "2025"],
  min_gpa: 3.0,
  roles: ["duelist", "controller"],
  sort_by: "eval_score",
  sort_order: "desc",
});
```

## 🔧 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use the `cn()` utility for className management
- Prefer composition over inheritance for components

### API Development

- Use tRPC for type-safe APIs
- Implement proper error handling with TRPCError
- Use database retry logic with `withRetry()`
- Add input validation with Zod schemas

### Component Development

- Build accessible components with proper ARIA attributes
- Support both controlled and uncontrolled usage
- Use compound component patterns for complex UIs
- Implement proper loading and error states

### Testing

- Write unit tests for utility functions
- Test component accessibility with testing-library
- Mock tRPC calls in component tests
- Use Prisma test database for integration tests

## 📈 Performance Considerations

### Frontend Optimization

- Use React.lazy for code splitting
- Implement proper memoization with React.memo
- Optimize images with Next.js Image component
- Use TanStack Query for efficient data fetching

### Backend Optimization

- Use database indexes for frequently queried fields
- Implement caching for public data
- Use connection pooling for database connections
- Monitor API performance with analytics

### Database Performance

- Use selective field loading (e.g., `getBasicProfile`)
- Implement pagination for large datasets
- Use database-level constraints and validation
- Monitor query performance with Prisma metrics

## 🛡️ Security Best Practices

### Authentication

- Use Clerk for secure authentication
- Implement role-based access control
- Validate user permissions on every request
- Use server-side validation for all inputs

### Data Protection

- Sanitize all user inputs
- Use parameterized queries (Prisma handles this)
- Implement rate limiting for API endpoints
- Log security events to Discord

### Environment Security

- Use environment variables for secrets
- Implement proper CORS policies
- Use HTTPS in production
- Regular security audits and updates

## 📞 Support and Contributing

### Getting Help

- Review this documentation for comprehensive guides
- Check the inline code comments for specific implementations
- Contact the development team for platform-specific questions
- Open issues for bug reports or feature requests

### Contributing

1. Fork the repository
2. Create a feature branch with descriptive naming
3. Follow the established code style and patterns
4. Add tests for new functionality
5. Update documentation as needed
6. Submit a pull request with detailed description

### Reporting Issues

- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include environment information
- Add screenshots or logs when relevant

## 📚 Additional Resources

### External Documentation

- [Next.js App Router](https://nextjs.org/docs/app)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs)

### Design System

- [shadcn/ui Components](https://ui.shadcn.com/docs)
- [Tailwind Component Examples](https://tailwindui.com/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Development Tools

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

---

This documentation is maintained alongside the codebase and is updated with each release. For the most current information, always refer to the latest version of these docs and the inline code comments.

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Platform**: EVAL Gaming
