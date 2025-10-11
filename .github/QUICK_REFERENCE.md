# GitHub Actions Quick Reference

Quick reference guide for common CI/CD operations in the Lorenzo Dry Cleaners project.

## Table of Contents

- [Quick Commands](#quick-commands)
- [Manual Workflow Triggers](#manual-workflow-triggers)
- [Common Scenarios](#common-scenarios)
- [Troubleshooting Commands](#troubleshooting-commands)
- [Emergency Procedures](#emergency-procedures)

---

## Quick Commands

### Local Development

```bash
# Install dependencies
npm ci

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test

# Format code
npm run format

# Check formatting
npm run format:check
```

### Git Operations

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature-name

# Update from main
git checkout main
git pull origin main
git checkout feature/your-feature-name
git rebase main

# Create PR (via GitHub CLI)
gh pr create --title "Your PR Title" --body "Description"
```

---

## Manual Workflow Triggers

### Via GitHub UI

1. Go to **Actions** tab
2. Select workflow from left sidebar
3. Click **Run workflow** button
4. Fill in inputs (if any)
5. Click **Run workflow**

### Via GitHub CLI

```bash
# Install GitHub CLI
npm install -g gh

# Login
gh auth login

# Trigger Deploy to Staging (Vercel)
gh workflow run deploy-staging.yml -f environment=vercel

# Trigger Deploy to Staging (Firebase)
gh workflow run deploy-staging.yml -f environment=firebase

# Trigger Deploy to Production (Vercel)
gh workflow run deploy-production.yml -f environment=vercel -f skip_tests=false

# Trigger Dependency Updates (patch)
gh workflow run dependency-update.yml -f update_type=patch

# Trigger Dependency Updates (minor)
gh workflow run dependency-update.yml -f update_type=minor

# Trigger Security Audit
gh workflow run security.yml
```

### Via API

```bash
# Set variables
GITHUB_TOKEN="your_token"
OWNER="your_username"
REPO="lorenzo-dry-cleaners"

# Trigger staging deployment
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/workflows/deploy-staging.yml/dispatches \
  -d '{"ref":"develop","inputs":{"environment":"vercel"}}'
```

---

## Common Scenarios

### Scenario 1: Deploy a New Feature

```bash
# 1. Create and develop feature
git checkout -b feature/new-feature
# ... make changes ...
git add .
git commit -m "feat: add new feature"

# 2. Push and create PR to develop
git push origin feature/new-feature
gh pr create --base develop --title "feat: add new feature"

# 3. Wait for CI to pass
# GitHub Actions will automatically run CI workflow

# 4. Merge PR
gh pr merge --squash

# 5. Deploy to staging (automatic)
# Merging to develop automatically triggers staging deployment

# 6. Test on staging
# Visit staging URL from workflow output

# 7. Deploy to production
gh pr create --base main --head develop --title "Release: deploy new feature"
# Wait for approval and merge
```

### Scenario 2: Hotfix in Production

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix the bug
# ... make changes ...
git add .
git commit -m "fix: critical bug in production"

# 3. Push and create PR to main
git push origin hotfix/critical-bug
gh pr create --base main --title "fix: critical bug"

# 4. Fast-track review and merge
# Get expedited review and merge

# 5. Monitor deployment
# Production deployment triggers automatically
# Watch Actions tab for status

# 6. Verify fix
# Check production site

# 7. Backport to develop
git checkout develop
git cherry-pick <commit-hash>
git push origin develop
```

### Scenario 3: Update Dependencies

```bash
# Option A: Automated (Recommended)
# 1. Trigger workflow manually
gh workflow run dependency-update.yml -f update_type=patch

# 2. Wait for PR to be created
# 3. Review and test the PR
# 4. Merge if all checks pass

# Option B: Manual
# 1. Check for updates
npm outdated

# 2. Update packages
npm update  # patch updates
# or
npx npm-check-updates -u --target minor  # minor updates
npm install

# 3. Test locally
npm test
npm run build

# 4. Commit and push
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push
```

### Scenario 4: Security Vulnerability

```bash
# 1. Check for vulnerabilities
npm audit

# 2. Review the report
npm audit --json > audit.json
cat audit.json

# 3. Attempt automatic fix
npm audit fix

# 4. For breaking changes
npm audit fix --force  # Use with caution!

# 5. Test after fixing
npm test
npm run build

# 6. Commit and deploy
git add .
git commit -m "fix: resolve security vulnerabilities"
git push origin main

# 7. Monitor workflow
# Security audit workflow runs automatically
```

### Scenario 5: Rollback Deployment

```bash
# Option A: Via Vercel Dashboard
# 1. Go to Vercel Dashboard
# 2. Select project > Deployments
# 3. Find previous working deployment
# 4. Click "Promote to Production"

# Option B: Via Git Revert
# 1. Find the problematic commit
git log --oneline

# 2. Revert the commit
git revert <commit-hash>

# 3. Push to trigger redeployment
git push origin main

# Option C: Via Release Tag
# 1. Find the last good release
git tag -l

# 2. Create rollback branch
git checkout -b hotfix/rollback-to-v1.0.0 v1.0.0

# 3. Push and create emergency PR
git push origin hotfix/rollback-to-v1.0.0
gh pr create --base main --title "fix: rollback to v1.0.0"
```

---

## Troubleshooting Commands

### Check Workflow Status

```bash
# List recent workflow runs
gh run list

# View specific workflow run
gh run view <run-id>

# View workflow logs
gh run view <run-id> --log

# Download workflow logs
gh run download <run-id>

# Re-run failed workflow
gh run rerun <run-id>

# Re-run failed jobs only
gh run rerun <run-id> --failed
```

### Debug Build Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Build with verbose logging
npm run build -- --debug

# Check TypeScript errors
npm run type-check

# Check for linting errors
npm run lint -- --debug
```

### Debug Deployment Issues

```bash
# Check Vercel deployment status
vercel --version
vercel login
vercel ls

# Check Vercel logs
vercel logs <deployment-url>

# Check Firebase deployment status
firebase --version
firebase login
firebase projects:list

# Check Firebase hosting
firebase hosting:channel:list
```

### Debug Git Issues

```bash
# Check git status
git status

# Check remote branches
git branch -r

# Check git log
git log --oneline --graph

# Force sync with remote
git fetch origin
git reset --hard origin/main  # Use with caution!

# Clean untracked files
git clean -fd
```

---

## Emergency Procedures

### Emergency: Production is Down

```bash
# 1. Immediately rollback via Vercel/Firebase dashboard
# See Scenario 5 above

# 2. Check status
curl -I https://your-production-url.com

# 3. Check recent deployments
gh run list --workflow=deploy-production.yml

# 4. Review error logs
gh run view <latest-run-id> --log

# 5. If needed, revert last commit
git revert HEAD
git push origin main

# 6. Notify team
# Use your communication channel
```

### Emergency: Security Breach Detected

```bash
# 1. Revoke compromised secrets immediately
# Go to GitHub Settings > Secrets and regenerate

# 2. Review recent access
gh api /repos/:owner/:repo/events

# 3. Run security scan
npm audit
git log --all --full-history --source -- '*secret*'

# 4. Check for exposed secrets
gh workflow run security.yml

# 5. Rotate all credentials
# Update all API keys, tokens, passwords

# 6. Deploy with new secrets
# Update secrets in GitHub, then redeploy
```

### Emergency: Failed Deployment Blocking Team

```bash
# 1. Check workflow status
gh run list --workflow=deploy-production.yml

# 2. Cancel stuck workflows
gh run cancel <run-id>

# 3. If workflow is broken, disable temporarily
gh workflow disable deploy-production.yml

# 4. Deploy manually via platform
vercel --prod  # For Vercel
firebase deploy --only hosting  # For Firebase

# 5. Fix workflow and re-enable
# Fix the issue, then:
gh workflow enable deploy-production.yml
```

### Emergency: Dependency Vulnerability

```bash
# 1. Check severity
npm audit

# 2. If critical, fix immediately
npm audit fix --force

# 3. Test quickly
npm test
npm run build

# 4. Emergency deploy
git add .
git commit -m "fix(security): patch critical vulnerability"
git push origin main

# 5. Monitor deployment
gh run watch
```

---

## Useful GitHub CLI Commands

```bash
# View PR status
gh pr status

# List open PRs
gh pr list

# View PR details
gh pr view <pr-number>

# Check out PR locally
gh pr checkout <pr-number>

# Review PR
gh pr review <pr-number> --approve
gh pr review <pr-number> --comment -b "Comments here"

# Create issue
gh issue create --title "Bug: something broke" --body "Details"

# List issues
gh issue list

# View workflow runs
gh run list --limit 10

# Watch workflow run
gh run watch

# View secrets (masked)
gh secret list
```

---

## Performance Tips

### Speed Up Local Development

```bash
# Use Turbopack (already configured)
npm run dev  # Uses --turbopack flag

# Clear cache if having issues
rm -rf .next/cache

# Use local node_modules cache
export NPM_CONFIG_CACHE=~/.npm-cache
```

### Speed Up CI/CD

1. **Cache is already configured** in workflows
2. **Parallel jobs** run automatically
3. **Concurrency control** cancels outdated runs

To further optimize:

```yaml
# In workflow files, ensure caching is used:
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # ✓ Already enabled
```

---

## Environment Variables Reference

### Local Development (.env.local)

```bash
# Application
NEXT_PUBLIC_APP_NAME=Lorenzo Dry Cleaners
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Firebase (if using)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### GitHub Secrets

```
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Firebase
FIREBASE_SERVICE_ACCOUNT_STAGING
FIREBASE_SERVICE_ACCOUNT_PRODUCTION
FIREBASE_PROJECT_ID

# Optional
SLACK_WEBHOOK_URL
GITGUARDIAN_API_KEY
```

---

## Useful Links

- **Repository Actions:** `https://github.com/YOUR_USERNAME/lorenzo-dry-cleaners/actions`
- **Repository Settings:** `https://github.com/YOUR_USERNAME/lorenzo-dry-cleaners/settings`
- **Vercel Dashboard:** `https://vercel.com/dashboard`
- **Firebase Console:** `https://console.firebase.google.com/`
- **GitHub CLI Docs:** `https://cli.github.com/manual/`

---

## Cheat Sheet

| Task | Command |
|------|---------|
| Run CI locally | `npm run lint && npm run type-check && npm run build && npm test` |
| Deploy to staging | Merge to `develop` branch |
| Deploy to production | Merge to `main` branch |
| Update dependencies | `gh workflow run dependency-update.yml` |
| Run security scan | `gh workflow run security.yml` |
| View workflow runs | `gh run list` |
| Cancel workflow | `gh run cancel <run-id>` |
| Create PR | `gh pr create` |
| Merge PR | `gh pr merge` |
| Rollback | Revert commit or promote previous deployment |

---

**Keep this reference handy for quick access to common operations!**

**Last Updated:** 2025-10-10
