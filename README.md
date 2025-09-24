# Traffic Warden Duty Management System

A web-based application for managing traffic warden duties at school crossings.

## Features

- **Crossing Management**: Add and manage traffic crossings
- **Parent/Child Registration**: Register families and their children
- **Weekly Duty Assignment**: Assign parents to crossings for specific weeks
- **Duty Swapping**: Allow parents to swap duties between themselves
- **Automated Scheduling**: Generate initial duty proposals based on availability

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Additional**: Prisma ORM for database management

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

### Environment Variables

No additional environment variables are required for basic operation.

## Development

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm

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

3. Set up the database:
   ```bash
   cd server
   npx prisma migrate dev
   cd ..
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
│   │   ├── models/
│   │   ├── controllers/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
└── package.json     # Root package.json
```

## Usage

1. **Add Crossings**: Navigate to the Crossings page to add traffic crossing locations
2. **Register Families**: Add parent and child information
3. **Create Weekly Schedule**: Generate duty assignments for a specific week
4. **Manage Duties**: View, edit, and swap duties as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT