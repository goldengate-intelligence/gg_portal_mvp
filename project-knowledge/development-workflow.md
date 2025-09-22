# Development Workflow - GoldenGate Platform

## Development Environment Setup

### Prerequisites
- Bun (latest version)
- Docker and Docker Compose
- Node.js (for UI development)
- Git

### Local Development Commands

#### API Development
```bash
cd apps/api
bun install                    # Install dependencies
bun run dev                    # Start development server (localhost:3001)
bun run db:migrate            # Run database migrations
bun run db:studio             # Open Drizzle Studio
bun run docker:up             # Start Docker services
bun run docker:down           # Stop Docker services
bun test                      # Run API tests
```

#### UI Development
```bash
cd apps/ui
bun install                    # Install dependencies
bun run dev                    # Start development server (localhost:3600)
bun run build                  # Build for production
bun run lint                   # Run linter
bun run test                   # Run UI tests
```

#### Database Setup
```bash
./scripts/dev.sh setup         # Sets up Docker containers and database
```

## Code Quality Standards

### Component Development Guidelines
1. **Follow Modular Design System**: All new components must use HudCard patterns
2. **Consistent Styling**: Apply CONTRACTOR_DETAIL_COLORS and unified typography
3. **TypeScript**: Full type safety required for all components
4. **Testing**: Unit tests required for all business logic

### Refactoring Checklist
1. **Import Updates**:
   ```tsx
   // Replace old Card imports
   import { HudCard } from '../ui/hud-card';
   import { CONTRACTOR_DETAIL_COLORS, cn } from '../../lib/utils';
   ```

2. **Component Structure**: Convert Card components to HudCard pattern
3. **Input Styling**: Apply consistent `bg-black/20 border-gray-700/50` styling
4. **Status Indicators**: Add tracking indicators to primary components

### Testing Workflow
1. **Import Validation**: Ensure all HudCard imports are correct
2. **Build Verification**: Run `npm run build` to check for errors
3. **Visual Testing**: Verify consistent styling and spacing
4. **Functional Testing**: Ensure all interactive elements work

## Security Guidelines

### Authentication & Authorization
- **Never expose credentials**: Use environment variables for all secrets
- **OAuth 2.0 compliance**: Follow established authentication flows
- **RBAC enforcement**: Implement proper role-based access controls
- **Tenant isolation**: Ensure row-level security in all database operations

### Code Security
- **Input validation**: Sanitize all user inputs
- **SQL injection prevention**: Use parameterized queries with Drizzle ORM
- **XSS protection**: Proper input encoding and CSP headers
- **Dependency management**: Regular security audits of npm packages

## Database Management

### Migration Strategy
- **Version Control**: All schema changes must be in migrations
- **Backward Compatibility**: Ensure migrations don't break existing functionality
- **Testing**: Test migrations on development environment first
- **Rollback Plan**: Always have rollback strategy for database changes

### Data Management
- **Sample Data**: Use provided sample_data for development
- **Backup Strategy**: Regular backups for production environments
- **Performance**: Monitor query performance and optimize as needed

## Deployment Process

### Environment Configuration
- **Development**: Local Docker containers
- **Staging**: Mirror production environment
- **Production**: Enterprise-grade security and monitoring

### Build Process
```bash
# API Production Build
cd apps/api
bun run build

# UI Production Build
cd apps/ui
bun run build
```

### Environment Variables
- **API**: Create `.env` in `apps/api` (see `.env.example`)
- **UI**: Create `.env` in `apps/ui` (see `.env.example`)
- **Secrets Management**: Use secure secret management for production

## Monitoring & Performance

### Performance Metrics
- **Bundle Size**: Monitor and optimize frontend bundle size
- **API Response Times**: Track API endpoint performance
- **Database Queries**: Monitor query execution times
- **User Experience**: Track page load times and user interactions

### Code Quality Metrics
- **Code Reduction**: Target 30-40% reduction through modular refactoring
- **Test Coverage**: Maintain high test coverage for critical paths
- **Type Safety**: 100% TypeScript coverage for new code
- **Lint Compliance**: Zero linting errors in production builds

## Agent Development

### MCP Integration
- **Model Context Protocol**: Follow MCP standards for agent communication
- **Agent Taskflow**: Implement ATF patterns for workflow orchestration
- **Multi-agent Coordination**: Design for agent collaboration and orchestration

### Agent Testing
- **Unit Tests**: Test individual agent functions
- **Integration Tests**: Test agent interactions with platform
- **Performance Tests**: Test agent response times and resource usage

## Documentation Standards

### Code Documentation
- **JSDoc Comments**: Document all public APIs and complex functions
- **Component Documentation**: Document props, usage patterns, and examples
- **Architecture Documentation**: Keep architecture diagrams and decisions updated

### API Documentation
- **OpenAPI Specification**: Maintain up-to-date API documentation
- **Interactive Docs**: Available at `http://localhost:3001/docs`
- **Examples**: Provide real-world usage examples

## Collaboration Workflow

### Git Workflow
- **Feature Branches**: Use feature branches for all development
- **Pull Requests**: Require PR reviews for all changes
- **Commit Messages**: Use conventional commit format
- **Branch Protection**: Protect main branch with required checks

### Code Review Guidelines
- **Design Consistency**: Ensure adherence to design system
- **Performance Impact**: Review for performance implications
- **Security Review**: Check for security vulnerabilities
- **Test Coverage**: Ensure adequate test coverage

## Troubleshooting

### Common Issues
- **Port Conflicts**: API (3001), UI (3600) - check for conflicts
- **Docker Issues**: Restart Docker services if database connection fails
- **Build Errors**: Check TypeScript compilation and lint errors
- **Missing Dependencies**: Run `bun install` in affected directories

### Debug Tools
- **Drizzle Studio**: Database inspection and queries
- **React DevTools**: Component debugging and performance profiling
- **Network Inspector**: API request debugging
- **Console Logs**: Strategic logging for development debugging