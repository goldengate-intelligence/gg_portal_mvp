# Pull Request Testing Guide - Docker & CI/CD Setup

## Branch: `feat/docker-cicd-setup`

This PR adds Docker containerization and GitHub Actions CI/CD pipeline for the GoldenGate MVP application.

## What's Included

✅ **Docker Setup**
- API Dockerfile (Bun + Elysia)
- UI Dockerfile (React + Vite with nginx)
- Docker Compose for local testing
- Security best practices (non-root users)

✅ **GitHub Actions**
- CI workflow for testing on PRs
- Deploy workflow for building and pushing to ECR
- Auto-deployment to EC2 (enabled for this branch for testing)

✅ **Scripts & Documentation**
- Build and push script for manual deployment
- Comprehensive deployment documentation
- GitHub Actions setup guide

## Testing Steps

### 1. Set Up GitHub Secrets

Before the workflows can run, add these secrets in GitHub:

1. Go to: https://github.com/fidelescap/gg-mvp/settings/secrets/actions
2. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### 2. Create Pull Request

1. Go to: https://github.com/fidelescap/gg-mvp/pull/new/feat/docker-cicd-setup
2. Create PR from `feat/docker-cicd-setup` to `main`
3. The CI workflow will automatically run

### 3. Monitor GitHub Actions

Watch the workflows run:
- **CI Pipeline**: Will test and lint the code
- **Build and Deploy**: Will build Docker images and push to ECR
- **Deploy Job**: Will deploy to EC2 (enabled for this test branch)

### 4. Verify Deployment

Once workflows complete successfully:

```bash
# Check application is running
curl http://34.231.242.151/health

# Check API
curl http://34.231.242.151/api/health

# SSH to EC2 to check logs (if needed)
ssh -i gg-infra/terraform/gg-mvp-key.pem ec2-user@34.231.242.151
docker-compose logs -f
```

## Expected Outcomes

### On This Feature Branch Push
1. ✅ Docker images built
2. ✅ Images pushed to ECR
3. ✅ Application deployed to EC2
4. ✅ Health checks pass

### After Merge to Main
- Same process, but triggered automatically on every push to main
- Feature branch deployment condition will be removed

## Troubleshooting

### If Workflows Fail

1. **Check Secrets**: Ensure AWS credentials are correctly set
2. **Check Logs**: Click on failed job in GitHub Actions
3. **ECR Access**: Verify IAM user has ECR permissions
4. **EC2 Access**: Ensure EC2 instance is running

### Required IAM Permissions

The AWS IAM user needs:
- ECR: Push/pull permissions
- EC2: Describe instances
- SSM: Send commands (for deployment)

### Manual Testing (Local)

If you have Docker running locally:

```bash
# Build images locally
docker-compose -f docker-compose.prod.yml build

# Run locally
docker-compose -f docker-compose.prod.yml up

# Access at http://localhost
```

## Files Changed

- `.github/workflows/ci.yml` - CI pipeline
- `.github/workflows/deploy.yml` - Deploy pipeline  
- `apps/api/Dockerfile` - API container
- `apps/ui/Dockerfile` - UI container
- `docker-compose.prod.yml` - Local testing
- `scripts/build-and-push.sh` - Manual deploy script
- `DEPLOYMENT.md` - Full documentation

## Next Steps After Testing

1. ✅ Verify builds succeed
2. ✅ Verify deployment works
3. ✅ Test application functionality
4. ✅ Review and approve PR
5. ✅ Merge to main
6. 🔧 Remove feature branch from deploy condition

## Notes

- The deploy workflow is temporarily enabled for `feat/docker-cicd-setup` branch for testing
- After successful testing and merge, update the deploy workflow to only deploy from `main`
- ECR lifecycle policies will keep only the last 5 images to save costs

---

**PR URL**: https://github.com/fidelescap/gg-mvp/pull/new/feat/docker-cicd-setup