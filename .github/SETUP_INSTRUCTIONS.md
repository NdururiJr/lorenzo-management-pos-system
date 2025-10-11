# GitHub Actions CI/CD Setup Instructions

This guide will help you configure GitHub Actions workflows for the Lorenzo Dry Cleaners project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Environment Configuration](#environment-configuration)
4. [Platform-Specific Setup](#platform-specific-setup)
5. [Workflow Activation](#workflow-activation)
6. [Testing the Setup](#testing-the-setup)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up CI/CD, ensure you have:

- [x] GitHub repository with admin access
- [x] Node.js 20+ installed locally
- [x] Account on Vercel or Firebase (or both)
- [x] Git configured locally

## Repository Setup

### 1. Enable GitHub Actions

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Actions** > **General**
3. Under "Actions permissions", select **Allow all actions and reusable workflows**
4. Under "Workflow permissions", select **Read and write permissions**
5. Check **Allow GitHub Actions to create and approve pull requests**
6. Click **Save**

### 2. Configure Branch Protection

#### For Main/Master Branch:

1. Go to **Settings** > **Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `main` (or `master`)
4. Enable the following:
   - [x] Require a pull request before merging
   - [x] Require approvals (at least 1)
   - [x] Require status checks to pass before merging
   - [x] Require branches to be up to date before merging
   - [x] Status checks that are required:
     - `Lint Code`
     - `TypeScript Type Check`
     - `Build Application`
     - `Run Tests`
   - [x] Require linear history
   - [x] Do not allow bypassing the above settings
5. Click **Create**

#### For Develop Branch (Optional):

1. Add another branch protection rule
2. Branch name pattern: `develop`
3. Enable:
   - [x] Require status checks to pass before merging
   - [x] Status checks: Same as main branch
4. Click **Create**

### 3. Create Environments

#### Staging Environment:

1. Go to **Settings** > **Environments**
2. Click **New environment**
3. Name: `staging`
4. Click **Configure environment**
5. Add environment secrets (see below)
6. Deployment branches: Select **Selected branches** and add `develop`, `staging`
7. Click **Save protection rules**

#### Production Environment:

1. Click **New environment**
2. Name: `production`
3. Click **Configure environment**
4. Enable **Required reviewers** and add team members
5. Enable **Wait timer** (optional): 5 minutes
6. Add environment secrets (see below)
7. Deployment branches: Select **Selected branches** and add `main`, `master`
8. Click **Save protection rules**

## Environment Configuration

### Required Secrets

Navigate to **Settings** > **Secrets and variables** > **Actions**

#### Repository Secrets (Used by all workflows)

Click **New repository secret** and add:

1. **VERCEL_TOKEN** (if using Vercel)
   - Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
   - Click **Create Token**
   - Name: `Lorenzo Dry Cleaners CI/CD`
   - Scope: Full Account
   - Expiration: No Expiration
   - Copy the token and paste it here

2. **VERCEL_ORG_ID** (if using Vercel)
   - Go to [Vercel Team Settings](https://vercel.com/teams)
   - Copy your Team ID from the URL or settings page
   - Paste it as the secret value

3. **VERCEL_PROJECT_ID** (if using Vercel)
   - Go to your project on Vercel
   - Go to **Settings** > **General**
   - Copy the Project ID
   - Paste it as the secret value

4. **FIREBASE_SERVICE_ACCOUNT_STAGING** (if using Firebase)
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to **Project Settings** > **Service Accounts**
   - Click **Generate new private key**
   - Copy the entire JSON content
   - Paste it as the secret value

5. **FIREBASE_SERVICE_ACCOUNT_PRODUCTION** (if using Firebase)
   - Follow the same steps as staging
   - Use production project (or same project with different config)
   - Paste the JSON content

6. **FIREBASE_PROJECT_ID** (if using Firebase)
   - Your Firebase project ID (found in project settings)

#### Optional Secrets

7. **SLACK_WEBHOOK_URL** (for notifications)
   - Create a Slack incoming webhook
   - Paste the webhook URL

8. **GITGUARDIAN_API_KEY** (for advanced secret scanning)
   - Sign up at [GitGuardian](https://www.gitguardian.com/)
   - Get your API key
   - Paste it here

#### Environment Secrets

For each environment (staging, production), add environment-specific secrets:

1. Go to **Settings** > **Environments**
2. Click on the environment name
3. Click **Add secret**
4. Add any environment-specific secrets

### Environment Variables

Create a `.env.example` file in your repository:

```bash
# Application
NEXT_PUBLIC_APP_NAME=Lorenzo Dry Cleaners
NEXT_PUBLIC_APP_ENV=development

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Firebase (if using)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## Platform-Specific Setup

### Option A: Vercel Setup

#### 1. Install Vercel CLI (Optional, for local testing)

```bash
npm install -g vercel
```

#### 2. Link Project

```bash
vercel login
vercel link
```

#### 3. Get Project Information

```bash
vercel project ls
```

#### 4. Configure Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add your environment variables for each environment:
   - Production
   - Preview
   - Development

#### 5. Configure Domains (Optional)

1. Go to **Settings** > **Domains**
2. Add your custom domain
3. Configure DNS settings as instructed

### Option B: Firebase Setup

#### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### 2. Login to Firebase

```bash
firebase login
```

#### 3. Initialize Firebase Hosting

```bash
firebase init hosting
```

Select:
- Use existing project or create new
- Public directory: `out` (for Next.js static export) or `.next` (for Next.js)
- Configure as single-page app: No
- Set up automatic builds with GitHub: No (we're using Actions)

#### 4. Configure Firebase

Edit `firebase.json`:

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

#### 5. Get Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click gear icon > **Project settings**
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Save the JSON file securely
7. Copy its contents to GitHub secrets

## Workflow Activation

### 1. Verify Workflow Files

Ensure all workflow files are in `.github/workflows/`:

```
.github/
├── workflows/
│   ├── ci.yml
│   ├── deploy-staging.yml
│   ├── deploy-production.yml
│   ├── dependency-update.yml
│   ├── security.yml
│   └── reusable-build.yml
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
├── DEPLOYMENT.md
└── pull_request_template.md
```

### 2. Commit and Push

```bash
git add .github/
git commit -m "chore: add GitHub Actions CI/CD workflows"
git push origin main
```

### 3. Verify Workflows Are Running

1. Go to **Actions** tab in GitHub
2. You should see workflows starting automatically
3. Check each workflow's status

### 4. Enable Scheduled Workflows

Scheduled workflows may not run initially. To enable:

1. Go to **Actions** tab
2. Select each scheduled workflow:
   - Dependency Updates
   - Security Audit
3. Click **Enable workflow** if disabled

## Testing the Setup

### Test 1: CI Workflow

1. Create a new branch:
   ```bash
   git checkout -b test/ci-workflow
   ```

2. Make a small change:
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: verify CI workflow"
   git push origin test/ci-workflow
   ```

3. Create a Pull Request
4. Verify all CI checks pass

### Test 2: Staging Deployment

1. Merge PR to `develop` branch (or push directly if no branch protection)
   ```bash
   git checkout develop
   git merge test/ci-workflow
   git push origin develop
   ```

2. Go to **Actions** tab
3. Verify "Deploy to Staging" workflow runs
4. Check deployment URL in workflow logs

### Test 3: Production Deployment

1. Create PR from `develop` to `main`
2. Wait for approvals (if required)
3. Merge the PR
4. Verify "Deploy to Production" workflow runs
5. Approve deployment if required
6. Check production URL

### Test 4: Security Audit

1. Manually trigger the workflow:
   ```bash
   # Via GitHub UI: Actions > Security Audit > Run workflow
   ```

2. Or wait for scheduled run (daily at 2 AM UTC)
3. Check the audit report

### Test 5: Dependency Updates

1. Manually trigger:
   ```bash
   # Via GitHub UI: Actions > Dependency Updates > Run workflow
   ```

2. Select update type (patch/minor/major)
3. Verify PR is created with updates

## Troubleshooting

### Issue: Workflows Not Running

**Solution:**
1. Check if Actions are enabled in repository settings
2. Verify workflow files are in `.github/workflows/`
3. Check workflow syntax: Use [GitHub Actions validator](https://rhysd.github.io/actionlint/)
4. Check branch names match workflow triggers

### Issue: Deployment Fails - Missing Secrets

**Solution:**
1. Verify all required secrets are set
2. Check secret names match workflow file references
3. Ensure secrets don't have trailing spaces
4. Re-generate tokens if expired

### Issue: Build Fails - Missing Dependencies

**Solution:**
1. Run locally: `npm ci && npm run build`
2. Check `package.json` scripts exist:
   - `build`
   - `lint`
   - `type-check`
   - `test`
3. Update Node version in workflow if needed

### Issue: Type Check Fails

**Solution:**
1. Run locally: `npm run type-check`
2. Fix TypeScript errors
3. Update `tsconfig.json` if needed
4. Ensure all dependencies have type definitions

### Issue: Security Audit Creates Too Many Issues

**Solution:**
1. Adjust severity threshold in `security.yml`:
   ```yaml
   fail-on-severity: high  # Instead of moderate
   ```
2. Run `npm audit fix` locally first
3. Update vulnerable dependencies

### Issue: Cannot Push to Protected Branch

**Solution:**
1. Create PR instead of direct push
2. Ensure you have required approvals
3. Wait for CI checks to pass
4. Use `git push --force-with-lease` if rebasing (carefully!)

### Getting More Help

1. Check workflow logs in **Actions** tab
2. Enable debug logging (add secrets):
   - `ACTIONS_STEP_DEBUG = true`
   - `ACTIONS_RUNNER_DEBUG = true`
3. Review [GitHub Actions documentation](https://docs.github.com/en/actions)
4. Check platform-specific docs:
   - [Vercel GitHub Actions](https://vercel.com/docs/deployments/git/vercel-for-github)
   - [Firebase GitHub Actions](https://github.com/FirebaseExtended/action-hosting-deploy)

## Maintenance

### Regular Tasks

**Weekly:**
- [ ] Review security audit reports
- [ ] Check dependency update PRs
- [ ] Review failed workflow runs

**Monthly:**
- [ ] Update workflow action versions
- [ ] Review and optimize workflow performance
- [ ] Update documentation

**Quarterly:**
- [ ] Audit all secrets and rotate if needed
- [ ] Review branch protection rules
- [ ] Update deployment procedures

## Next Steps

After completing the setup:

1. [ ] Test all workflows
2. [ ] Configure team notifications
3. [ ] Set up monitoring and alerting
4. [ ] Document custom procedures
5. [ ] Train team on deployment process
6. [ ] Set up staging environment
7. [ ] Configure custom domains
8. [ ] Set up analytics and monitoring

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Project Deployment Guide](.github/DEPLOYMENT.md)

---

**Need help?** Create an issue using the bug report template or reach out to the team.

**Last Updated:** 2025-10-10
