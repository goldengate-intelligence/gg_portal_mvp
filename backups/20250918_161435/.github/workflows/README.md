# GitHub Actions CI/CD Pipeline

This directory contains GitHub Actions workflows for continuous integration and deployment of the GoldenGate MVP application.

## Workflows

### 1. CI - Test and Lint (`ci.yml`)
Runs on every pull request and push to develop branch.

**Jobs:**
- **test-api**: Runs API tests, type checking, and linting
- **test-ui**: Runs UI tests, type checking, and linting  
- **docker-build-test**: Tests that Docker images build successfully

### 2. Build and Deploy (`deploy.yml`)
Builds Docker images and deploys to AWS ECR and EC2.

**Triggers:**
- Push to `main` branch (auto-deploy)
- Push to `develop` branch (build only)
- Manual workflow dispatch
- Pull requests (build only)

**Jobs:**
- **build-and-push**: Builds and pushes Docker images to ECR
- **deploy**: Deploys to EC2 (only on main branch push)

## Required GitHub Secrets

You need to configure these secrets in your GitHub repository settings:

```yaml
AWS_ACCESS_KEY_ID: Your AWS access key
AWS_SECRET_ACCESS_KEY: Your AWS secret key
```

### Setting up AWS Credentials

1. Create an IAM user with the following permissions:
   - ECR: Full access to your repositories
   - EC2: Describe instances, SSM send command
   - SSM: Send command permissions

2. Example IAM Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": [
        "arn:aws:ecr:us-east-1:340285142152:repository/gg-mvp-api",
        "arn:aws:ecr:us-east-1:340285142152:repository/gg-mvp-ui"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ssm:SendCommand",
        "ssm:GetCommandInvocation",
        "ssm:DescribeInstanceInformation"
      ],
      "Resource": "*"
    }
  ]
}
```

3. Add the credentials to GitHub:
   - Go to Settings > Secrets and variables > Actions
   - Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

## Local Testing

To test the workflows locally, you can use [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Test CI workflow
act pull_request

# Test deploy workflow
act push -s AWS_ACCESS_KEY_ID=xxx -s AWS_SECRET_ACCESS_KEY=yyy
```

## Manual Deployment

You can manually trigger deployment from GitHub Actions:

1. Go to Actions tab
2. Select "Build and Deploy to AWS ECR"
3. Click "Run workflow"
4. Select branch and environment

## Docker Build Optimization

The workflows use several optimization techniques:
- Docker Buildx for efficient multi-stage builds
- Layer caching to speed up builds
- GitHub Actions cache for dependencies
- Parallel builds for API and UI

## Troubleshooting

### Build Failures
- Check the workflow logs in GitHub Actions
- Ensure all dependencies are properly listed in package.json
- Verify Dockerfiles have correct syntax

### Deployment Failures
- Verify AWS credentials are correct
- Check EC2 instance is running and tagged correctly
- Ensure SSM agent is installed on EC2 instance
- Check security groups allow necessary traffic

### ECR Push Failures
- Verify ECR repositories exist
- Check IAM permissions for ECR
- Ensure AWS region matches your infrastructure

## Environment Variables

### API Build Variables
- `NODE_ENV`: Set to production for builds
- `DATABASE_URL`: Not needed for build (runtime only)

### UI Build Variables
- `VITE_API_URL`: API endpoint (default: /api)
- `VITE_APP_ENV`: Environment name (development/staging/production)

## Branch Strategy

- **main**: Production deployments (auto-deploy on push)
- **develop**: Development builds (no auto-deploy)
- **feature/***: Feature branches (CI only on PR)

## Security Considerations

- Never commit AWS credentials to the repository
- Use GitHub Secrets for all sensitive information
- Regularly rotate AWS access keys
- Use least-privilege IAM policies
- Enable MFA on AWS accounts

## Monitoring

After deployment, monitor:
- GitHub Actions workflow runs
- ECR repository for image sizes
- EC2 instance health
- Application logs via CloudWatch

## Cost Optimization

- Docker layer caching reduces build time and costs
- Cleanup old ECR images regularly (lifecycle policy configured)
- Use spot instances for non-critical environments
- Monitor AWS costs via Cost Explorer