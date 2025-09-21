# Deployment Guide

## Overview

This guide covers deploying the GoldenGate API to various environments including development, staging, and production.

## Deployment Options

### 1. Docker Deployment

#### Dockerfile

```dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1

# Start the application
CMD ["bun", "run", "start"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "4001:4001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SNOWFLAKE_ACCOUNT=${SNOWFLAKE_ACCOUNT}
      - SNOWFLAKE_USERNAME=${SNOWFLAKE_USERNAME}
      - SNOWFLAKE_PASSWORD=${SNOWFLAKE_PASSWORD}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=goldengate
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 2. Cloud Platform Deployments

#### AWS Elastic Beanstalk

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize Elastic Beanstalk:**
```bash
eb init -p docker goldengate-api
```

3. **Create environment:**
```bash
eb create production --instance-type t3.medium
```

4. **Deploy:**
```bash
eb deploy
```

5. **Set environment variables:**
```bash
eb setenv NODE_ENV=production DATABASE_URL=your_db_url JWT_SECRET=your_secret
```

#### Google Cloud Run

1. **Build container:**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/goldengate-api
```

2. **Deploy to Cloud Run:**
```bash
gcloud run deploy goldengate-api \
  --image gcr.io/PROJECT_ID/goldengate-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars DATABASE_URL=$DATABASE_URL \
  --set-env-vars JWT_SECRET=$JWT_SECRET
```

#### Azure Container Instances

1. **Build and push to Azure Container Registry:**
```bash
az acr build --registry myregistry --image goldengate-api .
```

2. **Deploy container:**
```bash
az container create \
  --resource-group myResourceGroup \
  --name goldengate-api \
  --image myregistry.azurecr.io/goldengate-api \
  --dns-name-label goldengate-api \
  --ports 4001 \
  --environment-variables \
    NODE_ENV=production \
    DATABASE_URL=$DATABASE_URL \
    JWT_SECRET=$JWT_SECRET
```

### 3. Kubernetes Deployment

#### Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: goldengate-api
  labels:
    app: goldengate-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: goldengate-api
  template:
    metadata:
      labels:
        app: goldengate-api
    spec:
      containers:
      - name: api
        image: goldengate/api:latest
        ports:
        - containerPort: 4001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: goldengate-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: goldengate-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4001
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service YAML

```yaml
apiVersion: v1
kind: Service
metadata:
  name: goldengate-api-service
spec:
  selector:
    app: goldengate-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 4001
  type: LoadBalancer
```

#### Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic goldengate-secrets \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=jwt-secret=$JWT_SECRET

# Apply configurations
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Check status
kubectl get pods
kubectl get services
```

## Environment Configuration

### Production Environment Variables

```env
# Server
NODE_ENV=production
PORT=4001
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@db-host:5432/goldengate
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_SSL=true

# JWT
JWT_SECRET=your-production-secret-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Snowflake
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USERNAME=api_user
SNOWFLAKE_PASSWORD=secure_password
SNOWFLAKE_WAREHOUSE=PROD_WH
SNOWFLAKE_DATABASE=GOLDENGATE_PROD
SNOWFLAKE_SCHEMA=PUBLIC
SNOWFLAKE_ROLE=API_ROLE

# CORS
CORS_ALLOWED_ORIGINS=https://app.goldengate.com,https://www.goldengate.com

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-new-relic-key

# Redis (Cache)
REDIS_URL=redis://redis-host:6379
REDIS_PASSWORD=redis_password
```

## Database Setup

### 1. Create Production Database

```sql
CREATE DATABASE goldengate_prod;
CREATE USER api_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE goldengate_prod TO api_user;
GRANT USAGE ON SCHEMA public TO api_user;
GRANT CREATE ON SCHEMA public TO api_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO api_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO api_user;
```

### 2. Run Migrations

```bash
NODE_ENV=production bun run db:migrate
```

### 3. Verify Database

```bash
psql -h db-host -U api_user -d goldengate_prod -c "SELECT COUNT(*) FROM users;"
```

## Load Balancing

### Nginx Configuration

```nginx
upstream goldengate_api {
    least_conn;
    server api1.internal:4001;
    server api2.internal:4001;
    server api3.internal:4001;
}

server {
    listen 80;
    listen 443 ssl http2;
    server_name api.goldengate.com;

    ssl_certificate /etc/ssl/certs/goldengate.crt;
    ssl_certificate_key /etc/ssl/private/goldengate.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://goldengate_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://goldengate_api/health;
        access_log off;
    }
}
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.goldengate.com

# Auto-renewal
sudo certbot renew --dry-run
```

### SSL Configuration Best Practices

```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
```

## Monitoring and Logging

### 1. Application Monitoring

#### PM2 Setup

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

#### ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'goldengate-api',
    script: 'bun',
    args: 'run start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4001
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 2. Logging Configuration

#### Winston Logger

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'goldengate-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### 3. Health Checks

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: await checkDatabaseHealth(),
    redis: await checkRedisHealth(),
    snowflake: await checkSnowflakeHealth(),
    memory: process.memoryUsage(),
  };
  
  const httpStatus = health.database && health.redis ? 200 : 503;
  res.status(httpStatus).json(health);
});
```

## Backup and Disaster Recovery

### Database Backup

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="goldengate_prod"

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://goldengate-backups/

# Clean old local backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### Restore Procedure

```bash
# Download from S3
aws s3 cp s3://goldengate-backups/backup_20240116_120000.sql.gz .

# Restore database
gunzip -c backup_20240116_120000.sql.gz | psql -h $DB_HOST -U $DB_USER -d goldengate_prod
```

## Security Hardening

### 1. API Security Headers

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

### 2. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

### 3. Input Validation

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
});

app.post('/register', (req, res) => {
  try {
    const validatedData = userSchema.parse(req.body);
    // Process registration
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});
```

## Performance Optimization

### 1. Caching Strategy

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache middleware
const cache = (duration = 300) => async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  const cached = await redis.get(key);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  res.sendResponse = res.json;
  res.json = (body) => {
    redis.setex(key, duration, JSON.stringify(body));
    res.sendResponse(body);
  };
  
  next();
};
```

### 2. Database Connection Pooling

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. Compression

```typescript
import compression from 'compression';

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));
```

## Deployment Checklist

### Pre-Deployment

- [ ] Run tests: `bun test`
- [ ] Check linting: `bun run lint`
- [ ] Update dependencies: `bun update`
- [ ] Review security vulnerabilities: `bun audit`
- [ ] Update documentation
- [ ] Create database backup
- [ ] Review environment variables
- [ ] Test database migrations

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Run database migrations
- [ ] Verify health checks
- [ ] Check monitoring dashboards
- [ ] Test critical endpoints

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backup procedures
- [ ] Update status page
- [ ] Notify team of deployment
- [ ] Document any issues

## Rollback Procedure

```bash
#!/bin/bash
# rollback.sh

# Get previous version
PREVIOUS_VERSION=$(git tag | sort -V | tail -2 | head -1)

# Rollback code
git checkout $PREVIOUS_VERSION
bun install --frozen-lockfile
bun run build

# Rollback database if needed
psql -h $DB_HOST -U $DB_USER -d goldengate_prod < rollback.sql

# Restart services
pm2 reload goldengate-api

# Clear cache
redis-cli FLUSHDB

echo "Rolled back to version $PREVIOUS_VERSION"
```

## Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart with memory limit
pm2 restart goldengate-api --max-memory-restart 1G
```

#### Database Connection Issues
```bash
# Check connection pool
psql -c "SELECT count(*) FROM pg_stat_activity WHERE application_name = 'goldengate-api';"

# Kill idle connections
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < now() - interval '10 minutes';"
```

#### Slow API Response
```bash
# Check slow queries
psql -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check Redis
redis-cli ping
redis-cli INFO stats
```

## Support

For deployment support:
- Documentation: https://docs.goldengate.com/deployment
- DevOps Team: devops@goldengate.com
- Emergency Hotline: +1-555-DEPLOY-1