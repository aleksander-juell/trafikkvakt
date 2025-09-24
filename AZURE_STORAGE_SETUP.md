# Azure Table Storage Configuration for Trafikkvakt

To enable Azure Table Storage for persistent data storage, you need to set the following environment variables in your Azure App Service:

## Required Environment Variables

### Azure Storage Connection String
```
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your-storage-account;AccountKey=your-account-key;EndpointSuffix=core.windows.net
```

### Table Name (Optional)
```
AZURE_TABLE_NAME=trafikkvakt
```

## How to Set Environment Variables in Azure App Service

1. Go to Azure Portal
2. Navigate to your App Service (trafikkvakt)
3. Go to Settings > Configuration
4. Click "New application setting"
5. Add the environment variables listed above

## Storage Account Setup

If you don't have an Azure Storage Account yet:

1. Create a new Storage Account in your resource group
2. Go to Access Keys section
3. Copy the connection string
4. Add it to your App Service configuration

## Fallback Behavior

If the Azure Storage connection string is not found, the application will automatically fall back to using local JSON files for data persistence. This ensures the application works both locally (development) and in Azure (production with persistence).