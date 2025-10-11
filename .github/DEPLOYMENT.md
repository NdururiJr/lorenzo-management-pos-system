# Deployment Guide

This document outlines the deployment workflows and procedures for the Lorenzo Dry Cleaners project.

## Table of Contents

- [Overview](#overview)
- [Deployment Environments](#deployment-environments)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Environment Variables](#environment-variables)
- [Branch Strategy](#branch-strategy)
- [Deployment Process](#deployment-process)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

The Lorenzo Dry Cleaners project uses GitHub Actions for continuous integration and deployment. We support deployment to both Vercel and Firebase, giving you flexibility in choosing your hosting platform.

## Deployment Environments

### Staging Environment

- **Purpose:** Testing and preview before production
- **Branch:** `develop`, `staging`
- **URL:** `staging.lorenzo-dry-cleaners.vercel.app` (or Firebase staging URL)
- **Auto-deploy:** Yes, on push to staging branches

### Production Environment

- **Purpose:** Live application serving real users
- **Branch:** `main`, `master`
- **URL:** `lorenzo-dry-cleaners.vercel.app` or custom domain
- **Auto-deploy:** Yes, with manual approval option
- **Protected:** Requires passing CI checks

## GitHub Actions Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to any branch
- Pull requests to any branch

**Jobs:**
1. **Lint:** Runs ESLint and Prettier checks
2. **Type Check:** Validates TypeScript types
3. **Build:** Builds the Next.js application
4. **Test:** Runs unit and integration tests

**Status:** Required to pass before merging PRs

### 2. Deploy to Staging (`deploy-staging.yml`)

**Triggers:**
- Push to `develop` or `staging` branch
- Manual workflow dispatch

**Jobs:**
1. Build and deploy to staging environment
2. Run smoke tests
3. Comment on PR with preview URL (if applicable)

**Platforms Supported:**
- Vercel (default)
- Firebase (via workflow dispatch input)

### 3. Deploy to Production (`deploy-production.yml`)

**Triggers:**
- Push to `main` or `master` branch
- Manual workflow dispatch

**Jobs:**
1. Pre-deployment checks (lint, test, build)
2. Deploy to production
3. Post-deployment validation
4. Create GitHub release
5. Notify team

**Protection:**
- Requires environment approval (configure in GitHub settings)
- Requires all CI checks to pass

### 4. Dependency Updates (`dependency-update.yml`)

**Triggers:**
- Schedule: Every Monday at 9:00 AM UTC
- Manual workflow dispatch

**Jobs:**
1. Check for outdated packages
2. Update dependencies based on type (patch/minor/major)
3. Run tests
4. Create PR with updates

### 5. Security Audit (`security.yml`)

**Triggers:**
- Push to main/develop branches
- Pull requests
- Schedule: Daily at 2:00 AM UTC
- Manual workflow dispatch

**Jobs:**
1. NPM security audit
2. Dependency review (PRs only)
3. CodeQL security analysis
4. Secret scanning
5. License compliance check

### 6. Reusable Build Workflow (`reusable-build.yml`)

A reusable workflow that can be called by other workflows for consistent build processes.

**Inputs:**
- `node-version`: Node.js version (default: 20)
- `environment`: Build environment (default: production)
- `skip-tests`: Skip tests (default: false)
- `upload-artifacts`: Upload build artifacts (default: true)

## Environment Variables

### Required Secrets

Configure these secrets in GitHub repository settings (Settings > Secrets and variables > Actions):

#### For Vercel Deployment

```
VERCEL_TOKEN              # Your Vercel API token
VERCEL_ORG_ID            # Your Vercel organization ID
VERCEL_PROJECT_ID        # Your Vercel project ID
```

#### For Firebase Deployment

```
FIREBASE_SERVICE_ACCOUNT_STAGING     # Firebase service account (staging)
FIREBASE_SERVICE_ACCOUNT_PRODUCTION  # Firebase service account (production)
FIREBASE_PROJECT_ID                  # Firebase project ID
```

#### Optional Secrets

```
SLACK_WEBHOOK_URL        # For deployment notifications
GITGUARDIAN_API_KEY     # For secret scanning
```

### How to Get Secrets

#### Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings > Tokens > Create Token
3. Copy the token to `VERCEL_TOKEN`
4. Find Org ID and Project ID in project settings

#### Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Project Settings > Service Accounts
3. Generate new private key
4. Copy the JSON content to `FIREBASE_SERVICE_ACCOUNT_*`

## Branch Strategy

We follow a Git Flow-inspired branching strategy:

```
main/master     → Production environment
  ↑
develop        → Staging environment
  ↑
feature/*      → Feature branches (PR to develop)
bugfix/*       → Bug fix branches (PR to develop)
hotfix/*       → Urgent fixes (PR to main)
```

### Branch Protection Rules

**Main/Master Branch:**
- Require pull request reviews
- Require status checks to pass (CI workflow)
- Require linear history
- No force pushes
- No deletions

**Develop Branch:**
- Require status checks to pass
- No force pushes

## Deployment Process

### Deploying to Staging

1. **Automatic Deployment:**
   ```bash
   git checkout develop
   git pull origin develop
   # Make your changes
   git add .
   git commit -m "feat: add new feature"
   git push origin develop
   ```

   This triggers the staging deployment automatically.

2. **Manual Deployment:**
   - Go to Actions tab in GitHub
   - Select "Deploy to Staging" workflow
   - Click "Run workflow"
   - Choose platform (Vercel or Firebase)
   - Click "Run workflow"

### Deploying to Production

1. **Via Pull Request (Recommended):**
   ```bash
   # Create PR from develop to main
   git checkout develop
   git pull origin develop
   # Go to GitHub and create PR: develop → main
   # Wait for reviews and approval
   # Merge PR
   ```

2. **Direct Push (Use with caution):**
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```

3. **Manual Deployment:**
   - Go to Actions tab in GitHub
   - Select "Deploy to Production" workflow
   - Click "Run workflow"
   - Choose platform (Vercel or Firebase)
   - Click "Run workflow"
   - Approve deployment in Environments (if required)

### Environment Approval

For production deployments, configure environment protection rules:

1. Go to Settings > Environments
2. Create "production" environment
3. Add required reviewers
4. Add deployment branches rule (only main/master)
5. Save protection rules

## Rollback Procedures

### Option 1: Rollback via Git Revert

```bash
# Find the commit to revert
git log --oneline

# Revert the commit
git revert <commit-hash>
git push origin main
```

This triggers a new deployment with the reverted changes.

### Option 2: Rollback via Platform

**Vercel:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments
4. Find the previous working deployment
5. Click "Promote to Production"

**Firebase:**
1. Go to Firebase Console
2. Hosting > Manage site
3. Release history
4. Click on previous version
5. Rollback

### Option 3: Rollback via GitHub Release

```bash
# Find the previous release tag
git tag -l

# Create a new branch from the tag
git checkout -b hotfix/rollback-to-v1.0.0 v1.0.0

# Push and create PR to main
git push origin hotfix/rollback-to-v1.0.0
```

## Troubleshooting

### Common Issues

#### 1. Build Fails on CI

**Symptoms:** Build fails with error messages

**Solutions:**
- Check the error logs in GitHub Actions
- Ensure all environment variables are set
- Verify dependencies are installed correctly
- Run build locally: `npm run build`

#### 2. Deployment Fails

**Symptoms:** Deployment workflow fails

**Solutions:**
- Verify deployment secrets are configured
- Check platform status (Vercel/Firebase)
- Ensure build artifacts are created
- Check platform-specific logs

#### 3. Type Check Fails

**Symptoms:** TypeScript errors in CI

**Solutions:**
- Run locally: `npm run type-check`
- Fix type errors
- Ensure all dependencies are up to date
- Check `tsconfig.json` configuration

#### 4. Tests Fail

**Symptoms:** Test suite fails in CI

**Solutions:**
- Run tests locally: `npm test`
- Check test logs for specific failures
- Ensure test environment is configured
- Update snapshots if needed

#### 5. Security Vulnerabilities Detected

**Symptoms:** Security audit workflow creates issues

**Solutions:**
- Run: `npm audit`
- Run: `npm audit fix` (for automatic fixes)
- Update vulnerable packages manually
- Review breaking changes before updating

### Debugging Workflows

#### View Workflow Logs

1. Go to Actions tab in GitHub
2. Select the workflow run
3. Click on the specific job
4. Review step-by-step logs

#### Re-run Failed Jobs

1. Go to the failed workflow run
2. Click "Re-run failed jobs"
3. Or "Re-run all jobs" to start fresh

#### Enable Debug Logging

Add these secrets for verbose logging:
- `ACTIONS_STEP_DEBUG`: true
- `ACTIONS_RUNNER_DEBUG`: true

### Getting Help

If you encounter issues not covered here:

1. Check GitHub Actions documentation
2. Review platform-specific docs (Vercel/Firebase)
3. Check repository issues for similar problems
4. Create a new issue with detailed information

## Best Practices

### Before Deploying

- [ ] All tests pass locally
- [ ] Code is linted and formatted
- [ ] TypeScript has no errors
- [ ] Environment variables are configured
- [ ] Changes are reviewed
- [ ] Documentation is updated

### After Deploying

- [ ] Verify deployment succeeded
- [ ] Check application functionality
- [ ] Monitor error logs
- [ ] Verify performance metrics
- [ ] Notify team of deployment

### Regular Maintenance

- [ ] Review security audit reports weekly
- [ ] Update dependencies monthly
- [ ] Review and optimize workflows quarterly
- [ ] Update documentation as needed
- [ ] Archive old artifacts periodically

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

---

**Last Updated:** 2025-10-10
**Maintainer:** Development Team
