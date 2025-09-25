# Azure WhatsApp Configuration Script
Write-Host "Configuring WhatsApp Business API environment variables..." -ForegroundColor Green

# Set environment variables one by one
Write-Host "Setting WHATSAPP_ACCESS_TOKEN..." -ForegroundColor Yellow
az webapp config appsettings set `
    --resource-group trafikkvakt-rg `
    --name trafikkvakt `
    --settings "WHATSAPP_ACCESS_TOKEN=EAASorX84CboBPnAc9yJcaZBQmmJbSB17BnigHe2J7p4B4Y7iN0sdLsbspIe9KIGxxsYhmZABsl5xD19ofqWkkZBs2GVIBUFNCydJ4ZBNWpYB1Xi2xNVH8PvYIGohrNRoJOjlRpuLcaOe2zESZAM71Bmn24WVvZAY6XE7JeA8PNcBXOVeOlRMHXT9AS7N6ZBdYdSQSepo1eo" | Out-Null

Write-Host "Setting WHATSAPP_PHONE_NUMBER_ID..." -ForegroundColor Yellow
az webapp config appsettings set `
    --resource-group trafikkvakt-rg `
    --name trafikkvakt `
    --settings "WHATSAPP_PHONE_NUMBER_ID=885454024647016" | Out-Null

Write-Host "Setting WHATSAPP_BUSINESS_ACCOUNT_ID..." -ForegroundColor Yellow
az webapp config appsettings set `
    --resource-group trafikkvakt-rg `
    --name trafikkvakt `
    --settings "WHATSAPP_BUSINESS_ACCOUNT_ID=y1315668579498321" | Out-Null

Write-Host "Setting WHATSAPP_RECIPIENT_NUMBER..." -ForegroundColor Yellow
az webapp config appsettings set `
    --resource-group trafikkvakt-rg `
    --name trafikkvakt `
    --settings "WHATSAPP_RECIPIENT_NUMBER=+4798407708" | Out-Null

Write-Host "Restarting app service..." -ForegroundColor Yellow
az webapp restart --resource-group trafikkvakt-rg --name trafikkvakt

Write-Host "✓ WhatsApp configuration completed!" -ForegroundColor Green
Write-Host "✓ App service restarted" -ForegroundColor Green
Write-Host "Your app is available at: https://trafikkvakt.azurewebsites.net" -ForegroundColor Cyan