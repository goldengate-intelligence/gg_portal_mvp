# GoldenGate Platform - Deployment Guide

Complete guide for deploying the GoldenGate platform from development to production.

## 🎯 Overview

This guide covers deployment strategies for the GoldenGate platform, including local development, staging, and production environments.

## 🏗️ Architecture Options

### Deployment Architecture Overview
```mermaid
graph TB
    subgraph "Development"
        DevLocal[💻 Local Development<br/>Docker Compose<br/>Single Machine]
    end
    
    subgraph "Staging"
        StagingAWS[☁️ AWS Staging<br/>Single Instance<br/>Testing Environment]
    end
    
    subgraph "Production Options"
        ProdSimple[🎯 Simple Production<br/>Single EC2 + RDS<br/>Cost: ~$50-100/month]
        ProdScaled[📈 Scaled Production<br/>Load Balancer + Multiple Instances<br/>Cost: ~$200-500/month]
        ProdEnterprise[🏢 Enterprise<br/>ECS/EKS + Multi-AZ<br/>Cost: ~$1000+/month]
    end
    
    DevLocal --> StagingAWS
    StagingAWS --> ProdSimple
    ProdSimple --> ProdScaled
    ProdScaled --> ProdEnterprise
    
    classDef dev fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef staging fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    classDef prod fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    
    class DevLocal dev
    class StagingAWS staging
    class ProdSimple,ProdScaled,ProdEnterprise prod
```

## 🐳 Local Development Deployment

### Prerequisites
- [Docker](https://docker.com) and Docker Compose
- [Bun](https://bun.sh) runtime
- Git
- At least 8GB RAM and 20GB disk space

### Step-by-Step Local Setup

```mermaid
flowchart TD
    Start([🚀 Start Local Deployment]) --> Clone[📥 Clone Repository]
    
    Clone --> Install[📦 Install Dependencies<br/>bun install in both apps]
    
    Install --> EnvSetup[⚙️ Environment Setup<br/>Copy .env.example files]
    
    EnvSetup --> Docker[🐳 Start Docker Services<br/>./scripts/dev.sh setup]
    
    Docker --> Wait[⏳ Wait for Services<br/>PostgreSQL + Redis startup]
    
    Wait --> Migrate[🗄️ Run Migrations<br/>bun run db:migrate]
    
    Migrate --> Seed[🌱 Seed Data<br/>Optional test data]
    
    Seed --> StartAPI[🚀 Start API<br/>bun run dev in api/]
    
    Seed --> StartUI[🎨 Start UI<br/>bun run dev in ui/]
    
    StartAPI --> Ready[✅ Development Ready<br/>API: localhost:4001<br/>UI: localhost:3600]
    StartUI --> Ready
    
    classDef process fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    classDef success fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    
    class Start,Clone,Install,EnvSetup,Docker,Wait,Migrate,Seed,StartAPI,StartUI process
    class Ready success
```

### Local Development Commands

```bash
# Quick setup (from gg-mvp root)
cd apps
./scripts/dev.sh setup    # Sets up everything automatically

# Manual setup steps
cd apps
docker-compose up -d      # Start PostgreSQL + Redis
cd api
bun install
bun run db:migrate        # Run database migrations
bun run db:seed           # Optional: add test data
bun run dev               # Start API server

# In another terminal
cd apps/ui
bun install
bun run dev               # Start UI server
```

### Local Environment Configuration

Create `.env` files in both `apps/api/` and `apps/ui/`:

**apps/api/.env:**
```env
# Database
DATABASE_URL=postgresql://goldengate:password@localhost:5432/goldengate_dev
DATABASE_TEST_URL=postgresql://goldengate:password@localhost:5433/goldengate_test

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too

# OAuth
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret

# CORS
CORS_ORIGINS=http://localhost:3600,http://localhost:3000

# Environment
NODE_ENV=development
PORT=4001
```

**apps/ui/.env:**
```env
# API Configuration
VITE_API_URL=http://localhost:4001
VITE_API_VERSION=v1

# Environment
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

## ☁️ AWS Production Deployment

### Using gg-infra Repository

The GoldenGate platform deploys to AWS using the companion `gg-infra` repository:

```bash
# Clone both repositories
git clone <gg-mvp-repo>
git clone <gg-infra-repo>

# Directory structure should be:
# parent-folder/
#   ├── gg-mvp/     (application code)
#   └── gg-infra/   (infrastructure)
```

### Production Deployment Flow

```mermaid
sequenceDiagram
    participant Dev as 👨‍💻 Developer
    participant Code as 📁 gg-mvp
    participant Infra as 🏗️ gg-infra
    participant AWS as ☁️ AWS Cloud
    participant Users as 👥 End Users
    
    Dev->>Code: Build Docker Images
    Code->>Code: API + UI Containers
    
    Dev->>Infra: Configure terraform.tfvars
    Infra->>AWS: terraform apply
    AWS->>AWS: Create Infrastructure
    
    Note over AWS: EC2, RDS, ECR, ALB, etc.
    
    Dev->>AWS: Push Docker Images to ECR
    AWS->>AWS: Deploy to EC2 Instance
    
    AWS->>AWS: Configure Load Balancer
    AWS->>AWS: Set up SSL Certificate
    
    AWS-->>Users: https://app.your-domain.com
    
    Note over Dev,Users: Continuous Deployment via GitHub Actions
```

### Infrastructure Components Created

```mermaid
graph TB
    subgraph "Networking"
        VPC[🌐 VPC<br/>Virtual Private Cloud]
        PublicSubnet[🌍 Public Subnets<br/>2 Availability Zones]
        PrivateSubnet[🔒 Private Subnets<br/>Database Tier]
    end
    
    subgraph "Compute"
        ALB[⚖️ Application Load Balancer<br/>SSL Termination]
        EC2[🖥️ EC2 Instance<br/>t2.micro/t3.small]
        ASG[📈 Auto Scaling Group<br/>Future Scaling]
    end
    
    subgraph "Storage"
        RDS[🗄️ RDS PostgreSQL<br/>db.t3.micro]
        Redis[📦 ElastiCache Redis<br/>cache.t3.micro]
        ECR[📦 ECR Repository<br/>Docker Images]
    end
    
    subgraph "Security"
        ACM[🔒 SSL Certificate<br/>AWS Certificate Manager]
        Secrets[🔐 Secrets Manager<br/>Database Credentials]
        IAM[👮 IAM Roles<br/>Service Permissions]
    end
    
    ALB --> EC2
    EC2 --> RDS
    EC2 --> Redis
    EC2 --> ECR
    EC2 --> Secrets
    
    VPC --> PublicSubnet
    VPC --> PrivateSubnet
    PublicSubnet --> ALB
    PublicSubnet --> EC2
    PrivateSubnet --> RDS
    PrivateSubnet --> Redis
    
    ACM --> ALB
    IAM --> EC2
    
    classDef network fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef compute fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    classDef storage fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    classDef security fill:#F44336,stroke:#333,stroke-width:2px,color:#fff
    
    class VPC,PublicSubnet,PrivateSubnet network
    class ALB,EC2,ASG compute
    class RDS,Redis,ECR storage
    class ACM,Secrets,IAM security
```

### Production Deployment Steps

1. **Prepare Infrastructure** (using gg-infra)
   ```bash
   cd gg-infra/terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your configuration
   terraform apply
   ```

2. **Build and Deploy Application**
   ```bash
   cd gg-mvp/apps
   # Use deployment script from gg-infra
   ../scripts/deploy.sh --full
   ```

3. **Configure DNS** (if using custom domain)
   ```bash
   # Add CNAME records as shown in terraform output
   # app.your-domain.com -> ALB DNS name
   ```

### Production Environment Variables

**Production API Environment:**
```env
# Database (from AWS Secrets Manager)
DATABASE_URL=${DATABASE_URL}  # Retrieved from Secrets Manager

# Redis (AWS ElastiCache)
REDIS_URL=${REDIS_URL}  # ElastiCache endpoint

# JWT (Strong production secrets)
JWT_SECRET=${JWT_SECRET}  # 64+ character secret
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}

# OAuth Production Settings
OAUTH_CLIENT_ID=${OAUTH_CLIENT_ID}
OAUTH_CLIENT_SECRET=${OAUTH_CLIENT_SECRET}

# CORS (Production domains)
CORS_ORIGINS=https://app.your-domain.com

# Environment
NODE_ENV=production
PORT=4001

# Snowflake (if enabled)
SNOWFLAKE_ACCOUNT=${SNOWFLAKE_ACCOUNT}
SNOWFLAKE_USERNAME=${SNOWFLAKE_USERNAME}
SNOWFLAKE_PASSWORD=${SNOWFLAKE_PASSWORD}

# Logging
LOG_LEVEL=info
```

## 🔄 CI/CD Pipeline

### GitHub Actions Deployment

```mermaid
graph LR
    subgraph "Trigger"
        Push[📤 Git Push<br/>main branch]
        PR[🔄 Pull Request<br/>staging branch]
    end
    
    subgraph "CI Pipeline"
        Lint[✅ Code Quality<br/>Biome + TypeScript]
        Test[🧪 Run Tests<br/>Unit + Integration]
        Build[🔨 Build Images<br/>API + UI Docker]
    end
    
    subgraph "CD Pipeline"
        Push_ECR[📦 Push to ECR<br/>Container Registry]
        Deploy_Staging[🎭 Deploy Staging<br/>Auto Deploy]
        Deploy_Prod[🚀 Deploy Production<br/>Manual Approval]
    end
    
    subgraph "Monitoring"
        Health[❤️ Health Checks<br/>Service Monitoring]
        Rollback[↩️ Auto Rollback<br/>On Failure]
        Notify[📧 Notifications<br/>Slack/Email]
    end
    
    Push --> Lint
    PR --> Lint
    
    Lint --> Test
    Test --> Build
    Build --> Push_ECR
    
    Push_ECR --> Deploy_Staging
    Deploy_Staging --> Deploy_Prod
    
    Deploy_Prod --> Health
    Health --> Rollback
    Health --> Notify
    
    classDef trigger fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef ci fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    classDef cd fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    classDef monitor fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff
    
    class Push,PR trigger
    class Lint,Test,Build ci
    class Push_ECR,Deploy_Staging,Deploy_Prod cd
    class Health,Rollback,Notify monitor
```

### Sample GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy GoldenGate Platform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install dependencies
        run: |
          cd apps/api && bun install
          cd ../ui && bun install
          
      - name: Run tests
        run: |
          cd apps/api && bun test
          cd ../ui && bun test
          
      - name: Type check
        run: |
          cd apps/api && bun run type-check
          cd ../ui && bun run type-check

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Build and push Docker images
        run: |
          # Get ECR login token
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          
          # Build and push API
          cd apps
          docker build -f docker/Dockerfile.api -t ${{ secrets.ECR_REGISTRY }}/goldengate-api:latest .
          docker push ${{ secrets.ECR_REGISTRY }}/goldengate-api:latest
          
          # Build and push UI
          docker build -f docker/Dockerfile.ui -t ${{ secrets.ECR_REGISTRY }}/goldengate-ui:latest .
          docker push ${{ secrets.ECR_REGISTRY }}/goldengate-ui:latest
          
      - name: Deploy to EC2
        run: |
          # SSH to EC2 and update containers
          echo "${{ secrets.EC2_PRIVATE_KEY }}" > private_key.pem
          chmod 600 private_key.pem
          
          ssh -i private_key.pem -o StrictHostKeyChecking=no ec2-user@${{ secrets.EC2_HOST }} '
            cd /opt/goldengate
            ./update.sh
          '
```

## 🐳 Docker Configuration

### Production Dockerfile for API

**docker/Dockerfile.api:**
```dockerfile
FROM oven/bun:alpine

WORKDIR /app

# Copy package files
COPY api/package.json api/bun.lock ./
RUN bun install --production

# Copy source code
COPY api/src ./src
COPY api/drizzle ./drizzle

# Build application
RUN bun build src/index.ts --outdir ./dist --target bun

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1

# Start application
CMD ["bun", "dist/index.js"]
```

### Production Dockerfile for UI

**docker/Dockerfile.ui:**
```dockerfile
# Build stage
FROM oven/bun:alpine as builder

WORKDIR /app

# Copy package files
COPY ui/package.json ui/bun.lock ./
RUN bun install

# Copy source code
COPY ui ./
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 3600

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3600/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

## 📊 Production Monitoring

### Health Check Endpoints

The platform includes comprehensive health monitoring:

```mermaid
graph TB
    subgraph "Health Checks"
        API_Health[🚀 API Health<br/>GET /health]
        DB_Health[🗄️ Database Health<br/>Connection Test]
        Redis_Health[📦 Redis Health<br/>Ping Test]
        External_Health[🌐 External APIs<br/>SAM.gov, FPDS]
    end
    
    subgraph "Metrics Collection"
        Prometheus[📊 Prometheus<br/>Metrics Scraping]
        CloudWatch[☁️ CloudWatch<br/>AWS Metrics]
        Custom[📈 Custom Metrics<br/>Business KPIs]
    end
    
    subgraph "Alerting"
        PagerDuty[📟 PagerDuty<br/>Critical Alerts]
        Slack[💬 Slack<br/>Team Notifications]
        Email[📧 Email<br/>Admin Alerts]
    end
    
    API_Health --> Prometheus
    DB_Health --> CloudWatch
    Redis_Health --> CloudWatch
    External_Health --> Custom
    
    Prometheus --> PagerDuty
    CloudWatch --> Slack
    Custom --> Email
    
    classDef health fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef metrics fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    classDef alerts fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    
    class API_Health,DB_Health,Redis_Health,External_Health health
    class Prometheus,CloudWatch,Custom metrics
    class PagerDuty,Slack,Email alerts
```

### Health Check Implementation

**Health endpoint response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-09T10:30:00Z",
  "uptime": "72h 15m 30s",
  "version": "1.2.3",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": "12ms"
    },
    "redis": {
      "status": "healthy",
      "responseTime": "3ms"
    },
    "snowflake": {
      "status": "healthy",
      "responseTime": "45ms"
    }
  },
  "metrics": {
    "activeUsers": 156,
    "requestsPerMinute": 847,
    "errorRate": "0.02%",
    "cacheHitRate": "94.7%"
  }
}
```

## 🔧 Deployment Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues
```mermaid
flowchart TD
    DBError[🚨 Database Connection Error] --> CheckURL{Check DATABASE_URL?}
    
    CheckURL -->|Invalid| FixURL[🔧 Fix Connection String<br/>Check host, port, credentials]
    CheckURL -->|Valid| CheckSG{Security Group?}
    
    CheckSG -->|Blocked| OpenPorts[🔓 Open Database Ports<br/>PostgreSQL: 5432]
    CheckSG -->|Open| CheckRDS{RDS Status?}
    
    CheckRDS -->|Stopped| StartRDS[▶️ Start RDS Instance]
    CheckRDS -->|Running| CheckMigrations{Migrations Run?}
    
    CheckMigrations -->|No| RunMigrations[🗄️ bun run db:migrate]
    CheckMigrations -->|Yes| CheckLogs[📋 Check Application Logs]
    
    FixURL --> TestConnection[🧪 Test Connection]
    OpenPorts --> TestConnection
    StartRDS --> TestConnection
    RunMigrations --> TestConnection
    CheckLogs --> TestConnection
    
    classDef error fill:#F44336,stroke:#333,stroke-width:2px,color:#fff
    classDef fix fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef check fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    
    class DBError error
    class FixURL,OpenPorts,StartRDS,RunMigrations fix
    class CheckURL,CheckSG,CheckRDS,CheckMigrations,CheckLogs,TestConnection check
```

#### Container Deployment Issues
```bash
# Check container status
docker ps -a

# View container logs
docker logs goldengate-api
docker logs goldengate-ui

# Restart services
docker-compose down
docker-compose up -d

# Check resource usage
docker stats

# Clean up old images
docker system prune -f
```

#### SSL Certificate Issues
```bash
# Check certificate status (using gg-infra)
aws acm describe-certificate --certificate-arn <arn>

# Verify DNS records
dig app.your-domain.com
dig _validation-hash.app.your-domain.com CNAME

# Check ALB configuration
aws elbv2 describe-listeners --load-balancer-arn <arn>
```

## 📋 Production Checklist

### Pre-Deployment Checklist
- [ ] Environment variables configured and secured
- [ ] Database migrations tested
- [ ] SSL certificates valid and configured
- [ ] DNS records properly configured
- [ ] Health checks responding correctly
- [ ] Monitoring and alerting configured
- [ ] Backup procedures implemented
- [ ] Security groups configured (minimal access)
- [ ] IAM roles and permissions verified
- [ ] Load testing completed

### Post-Deployment Checklist
- [ ] Application accessible via HTTPS
- [ ] All health checks passing
- [ ] Database connections working
- [ ] Authentication working correctly
- [ ] API endpoints responding
- [ ] UI loading and functional
- [ ] Monitoring dashboards active
- [ ] Log aggregation working
- [ ] Backup jobs scheduled
- [ ] Performance metrics within expectations

## 🔄 Rollback Procedures

### Automated Rollback
```mermaid
flowchart LR
    Deploy[🚀 New Deployment] --> Monitor[👁️ Health Monitor<br/>5 minute window]
    
    Monitor --> HealthCheck{Health OK?}
    
    HealthCheck -->|✅ Healthy| Success[✅ Deployment Success]
    HealthCheck -->|❌ Unhealthy| Rollback[↩️ Automatic Rollback]
    
    Rollback --> Previous[📦 Previous Container Images]
    Previous --> Restart[🔄 Restart Services]
    Restart --> Verify[✅ Verify Rollback]
    
    Verify --> Alert[🚨 Alert Team<br/>Rollback Completed]
    
    classDef deploy fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    classDef success fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef rollback fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    
    class Deploy,Monitor deploy
    class Success success
    class Rollback,Previous,Restart,Verify,Alert rollback
```

### Manual Rollback Commands
```bash
# Rollback to previous version
docker tag goldengate-api:previous goldengate-api:latest
docker tag goldengate-ui:previous goldengate-ui:latest

# Restart services
docker-compose down
docker-compose up -d

# Verify rollback
curl -f http://localhost:4001/health
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- **Daily**: Check health dashboards and error logs
- **Weekly**: Review performance metrics and capacity planning
- **Monthly**: Security updates and dependency upgrades
- **Quarterly**: Disaster recovery testing and backup verification

### Emergency Contacts
- **Application Issues**: Development team
- **Infrastructure Issues**: DevOps/Platform team
- **Security Issues**: Security team + management
- **Business Continuity**: Leadership team

---

**Need Help?** 
- Check the [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)
- Review [gg-infra documentation](../../gg-infra/docs/) for infrastructure issues
- Contact the development team for application-specific problems