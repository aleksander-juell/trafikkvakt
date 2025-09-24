// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const DataService = require('./services/dataService');

console.log('='.repeat(80));
console.log('🚀 TRAFIKKVAKT SERVER STARTING - WITH AZURE INTEGRATION 🚀');
console.log('🔥 DEPLOYMENT TEST - VERSION 2025-09-24-13:00:00 🔥');
console.log('='.repeat(80));
console.log('Node.js version:', process.version);
console.log('Process PID:', process.pid);
console.log('Working directory:', process.cwd());
console.log('Environment variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', process.env.PORT);
console.log('  AZURE_STORAGE_CONNECTION_STRING:', process.env.AZURE_STORAGE_CONNECTION_STRING ? `PRESENT (${process.env.AZURE_STORAGE_CONNECTION_STRING.length} chars)` : 'MISSING');
console.log('  AZURE_TABLE_NAME:', process.env.AZURE_TABLE_NAME || 'NOT SET');
console.log('='.repeat(80));

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Start the server immediately
console.log('Starting server with Azure integration...');
app.listen(PORT, () => {
  console.log('='.repeat(80));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`🔑 Azure Connection String:`, process.env.AZURE_STORAGE_CONNECTION_STRING ? 'PRESENT' : 'MISSING');
  console.log(`🔑 Azure Connection String Length:`, process.env.AZURE_STORAGE_CONNECTION_STRING ? process.env.AZURE_STORAGE_CONNECTION_STRING.length : 0);
  console.log('='.repeat(80));
});

// Create DataService after server starts
console.log('Creating DataService with Azure integration...');
let dataService = null;
try {
  dataService = new DataService();
  console.log('DataService created successfully');
} catch (error) {
  console.error('DataService creation failed:', error);
}

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'development' || !origin) {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'https://trafikkvakt.azurewebsites.net',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Enhanced health endpoint with Azure diagnostics
app.get('/api/health', (req, res) => {
  const azureDebug = {
    connectionStringPresent: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
    connectionStringLength: process.env.AZURE_STORAGE_CONNECTION_STRING ? process.env.AZURE_STORAGE_CONNECTION_STRING.length : 0,
    tableName: process.env.AZURE_TABLE_NAME || 'trafikkvakt',
    dataServiceInitialized: dataService ? dataService.initialized : false,
    dataServiceUseAzure: dataService ? dataService.useAzure : false
  };

  console.log('Health endpoint called - Azure debug:', azureDebug);

  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    port: PORT || process.env.PORT || '8080',
    nodeVersion: process.version,
    environment: isProduction ? 'production' : 'development',
    deploymentTest: 'v2025-09-24-13:00:00-AZURE-INTEGRATION-FIXED',
    pid: process.pid,
    ...azureDebug
  });
});

// API Routes
app.get('/api/duties', async (req, res) => {
  try {
    console.log('=== DUTIES API DEBUG ===');
    console.log('Azure Connection String present:', !!process.env.AZURE_STORAGE_CONNECTION_STRING);
    console.log('Table name:', process.env.AZURE_TABLE_NAME);
    console.log('DataService exists:', !!dataService);
    console.log('DataService initialized:', dataService ? dataService.initialized : 'N/A');
    console.log('Using Azure Storage:', dataService ? dataService.useAzure : 'N/A');
    console.log('=======================');
    
    const duties = dataService ? await dataService.getDuties() : null;
    if (duties) {
      console.log(`Duties retrieved using ${dataService.useAzure ? 'Azure Table Storage' : 'JSON fallback'}`);
      res.json(duties);
    } else {
      // Fallback to direct file read
      const dutiesPath = path.join(__dirname, '../../config/duties.json');
      if (fs.existsSync(dutiesPath)) {
        const dutiesData = JSON.parse(fs.readFileSync(dutiesPath, 'utf8'));
        console.log('Duties retrieved using direct file fallback');
        res.json(dutiesData);
      } else {
        res.status(500).json({ error: 'Failed to read duties data' });
      }
    }
  } catch (error) {
    console.error('Error getting duties:', error);
    res.status(500).json({ error: 'Failed to read duties data' });
  }
});

app.get('/api/children', async (req, res) => {
  try {
    const children = dataService ? await dataService.getChildren() : null;
    if (children) {
      console.log(`Children API called - Node version: ${process.version}`);
      res.json(children);
    } else {
      const childrenPath = path.join(__dirname, '../../config/children.json');
      if (fs.existsSync(childrenPath)) {
        const childrenData = JSON.parse(fs.readFileSync(childrenPath, 'utf8'));
        console.log('Children retrieved using direct file fallback');
        res.json(childrenData);
      } else {
        res.status(500).json({ error: 'Failed to read children data' });
      }
    }
  } catch (error) {
    console.error('Error getting children:', error);
    res.status(500).json({ error: 'Failed to read children data' });
  }
});

app.get('/api/crossings', async (req, res) => {
  try {
    const crossings = dataService ? await dataService.getCrossings() : null;
    if (crossings) {
      res.json(crossings);
    } else {
      const crossingsPath = path.join(__dirname, '../../config/crossings.json');
      if (fs.existsSync(crossingsPath)) {
        const crossingsData = JSON.parse(fs.readFileSync(crossingsPath, 'utf8'));
        console.log('Crossings retrieved using direct file fallback');
        res.json(crossingsData);
      } else {
        res.status(500).json({ error: 'Failed to read crossings data' });
      }
    }
  } catch (error) {
    console.error('Error getting crossings:', error);
    res.status(500).json({ error: 'Failed to read crossings data' });
  }
});

// Update duties
app.post('/api/duties', async (req, res) => {
  try {
    if (dataService) {
      const success = await dataService.saveDuties(req.body);
      if (success) {
        console.log('Duties updated successfully via DataService (Azure or JSON)');
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to save duties via DataService' });
      }
    } else {
      // Fallback to direct file write
      const dutiesPath = path.join(__dirname, '../../config/duties.json');
      fs.writeFileSync(dutiesPath, JSON.stringify(req.body, null, 2));
      console.log('Duties updated successfully via direct file write');
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error saving duties:', error);
    res.status(500).json({ error: 'Failed to save duties' });
  }
});

// Serve static files from client build in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../client')));
  
  // Serve React app for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  });
}

console.log('Server setup complete with Azure integration!');
module.exports = app;