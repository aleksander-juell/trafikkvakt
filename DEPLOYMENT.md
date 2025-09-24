# Deployment Guide

## Quick Deployment

To deploy the application to Azure App Service:

```powershell
.\deploy.ps1
```

This will:
1. Build the React client
2. Create deployment package
3. Deploy to Azure using modern Azure CLI
4. Automatically restart the service

## Requirements

- Azure CLI installed and authenticated
- Node.js and npm for building the client

## App Service Configuration

- **Resource Group**: `trafikkvakt-rg`
- **App Name**: `trafikkvakt`
- **Runtime**: Node.js 22-lts
- **Startup Command**: `npm start`

## Troubleshooting

If deployment fails:
1. Ensure Azure CLI is authenticated: `az login`
2. Check the deployment package exists: `deploy.zip`
3. Verify app service is running: `az webapp show -g trafikkvakt-rg -n trafikkvakt`

## Alternative Deployment Methods

### GitHub Actions (Recommended for CI/CD)

See `.github/workflows/azure-deploy.yml` for automated deployment setup.

### VS Code Extension

Install the Azure App Service extension for direct deployment from VS Code:
- Extension ID: `ms-azuretools.vscode-azureappservice`