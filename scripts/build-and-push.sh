#!/bin/bash
# Script to build and push Docker images to AWS ECR

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-340285142152}
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
API_REPO="gg-mvp-api"
UI_REPO="gg-mvp-ui"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not running"
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi
    
    print_status "Prerequisites check passed!"
}

# Login to ECR
ecr_login() {
    print_status "Logging into AWS ECR..."
    aws ecr get-login-password --region ${AWS_REGION} | \
        docker login --username AWS --password-stdin ${ECR_REGISTRY}
    
    if [ $? -ne 0 ]; then
        print_error "Failed to login to ECR"
        exit 1
    fi
    print_status "Successfully logged into ECR"
}

# Build and push API
build_api() {
    print_status "Building API Docker image..."
    cd apps/api
    
    docker build -t ${API_REPO}:latest .
    
    if [ $? -ne 0 ]; then
        print_error "Failed to build API image"
        exit 1
    fi
    
    docker tag ${API_REPO}:latest ${ECR_REGISTRY}/${API_REPO}:latest
    docker tag ${API_REPO}:latest ${ECR_REGISTRY}/${API_REPO}:$(git rev-parse --short HEAD)
    
    print_status "Pushing API image to ECR..."
    docker push ${ECR_REGISTRY}/${API_REPO}:latest
    docker push ${ECR_REGISTRY}/${API_REPO}:$(git rev-parse --short HEAD)
    
    if [ $? -ne 0 ]; then
        print_error "Failed to push API image"
        exit 1
    fi
    
    print_status "API image pushed successfully!"
    cd ../..
}

# Build and push UI
build_ui() {
    print_status "Building UI Docker image..."
    cd apps/ui
    
    docker build \
        --build-arg VITE_API_URL=/api/v1 \
        --build-arg VITE_APP_ENV=production \
        -t ${UI_REPO}:latest .
    
    if [ $? -ne 0 ]; then
        print_error "Failed to build UI image"
        exit 1
    fi
    
    docker tag ${UI_REPO}:latest ${ECR_REGISTRY}/${UI_REPO}:latest
    docker tag ${UI_REPO}:latest ${ECR_REGISTRY}/${UI_REPO}:$(git rev-parse --short HEAD)
    
    print_status "Pushing UI image to ECR..."
    docker push ${ECR_REGISTRY}/${UI_REPO}:latest
    docker push ${ECR_REGISTRY}/${UI_REPO}:$(git rev-parse --short HEAD)
    
    if [ $? -ne 0 ]; then
        print_error "Failed to push UI image"
        exit 1
    fi
    
    print_status "UI image pushed successfully!"
    cd ../..
}

# Clean up local images
cleanup() {
    print_status "Cleaning up local images..."
    docker image prune -f
}

# Main execution
main() {
    print_status "Starting build and push process..."
    
    check_prerequisites
    ecr_login
    
    # Parse arguments
    case "${1:-all}" in
        api)
            build_api
            ;;
        ui)
            build_ui
            ;;
        all|"")
            build_api
            build_ui
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Usage: $0 [api|ui|all]"
            exit 1
            ;;
    esac
    
    cleanup
    
    print_status "Build and push completed successfully!"
    echo ""
    echo "Images pushed:"
    echo "  API: ${ECR_REGISTRY}/${API_REPO}:latest"
    echo "  UI:  ${ECR_REGISTRY}/${UI_REPO}:latest"
    echo ""
    echo "To deploy to EC2, SSH into the instance and run:"
    echo "  cd /opt/goldengate && ./update.sh"
}

# Run main function
main "$@"