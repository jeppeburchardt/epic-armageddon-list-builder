# PR Preview Environments

This repository is configured to automatically deploy preview environments for pull requests using Surge.sh.

## How It Works

### Deployment Workflow (`preview-deploy.yml`)

When a pull request is opened, updated, or reopened, the workflow:

1. **Builds the application** - Runs `npm ci` and `npm run build`
2. **Deploys to Surge** - Creates a unique subdomain for the PR in the format `pr-{PR_NUMBER}-{BASE_DOMAIN}`
3. **Comments on the PR** - Posts (or updates) a comment with the preview URL

**Example:** For PR #42 with `SURGE_DOMAIN` set to `my-app.surge.sh`, the preview will be deployed to `pr-42-my-app.surge.sh`

### Cleanup Workflow (`preview-cleanup.yml`)

When a pull request is closed (merged or not), the workflow:

1. **Tears down the deployment** - Runs `surge teardown` to remove the preview environment
2. **Comments on the PR** - Posts a comment confirming the cleanup

## Required Configuration

### Secrets

The following secret must be configured in your GitHub repository settings:

- `SURGE_TOKEN` - Your Surge authentication token
  - Get your token by running `surge token` in your terminal after logging in with `surge login`
  - Add it in: Repository Settings → Secrets and variables → Actions → New repository secret

### Variables

The following variable must be configured in your GitHub repository settings:

- `SURGE_DOMAIN` - Your base Surge domain (e.g., `my-app.surge.sh`)
  - This can include or exclude the `https://` protocol - the workflow handles both
  - Add it in: Repository Settings → Secrets and variables → Actions → Variables tab → New repository variable

## Benefits

- ✅ **Automatic deployments** - No manual intervention required
- ✅ **Unique URLs** - Each PR gets its own isolated preview environment
- ✅ **Easy testing** - Reviewers can test changes before merging
- ✅ **Automatic cleanup** - Preview environments are removed when PRs are closed
- ✅ **Smart commenting** - Updates existing comments instead of spamming new ones

## Testing Locally

To test the build and deployment process locally:

```bash
# Build the application
npm ci
npm run build

# Deploy to Surge (requires surge CLI)
npm install -g surge
surge dist your-test-domain.surge.sh
```

## Troubleshooting

### Workflow fails with "SURGE_TOKEN not found"
- Make sure you've added the `SURGE_TOKEN` secret in your repository settings
- The token must be a valid Surge authentication token

### Workflow fails with "SURGE_DOMAIN not found"
- Make sure you've added the `SURGE_DOMAIN` variable in your repository settings
- The domain should be your base Surge domain without the PR prefix

### Preview URL doesn't work
- Check that the deployment step completed successfully in the workflow logs
- Verify that the domain format is correct (e.g., `pr-123-my-app.surge.sh`)
- Make sure your Surge account has sufficient permissions
