# Traffic Warden Duty Management System

A web-based application for managing traffic warden duties at school crossings.

## Features

- **Crossing Management**: Add and manage traffic crossings
- **Parent/Child Registration**: Register families and their children
- **Weekly Duty Assignment**: Assign parents to crossings for specific weeks
- **Duty Swapping**: Allow parents to swap duties between themselves
- **Automated Scheduling**: Generate initial duty proposals based on availability
- **Audit Log**: Track all duty swaps and moves with detailed logging
- **Auto-Fill with Log Reset**: Automatically clear audit log when generating new duty assignments

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: Azure Table Storage
- **Additional**: Real-time updates via Server-Sent Events

## Deployment

### Azure App Service

The application is deployed to Azure App Service with the following setup:

1. **Build and Deploy**:
   ```powershell
   .\deploy.ps1
   ```
   This script will:
   - Build the React client
   - Package the application
   - Deploy using modern Azure CLI
   - Automatically restart the service

2. **Manual Deployment** (if needed):
   ```bash
   # Build client
   cd client && npm run build && cd ..
   
   # Deploy to Azure
   az webapp deploy --resource-group trafikkvakt-rg --name trafikkvakt --src-path deploy.zip --type zip
   ```

3. **Configuration**:
   - Node.js version: 22-lts
   - Startup command: `npm start`
   - Environment: Production
   - **Required Environment Variables**:
     - `AZURE_STORAGE_CONNECTION_STRING`: Azure Storage connection string
     - `AZURE_TABLE_NAME`: Name of the Azure table for data storage

### Environment Variables

The application requires Azure Table Storage to be configured:

```bash
AZURE_STORAGE_CONNECTION_STRING=<your-connection-string>
AZURE_TABLE_NAME=<your-table-name>
```

Without these environment variables, the application will not function.

## Development

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm
- Azure Storage Account with Table Storage enabled

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd trafikkvakt
   ```

2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Configure Azure Table Storage:
   - Create an Azure Storage Account
   - Get the connection string
   - Set environment variables:
     ```bash
     # Create .env file in server directory
     AZURE_STORAGE_CONNECTION_STRING=your_connection_string
     AZURE_TABLE_NAME=trafikkvakt
     ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
trafikkvakt/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── server/          # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/    # Azure Table Storage service
│   │   └── index.js     # Main server file
│   └── package.json
└── package.json     # Root package.json
```

## Usage

1. **Add Crossings**: Navigate to the Crossings page to add traffic crossing locations
2. **Register Families**: Add parent and child information
3. **Create Weekly Schedule**: Generate duty assignments for a specific week
4. **Manage Duties**: View, edit, and swap duties as needed
5. **Track Changes**: View the audit log in the Configuration page to see all duty swaps and moves

### Audit Log Feature

The system includes comprehensive audit logging for duty changes:

- **Automatic Tracking**: All duty swaps and moves are automatically logged
- **Detailed Information**: Each log entry shows which children were affected, the positions involved, and when it happened
- **View History**: Access the audit log from the Configuration page
- **Auto-Clear**: The log is automatically cleared when using the auto-fill feature for a fresh start
- **Manual Clear**: Option to manually clear the log if needed

For detailed documentation about the audit log feature, see [AUDIT_LOG_DOCUMENTATION.md](AUDIT_LOG_DOCUMENTATION.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT