# GoldenGate Platform - Integration Guide

Complete guide for integrating gg-mvp (application) with gg-infra (infrastructure) and external systems.

## 🎯 Overview

This guide covers how the GoldenGate application (gg-mvp) integrates with its AWS infrastructure (gg-infra) and external data sources to create a complete federal contractor intelligence platform.

## 🏗️ Full Stack Architecture

### Complete System Integration
```mermaid
graph TB
    subgraph "Infrastructure Layer (gg-infra)"
        ALB[⚖️ Application Load Balancer<br/>SSL Termination]
        EC2[🖥️ EC2 Instance<br/>Application Host]
        RDS[🗄️ RDS PostgreSQL<br/>Primary Database]
        Redis_Infra[📦 ElastiCache Redis<br/>Managed Cache]
        ECR[📦 ECR Repository<br/>Container Registry]
        Secrets[🔐 Secrets Manager<br/>Configuration]
    end
    
    subgraph "Application Layer (gg-mvp)"
        API[🚀 GoldenGate API<br/>Bun + Elysia]
        UI[🎨 React Frontend<br/>Vite + TypeScript]
        Workers[⚙️ Background Workers<br/>Data Processing]
        MCP[🤖 MCP Server<br/>AI Agents]
    end
    
    subgraph "Data Sources"
        SAM[🏛️ SAM.gov API<br/>Contractor Registry]
        FPDS[📋 FPDS Data<br/>Contract Awards]
        USA[💰 USASpending API<br/>Financial Data]
        Snowflake[❄️ Snowflake DW<br/>Analytics]
    end
    
    subgraph "Users"
        WebUsers[👤 Web Users<br/>Browser Access]
        APIUsers[🔧 API Users<br/>Third-party Apps]
        Agents[🤖 AI Agents<br/>Automated Tasks]
    end
    
    WebUsers --> ALB
    APIUsers --> ALB
    Agents --> ALB
    
    ALB --> EC2
    EC2 --> API
    EC2 --> UI
    EC2 --> Workers
    EC2 --> MCP
    
    API --> RDS
    API --> Redis_Infra
    API --> Snowflake
    Workers --> SAM
    Workers --> FPDS
    Workers --> USA
    
    ECR --> EC2
    Secrets --> EC2
    
    classDef infra fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    classDef app fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef data fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    classDef users fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff
    
    class ALB,EC2,RDS,Redis_Infra,ECR,Secrets infra
    class API,UI,Workers,MCP app
    class SAM,FPDS,USA,Snowflake data
    class WebUsers,APIUsers,Agents users
```

## 🔄 Repository Integration

### Directory Structure
```
parent-directory/
├── gg-mvp/                    # Application repository
│   ├── apps/
│   │   ├── api/              # Backend application
│   │   └── ui/               # Frontend application
│   └── docs/                 # Application documentation
└── gg-infra/                 # Infrastructure repository
    ├── terraform/            # Infrastructure as code
    ├── scripts/              # Deployment scripts
    └── docs/                 # Infrastructure documentation
```

### Integration Workflow
```mermaid
sequenceDiagram
    participant Dev as 👨‍💻 Developer
    participant MVP as 📁 gg-mvp
    participant Infra as 🏗️ gg-infra
    participant AWS as ☁️ AWS
    participant Users as 👥 Users
    
    Dev->>MVP: 1. Develop Application
    MVP->>MVP: Build & Test
    
    Dev->>Infra: 2. Configure Infrastructure
    Infra->>AWS: Deploy Infrastructure
    AWS->>AWS: Provision Resources
    
    Dev->>MVP: 3. Build Docker Images
    MVP->>AWS: Push to ECR
    
    Dev->>Infra: 4. Deploy Application
    Infra->>AWS: Update EC2 Instance
    AWS->>AWS: Pull & Run Containers
    
    AWS-->>Users: 5. Application Available
    
    Note over Dev,Users: Continuous Integration Flow
```

## 🐳 Container Integration

### Docker Image Build Process
```mermaid
graph LR
    subgraph "gg-mvp Build Process"
        Source[📁 Source Code<br/>API + UI]
        Build[🔨 Build Process<br/>Bun build]
        Test[🧪 Run Tests<br/>Unit + Integration]
        Images[📦 Docker Images<br/>API + UI containers]
    end
    
    subgraph "gg-infra Integration"
        ECR_Push[📤 Push to ECR<br/>Container registry]
        Deploy[🚀 Deploy Script<br/>Update EC2]
        Health[❤️ Health Checks<br/>Verify deployment]
    end
    
    Source --> Build
    Build --> Test
    Test --> Images
    Images --> ECR_Push
    ECR_Push --> Deploy
    Deploy --> Health
    
    classDef build fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef deploy fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    
    class Source,Build,Test,Images build
    class ECR_Push,Deploy,Health deploy
```

### Container Configuration

**gg-mvp Docker Compose (Development):**
```yaml
# apps/docker-compose.yml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    ports:
      - "4001:4001"
    environment:
      - DATABASE_URL=postgresql://goldengate:password@postgres:5432/goldengate_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  ui:
    build:
      context: .
      dockerfile: docker/Dockerfile.ui
    ports:
      - "3600:3600"
    environment:
      - VITE_API_URL=http://localhost:4001

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: goldengate_dev
      POSTGRES_USER: goldengate
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

**gg-infra Production Deployment:**
```yaml
# EC2 instance docker-compose.prod.yml
version: '3.8'
services:
  api:
    image: ${ECR_REGISTRY}/goldengate-api:${TAG}
    environment:
      - DATABASE_URL=${DATABASE_URL}  # From Secrets Manager
      - REDIS_URL=${REDIS_URL}        # ElastiCache endpoint
    ports:
      - "4001:4001"
    restart: unless-stopped

  ui:
    image: ${ECR_REGISTRY}/goldengate-ui:${TAG}
    ports:
      - "3600:3600"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
      - ui
    restart: unless-stopped
```

## 🔧 Configuration Integration

### Environment Variables Mapping

```mermaid
graph TB
    subgraph "Development (gg-mvp)"
        DevAPI[API .env<br/>Local Database<br/>Local Redis]
        DevUI[UI .env<br/>Local API URL]
        DevDocker[Docker Compose<br/>Local Services]
    end
    
    subgraph "Production (gg-infra)"
        TerraformVars[terraform.tfvars<br/>Infrastructure Config]
        SecretsManager[AWS Secrets<br/>Database credentials]
        EC2UserData[EC2 User Data<br/>Bootstrap script]
    end
    
    subgraph "Configuration Flow"
        DevAPI --> TerraformVars
        DevUI --> EC2UserData
        DevDocker --> SecretsManager
    end
    
    classDef dev fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef prod fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    
    class DevAPI,DevUI,DevDocker dev
    class TerraformVars,SecretsManager,EC2UserData prod
```

### Configuration Mapping Table

| Component | Development (gg-mvp) | Production (gg-infra) |
|-----------|---------------------|----------------------|
| **Database** | Local PostgreSQL<br/>`postgresql://localhost:5432` | RDS PostgreSQL<br/>`${DATABASE_URL}` from Secrets |
| **Cache** | Local Redis<br/>`redis://localhost:6379` | ElastiCache Redis<br/>`${REDIS_URL}` from Terraform |
| **API URL** | `http://localhost:4001` | `https://api.your-domain.com` |
| **Frontend** | `http://localhost:3600` | `https://app.your-domain.com` |
| **Secrets** | `.env` files | AWS Secrets Manager |
| **SSL** | Not required | ALB with ACM certificate |

## 📊 Data Flow Integration

### Complete Data Pipeline
```mermaid
graph LR
    subgraph "External Data Sources"
        SAM_API[🏛️ SAM.gov API<br/>Entity registrations]
        FPDS_API[📋 FPDS API<br/>Contract awards]
        USA_API[💰 USASpending API<br/>Financial data]
    end
    
    subgraph "gg-mvp Data Processing"
        Workers[⚙️ Background Workers<br/>Data ingestion]
        ETL[🔄 ETL Pipeline<br/>Transform & validate]
        API_Layer[🚀 API Layer<br/>Business logic]
    end
    
    subgraph "gg-infra Data Storage"
        RDS_Primary[🗄️ RDS Primary<br/>Transactional data]
        ElastiCache[📦 ElastiCache<br/>Hot cache]
        Snowflake_DW[❄️ Snowflake<br/>Analytics warehouse]
    end
    
    subgraph "Data Consumers"
        React_UI[🎨 React UI<br/>Interactive dashboards]
        API_Clients[🔧 API Clients<br/>Third-party apps]
        AI_Agents[🤖 AI Agents<br/>Automated analysis]
    end
    
    SAM_API --> Workers
    FPDS_API --> Workers
    USA_API --> Workers
    
    Workers --> ETL
    ETL --> RDS_Primary
    ETL --> Snowflake_DW
    
    API_Layer --> RDS_Primary
    API_Layer --> ElastiCache
    API_Layer --> Snowflake_DW
    
    React_UI --> API_Layer
    API_Clients --> API_Layer
    AI_Agents --> API_Layer
    
    classDef external fill:#F44336,stroke:#333,stroke-width:2px,color:#fff
    classDef processing fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef storage fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    classDef consumers fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff
    
    class SAM_API,FPDS_API,USA_API external
    class Workers,ETL,API_Layer processing
    class RDS_Primary,ElastiCache,Snowflake_DW storage
    class React_UI,API_Clients,AI_Agents consumers
```

## 🚀 Deployment Integration

### End-to-End Deployment Process

```mermaid
flowchart TD
    Start([🚀 Deployment Start]) --> InfraCheck{Infrastructure<br/>Deployed?}
    
    InfraCheck -->|No| DeployInfra[🏗️ Deploy Infrastructure<br/>gg-infra/terraform apply]
    InfraCheck -->|Yes| BuildApp[🔨 Build Application<br/>gg-mvp docker build]
    
    DeployInfra --> BuildApp
    
    BuildApp --> PushImages[📤 Push to ECR<br/>Docker images]
    
    PushImages --> UpdateApp[🔄 Update Application<br/>gg-infra deployment script]
    
    UpdateApp --> HealthCheck[❤️ Health Checks<br/>Verify deployment]
    
    HealthCheck --> Success{Deployment<br/>Successful?}
    
    Success -->|Yes| Complete[✅ Deployment Complete<br/>Update DNS if needed]
    Success -->|No| Rollback[↩️ Rollback<br/>Previous version]
    
    Rollback --> Investigate[🔍 Investigate Issues]
    
    classDef start fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef process fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    classDef decision fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    classDef error fill:#F44336,stroke:#333,stroke-width:2px,color:#fff
    
    class Start,Complete start
    class DeployInfra,BuildApp,PushImages,UpdateApp,HealthCheck process
    class InfraCheck,Success decision
    class Rollback,Investigate error
```

### Deployment Commands

**1. Infrastructure Setup (gg-infra):**
```bash
cd gg-infra/terraform-bootstrap
./bootstrap.sh apply

cd ../terraform
cp terraform.tfvars.example terraform.tfvars
# Edit configuration
terraform apply
```

**2. Application Build (gg-mvp):**
```bash
cd gg-mvp/apps

# Build Docker images
docker build -f docker/Dockerfile.api -t goldengate-api .
docker build -f docker/Dockerfile.ui -t goldengate-ui .

# Tag for ECR
docker tag goldengate-api:latest ${ECR_REGISTRY}/goldengate-api:latest
docker tag goldengate-ui:latest ${ECR_REGISTRY}/goldengate-ui:latest

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin ${ECR_REGISTRY}
docker push ${ECR_REGISTRY}/goldengate-api:latest
docker push ${ECR_REGISTRY}/goldengate-ui:latest
```

**3. Deployment Script (gg-infra):**
```bash
cd gg-infra/scripts
./deploy.sh --full  # Complete deployment
```

## 🔐 Security Integration

### Security Layer Integration
```mermaid
graph TB
    subgraph "Infrastructure Security (gg-infra)"
        ALB_SG[🛡️ ALB Security Group<br/>HTTPS 443, HTTP 80]
        EC2_SG[🛡️ EC2 Security Group<br/>HTTP from ALB only]
        RDS_SG[🛡️ RDS Security Group<br/>PostgreSQL from EC2]
        ACM_Cert[🔒 SSL Certificate<br/>AWS Certificate Manager]
    end
    
    subgraph "Application Security (gg-mvp)"
        JWT_Auth[🎫 JWT Authentication<br/>Token-based auth]
        RBAC[👮 Role-Based Access<br/>22+ policies]
        OAuth[🌐 OAuth 2.0 Server<br/>Third-party auth]
        DataEncrypt[🔐 Data Encryption<br/>At rest & in transit]
    end
    
    subgraph "Network Security"
        WAF[🛡️ Web Application Firewall<br/>Optional AWS WAF]
        VPC[🌐 VPC Isolation<br/>Private subnets]
        NACL[📋 Network ACLs<br/>Subnet-level rules]
    end
    
    ALB_SG --> JWT_Auth
    EC2_SG --> RBAC
    RDS_SG --> DataEncrypt
    ACM_Cert --> OAuth
    
    WAF --> ALB_SG
    VPC --> EC2_SG
    NACL --> RDS_SG
    
    classDef infra fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    classDef app fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef network fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    
    class ALB_SG,EC2_SG,RDS_SG,ACM_Cert infra
    class JWT_Auth,RBAC,OAuth,DataEncrypt app
    class WAF,VPC,NACL network
```

## 📈 Monitoring Integration

### Comprehensive Monitoring Stack
```mermaid
graph TB
    subgraph "Application Monitoring (gg-mvp)"
        App_Metrics[📊 Application Metrics<br/>Request rates, latency]
        Business_KPIs[📈 Business KPIs<br/>User activity, searches]
        Error_Tracking[🚨 Error Tracking<br/>Exception monitoring]
        Performance[⚡ Performance<br/>Response times]
    end
    
    subgraph "Infrastructure Monitoring (gg-infra)"
        CloudWatch[☁️ CloudWatch<br/>AWS native metrics]
        ALB_Metrics[⚖️ ALB Metrics<br/>Load balancer stats]
        RDS_Metrics[🗄️ RDS Metrics<br/>Database performance]
        EC2_Metrics[🖥️ EC2 Metrics<br/>Instance health]
    end
    
    subgraph "Aggregation & Alerting"
        Dashboard[📊 Monitoring Dashboard<br/>Unified view]
        Alerts[🔔 Alert Manager<br/>PagerDuty/Slack]
        Logs[📋 Log Aggregation<br/>Centralized logging]
    end
    
    App_Metrics --> Dashboard
    Business_KPIs --> Dashboard
    CloudWatch --> Dashboard
    ALB_Metrics --> Dashboard
    
    Error_Tracking --> Alerts
    Performance --> Alerts
    RDS_Metrics --> Alerts
    EC2_Metrics --> Alerts
    
    Dashboard --> Logs
    Alerts --> Logs
    
    classDef app fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef infra fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    classDef monitoring fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    
    class App_Metrics,Business_KPIs,Error_Tracking,Performance app
    class CloudWatch,ALB_Metrics,RDS_Metrics,EC2_Metrics infra
    class Dashboard,Alerts,Logs monitoring
```

## 🔗 API Integration Points

### External API Integrations

#### SAM.gov Integration
```mermaid
sequenceDiagram
    participant Worker as ⚙️ Background Worker
    participant SAM as 🏛️ SAM.gov API
    participant DB as 🗄️ PostgreSQL
    participant Cache as 📦 Redis
    participant API as 🚀 GoldenGate API
    participant UI as 🎨 Frontend
    
    Worker->>SAM: Fetch Entity Data
    SAM-->>Worker: XML/JSON Response
    Worker->>Worker: Transform & Validate
    Worker->>DB: Store Raw Data
    Worker->>Cache: Invalidate Related
    
    UI->>API: Search Contractors
    API->>Cache: Check Cache
    
    alt Cache Miss
        API->>DB: Query Database
        DB-->>API: Fresh Data
        API->>Cache: Update Cache
    else Cache Hit
        Cache-->>API: Cached Data
    end
    
    API-->>UI: Contractor Results
```

#### Snowflake Analytics Integration
```javascript
// gg-mvp API integration with Snowflake
import { Snowflake } from '@/services/snowflake';

class ContractorAnalytics {
  async getIndustryTrends(filters) {
    const query = `
      SELECT 
        industry_code,
        COUNT(*) as contractor_count,
        AVG(annual_revenue) as avg_revenue,
        SUM(contract_value) as total_contracts
      FROM contractor_analytics 
      WHERE date_range BETWEEN ? AND ?
      GROUP BY industry_code
      ORDER BY total_contracts DESC
    `;
    
    return await Snowflake.query(query, filters);
  }
}
```

## 🧪 Testing Integration

### End-to-End Testing Strategy
```mermaid
graph LR
    subgraph "Local Testing (gg-mvp)"
        Unit[🧪 Unit Tests<br/>Individual functions]
        Integration[🔗 Integration Tests<br/>API endpoints]
        E2E_Local[🎭 E2E Tests<br/>Full user flows]
    end
    
    subgraph "Infrastructure Testing (gg-infra)"
        TF_Validate[✅ Terraform Validate<br/>Syntax & logic]
        TF_Plan[📋 Terraform Plan<br/>Resource changes]
        Infra_Test[🏗️ Infrastructure Tests<br/>Resource validation]
    end
    
    subgraph "Production Testing"
        Health_Checks[❤️ Health Checks<br/>Service availability]
        Load_Testing[📈 Load Testing<br/>Performance validation]
        Security_Scan[🔍 Security Scanning<br/>Vulnerability assessment]
    end
    
    Unit --> Integration
    Integration --> E2E_Local
    TF_Validate --> TF_Plan
    TF_Plan --> Infra_Test
    
    E2E_Local --> Health_Checks
    Infra_Test --> Health_Checks
    Health_Checks --> Load_Testing
    Load_Testing --> Security_Scan
    
    classDef local fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef infra fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    classDef prod fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    
    class Unit,Integration,E2E_Local local
    class TF_Validate,TF_Plan,Infra_Test infra
    class Health_Checks,Load_Testing,Security_Scan prod
```

## 🔄 CI/CD Integration

### Complete Pipeline Integration
```mermaid
graph TB
    subgraph "Source Control"
        MVP_Repo[📁 gg-mvp Repository<br/>Application code]
        Infra_Repo[📁 gg-infra Repository<br/>Infrastructure code]
    end
    
    subgraph "CI Pipeline"
        App_CI[🔨 Application CI<br/>Build, test, lint]
        Infra_CI[🏗️ Infrastructure CI<br/>Validate Terraform]
        Security_CI[🔍 Security CI<br/>SAST, dependency scan]
    end
    
    subgraph "CD Pipeline"
        Build_Images[📦 Build Images<br/>Docker containers]
        Deploy_Infra[🏗️ Deploy Infrastructure<br/>Terraform apply]
        Deploy_App[🚀 Deploy Application<br/>Update containers]
    end
    
    subgraph "Verification"
        Integration_Tests[🧪 Integration Tests<br/>API validation]
        E2E_Tests[🎭 E2E Tests<br/>User workflows]
        Performance_Tests[⚡ Performance Tests<br/>Load testing]
    end
    
    MVP_Repo --> App_CI
    Infra_Repo --> Infra_CI
    
    App_CI --> Security_CI
    Infra_CI --> Security_CI
    
    Security_CI --> Build_Images
    Security_CI --> Deploy_Infra
    
    Build_Images --> Deploy_App
    Deploy_Infra --> Deploy_App
    
    Deploy_App --> Integration_Tests
    Integration_Tests --> E2E_Tests
    E2E_Tests --> Performance_Tests
    
    classDef source fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef ci fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    classDef cd fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    classDef verify fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff
    
    class MVP_Repo,Infra_Repo source
    class App_CI,Infra_CI,Security_CI ci
    class Build_Images,Deploy_Infra,Deploy_App cd
    class Integration_Tests,E2E_Tests,Performance_Tests verify
```

## 📋 Integration Checklist

### Pre-Integration Setup
- [ ] Both repositories cloned in correct directory structure
- [ ] AWS CLI configured with appropriate permissions
- [ ] Docker and Docker Compose installed
- [ ] Terraform installed and configured
- [ ] Environment variables configured for both repos

### Infrastructure Integration
- [ ] Terraform backend configured (S3 + DynamoDB)
- [ ] VPC and networking configured
- [ ] Security groups allow proper communication
- [ ] RDS and ElastiCache deployed and accessible
- [ ] ECR repositories created for Docker images
- [ ] SSL certificates configured (if using custom domain)

### Application Integration
- [ ] Database migrations run successfully
- [ ] API connects to RDS and Redis
- [ ] Frontend connects to API endpoints
- [ ] Docker images build without errors
- [ ] Environment variables mapped correctly
- [ ] Health checks return successful responses

### Security Integration
- [ ] SSL/TLS configured end-to-end
- [ ] Authentication working across all components
- [ ] RBAC policies applied correctly
- [ ] Secrets stored in AWS Secrets Manager
- [ ] Network security groups configured
- [ ] Data encryption enabled

### Monitoring Integration
- [ ] CloudWatch metrics collecting
- [ ] Application logging configured
- [ ] Health check endpoints responding
- [ ] Performance monitoring active
- [ ] Alert thresholds configured
- [ ] Dashboard showing all metrics

## 🆘 Common Integration Issues

### Repository Structure Issues
```bash
# Incorrect structure (common mistake)
some-folder/
├── gg-mvp/
└── different-folder/
    └── gg-infra/

# Correct structure
parent-folder/
├── gg-mvp/
└── gg-infra/
```

### Environment Variable Mismatches
```bash
# Development (gg-mvp)
DATABASE_URL=postgresql://goldengate:password@localhost:5432/goldengate_dev

# Production (gg-infra) - Should match RDS endpoint
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/goldengate
```

### Container Registry Issues
```bash
# Ensure ECR repositories exist before pushing
aws ecr describe-repositories --repository-names goldengate-api goldengate-ui

# Create if they don't exist
aws ecr create-repository --repository-name goldengate-api
aws ecr create-repository --repository-name goldengate-ui
```

## 📞 Support and Resources

### Documentation Cross-References
- [gg-mvp Visual Guide](VISUAL_GUIDE.md) - Application architecture
- [gg-mvp Deployment Guide](DEPLOYMENT_GUIDE.md) - Application deployment
- [gg-infra SSL Guide](../../gg-infra/docs/SSL_HTTPS_SETUP.md) - SSL configuration
- [gg-infra Architecture](../../gg-infra/docs/ARCHITECTURE.md) - Infrastructure details

### Integration Support
- **Application Issues**: Review gg-mvp documentation
- **Infrastructure Issues**: Review gg-infra documentation  
- **Integration Issues**: Contact development team
- **Performance Issues**: Check monitoring dashboards

---

**Integration Success**: When both repositories work together seamlessly to deliver the complete GoldenGate federal contractor intelligence platform.

**Remember**: The application (gg-mvp) defines WHAT we build, the infrastructure (gg-infra) defines WHERE it runs, and this integration guide shows HOW they work together.