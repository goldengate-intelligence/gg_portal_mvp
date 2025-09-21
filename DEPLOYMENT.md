# GoldenGate MVP - Deployment Guide

This guide covers building, pushing, and deploying the GoldenGate MVP application to AWS.

## Prerequisites

- Docker installed and running locally
- AWS CLI configured with appropriate credentials
- Access to AWS ECR repositories
- SSH access to EC2 instance (for manual deployment)

## Docker Images

### API Image
- **Base**: `oven/bun:1-alpine`
- **Port**: 4001
- **Dockerfile**: `apps/api/Dockerfile`

### UI Image
- **Base**: `nginx:alpine`
- **Port**: 80
- **Dockerfile**: `apps/ui/Dockerfile`

## Building Images Locally

### Build Both Images
```bash
# Using docker-compose
docker-compose -f docker-compose.prod.yml build

# Or individually
docker build -t gg-mvp-api:latest ./apps/api
docker build -t gg-mvp-ui:latest ./apps/ui
```

### Test Locally
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up

# Access at:
# - UI: http://localhost:3000
# - API: http://localhost:4001
# - Combined (via nginx): http://localhost
```

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

#### Setup
1. Add AWS credentials to GitHub Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

2. Push to main branch to trigger deployment:
```bash
git push origin main
```

#### Manual Trigger
1. Go to GitHub Actions tab
2. Select "Build and Deploy to AWS ECR"
3. Click "Run workflow"
4. Select environment

### Method 2: Manual Build and Push

#### Using the Build Script
```bash
# Build and push all images
./scripts/build-and-push.sh

# Build specific image
./scripts/build-and-push.sh api
./scripts/build-and-push.sh ui
```

#### Manual Commands
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 340285142152.dkr.ecr.us-east-1.amazonaws.com

# Build and tag API
cd apps/api
docker build -t gg-mvp-api:latest .
docker tag gg-mvp-api:latest 340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-api:latest
docker push 340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-api:latest

# Build and tag UI
cd ../ui
docker build -t gg-mvp-ui:latest .
docker tag gg-mvp-ui:latest 340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-ui:latest
docker push 340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-ui:latest
```

### Method 3: Deploy to EC2

#### SSH and Update
```bash
# SSH into EC2
ssh -i gg-infra/terraform/gg-mvp-key.pem ec2-user@34.231.242.151

# On the EC2 instance
cd /opt/goldengate

# Pull latest images
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 340285142152.dkr.ecr.us-east-1.amazonaws.com

docker pull 340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-api:latest
docker pull 340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-ui:latest

# Restart services
docker-compose down
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

## Environment Variables

### API Environment Variables
```env
NODE_ENV=production
PORT=4001
DATABASE_HOST=<RDS_ENDPOINT>
DATABASE_PORT=5432
DATABASE_NAME=goldengate
DATABASE_USER=postgres
DATABASE_PASSWORD=<FROM_SECRETS_MANAGER>
JWT_SECRET=<FROM_SECRETS_MANAGER>
REDIS_URL=redis://redis:6379
CORS_ALLOWED_ORIGINS=http://your-domain.com
```

### UI Build Arguments
```dockerfile
ARG VITE_API_URL=/api
ARG VITE_APP_ENV=production
```

## CI/CD Workflows

### Continuous Integration (`ci.yml`)
- Runs on every PR
- Tests both API and UI
- Type checking and linting
- Docker build validation

### Deployment (`deploy.yml`)
- Triggered on push to main
- Builds and pushes to ECR
- Optional auto-deploy to EC2
- Health checks

## Monitoring Deployment

### Check Application Health
```bash
# From local machine
curl http://34.231.242.151/health

# API health
curl http://34.231.242.151/api/health
```

### View Logs
```bash
# On EC2 instance
docker-compose logs -f api
docker-compose logs -f ui
docker-compose logs -f nginx

# CloudWatch logs
aws logs tail /aws/ec2/gg-mvp --follow
```

### Check ECR Images
```bash
# List images in repository
aws ecr describe-images --repository-name gg-mvp-api --region us-east-1
aws ecr describe-images --repository-name gg-mvp-ui --region us-east-1
```

## Rollback Procedure

### Using Previous Image Tags
```bash
# On EC2 instance
docker-compose down

# Pull specific version
docker pull 340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-api:<GIT_SHA>
docker pull 340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-ui:<GIT_SHA>

# Tag as latest
docker tag 340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-api:<GIT_SHA> \
  340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-api:latest

docker tag 340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-ui:<GIT_SHA> \
  340285142152.dkr.ecr.us-east-1.amazonaws.com/gg-mvp-ui:latest

# Restart
docker-compose up -d
```

## Troubleshooting

### Docker Build Fails
- Check Docker is running: `docker info`
- Clear Docker cache: `docker system prune -a`
- Check Dockerfile syntax
- Verify all files are present

### ECR Push Fails
- Check AWS credentials: `aws sts get-caller-identity`
- Verify ECR login: `aws ecr get-login-password`
- Check repository exists: `aws ecr describe-repositories`

### Application Not Starting
- Check logs: `docker-compose logs`
- Verify environment variables
- Check database connectivity
- Ensure ports are not in use

### GitHub Actions Fails
- Check secrets are configured
- Review workflow logs
- Verify branch protections
- Check IAM permissions

## Security Best Practices

1. **Never commit secrets** - Use AWS Secrets Manager
2. **Rotate credentials** regularly
3. **Use specific image tags** for production
4. **Enable ECR scanning** for vulnerabilities
5. **Restrict SSH access** to specific IPs
6. **Use HTTPS** in production
7. **Regular updates** of base images

## Performance Optimization

1. **Multi-stage builds** reduce image size
2. **Layer caching** speeds up builds
3. **Use Alpine images** when possible
4. **Optimize Dockerfile order** for better caching
5. **Prune unused images** regularly

## Cost Optimization

1. **ECR Lifecycle policies** to remove old images
2. **Use spot instances** for dev/staging
3. **Stop instances** when not in use
4. **Monitor data transfer** costs
5. **Use CloudWatch** for monitoring

## Next Steps

1. Set up domain name and SSL certificate
2. Configure CloudFront CDN
3. Set up monitoring and alerting
4. Implement blue-green deployments
5. Add database migrations to CI/CD
6. Set up backup and disaster recovery

## Support

For issues or questions:
- Check logs first
- Review AWS CloudWatch
- Check GitHub Actions history
- Review this documentation

---

Last updated: 2025-08-09