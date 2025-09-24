# Modern PowerShell script for Azure App Service deployment

Write-Host "Creating Azure deployment package..." -ForegroundColor Green

# Ensure client is built
Write-Host "Building client application..." -ForegroundColor Yellow
Set-Location "client"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Client build failed!"
    exit 1
}
Set-Location ".."

# Create temporary deployment directory
$deployDir = "temp_deploy"
Write-Host "Preparing deployment files..." -ForegroundColor Yellow

if (Test-Path $deployDir) { 
    Remove-Item $deployDir -Recurse -Force 
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy necessary files and directories
Write-Host "Copying files..." -ForegroundColor Yellow
Copy-Item -Path "client/dist" -Destination "$deployDir/client" -Recurse
Copy-Item -Path "server/src" -Destination "$deployDir/server/src" -Recurse
Copy-Item -Path "server/package.json" -Destination "$deployDir/server/"
Copy-Item -Path "server/package-lock.json" -Destination "$deployDir/server/" -ErrorAction SilentlyContinue
Copy-Item -Path "config" -Destination "$deployDir/" -Recurse -ErrorAction SilentlyContinue

# Create a proper deployment package.json
Write-Host "Creating deployment package.json..." -ForegroundColor Yellow
$deployPackageJson = @{
    name = "trafikkvakt"
    version = "1.0.0"
    description = "Traffic warden duty management system"
    main = "server/src/index.js"
    scripts = @{
        start = "cd server && npm install --production && cd .. && node server/src/index.js"
        build = "echo 'Build completed'"
    }
    engines = @{
        node = ">=20.0.0"
        npm = ">=8.0.0"
    }
} | ConvertTo-Json -Depth 3
$deployPackageJson | Out-File -FilePath "$deployDir/package.json" -Encoding UTF8

# Create the zip file
Write-Host "Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "deploy.zip") {
    Remove-Item "deploy.zip" -Force
}
Compress-Archive -Path "$deployDir/*" -DestinationPath "deploy.zip" -Force

# Deploy using modern Azure CLI
Write-Host "Deploying to Azure App Service..." -ForegroundColor Yellow
az webapp deploy --resource-group trafikkvakt-rg --name trafikkvakt --src-path deploy.zip --type zip

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Deployment successful!" -ForegroundColor Green
    
    # Clean up temporary directory
    Remove-Item $deployDir -Recurse -Force
    
    Write-Host "✓ Deployment package created and deployed successfully" -ForegroundColor Green
    Write-Host "Your app is available at: https://trafikkvakt.azurewebsites.net" -ForegroundColor Cyan
} else {
    Write-Error "Deployment failed!"
    # Keep temp directory for debugging
}