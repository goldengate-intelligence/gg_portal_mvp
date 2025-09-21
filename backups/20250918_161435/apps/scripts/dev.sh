#!/bin/bash

# Development helper script for GoldenGate API
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
}

# Start services
start_services() {
    log_info "Starting Docker services..."
    check_docker
    docker-compose up -d
    
    log_info "Waiting for services to be healthy..."
    docker-compose up -d --wait
    
    log_success "Services are running!"
    log_info "PostgreSQL: localhost:5432 (dev) / localhost:5433 (test)"
    log_info "Redis: localhost:6379"
    log_info "Adminer: http://localhost:8080"
}

# Stop services
stop_services() {
    log_info "Stopping Docker services..."
    docker-compose down
    log_success "Services stopped!"
}

# Reset services (stop, remove volumes, start)
reset_services() {
    log_warning "This will delete all data in the databases!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Resetting services..."
        docker-compose down -v
        docker-compose up -d --wait
        log_success "Services reset and restarted!"
    else
        log_info "Reset cancelled."
    fi
}

# Show service logs
show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        docker-compose logs -f "$service"
    else
        docker-compose logs -f
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    cd api
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Copying from .env.example"
        cp .env.example .env
    fi
    
    # Generate and run migrations
    bun run drizzle-kit generate
    bun run src/db/migrate.ts
    
    log_success "Migrations completed!"
    cd ..
}

# Setup development environment
setup_dev() {
    log_info "Setting up development environment..."
    
    # Start services
    start_services
    
    # Wait a moment for services to fully initialize
    sleep 5
    
    # Run migrations
    run_migrations
    
    log_success "Development environment ready!"
    log_info "You can now start the API server with: cd api && bun run dev"
}

# Check service health
health_check() {
    log_info "Checking service health..."
    
    # Check PostgreSQL
    if docker-compose exec postgres pg_isready -U postgres -d goldengate >/dev/null 2>&1; then
        log_success "PostgreSQL (dev) is healthy"
    else
        log_error "PostgreSQL (dev) is not responding"
    fi
    
    if docker-compose exec postgres-test pg_isready -U postgres -d goldengate_test >/dev/null 2>&1; then
        log_success "PostgreSQL (test) is healthy"
    else
        log_error "PostgreSQL (test) is not responding"
    fi
    
    # Check Redis
    if docker-compose exec redis redis-cli ping >/dev/null 2>&1; then
        log_success "Redis is healthy"
    else
        log_error "Redis is not responding"
    fi
}

# Database shell
db_shell() {
    local db_type=${1:-"dev"}
    if [ "$db_type" = "test" ]; then
        log_info "Connecting to test database..."
        docker-compose exec postgres-test psql -U postgres -d goldengate_test
    else
        log_info "Connecting to development database..."
        docker-compose exec postgres psql -U postgres -d goldengate
    fi
}

# Show help
show_help() {
    echo "GoldenGate API Development Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start       Start Docker services"
    echo "  stop        Stop Docker services"
    echo "  restart     Restart Docker services"
    echo "  reset       Reset services (removes all data)"
    echo "  logs        Show service logs (optional: specify service name)"
    echo "  migrate     Run database migrations"
    echo "  setup       Full development environment setup"
    echo "  health      Check service health"
    echo "  db          Open database shell (dev/test)"
    echo "  help        Show this help message"
    echo
    echo "Examples:"
    echo "  $0 setup                 # Full setup"
    echo "  $0 logs postgres         # Show PostgreSQL logs"
    echo "  $0 db test              # Connect to test database"
}

# Main script logic
case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        start_services
        ;;
    reset)
        reset_services
        ;;
    logs)
        show_logs "$2"
        ;;
    migrate)
        run_migrations
        ;;
    setup)
        setup_dev
        ;;
    health)
        health_check
        ;;
    db)
        db_shell "$2"
        ;;
    help)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac