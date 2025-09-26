// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const DataService = require('./services/dataService');
const SSEManager = require('./services/SSEManager');
const NotificationScheduler = require('./services/notificationScheduler');

console.log('='.repeat(80));
console.log('🚀 TRAFIKKVAKT SERVER STARTING - WITH AZURE INTEGRATION 🚀');
console.log('🔥 DEPLOYMENT TEST - VERSION 2025-09-24-14:15:00-DUTIES-PUT-AND-AUTOFILL 🔥');
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
let sseManager = null;
let notificationScheduler = null;
try {
  dataService = new DataService();
  console.log('DataService created successfully');
  
  // Wait a bit for DataService to initialize
  setTimeout(async () => {
    try {
      if (!dataService.initialized) {
        console.warn('DataService taking longer than expected to initialize...');
        // Wait a bit more for Azure to initialize
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      if (!dataService.isAzureAvailable()) {
        console.error('❌ CRITICAL ERROR: Azure Table Storage is not available!');
        console.error('Please check your AZURE_STORAGE_CONNECTION_STRING and AZURE_TABLE_NAME environment variables.');
        console.error('Application requires Azure Table Storage to function properly.');
      } else {
        console.log('✅ Azure Table Storage is available and ready');
      }
    } catch (error) {
      console.error('Error checking Azure availability:', error);
    }
  }, 2000);
  
  try {
    sseManager = new SSEManager();
    console.log('SSEManager created successfully');
  } catch (sseError) {
    console.error('SSEManager creation failed:', sseError);
    console.log('Continuing without real-time updates...');
  }
  
  // Initialize notification scheduler
  try {
    notificationScheduler = new NotificationScheduler(dataService);
    console.log('NotificationScheduler created successfully');
  } catch (notificationError) {
    console.error('NotificationScheduler creation failed:', notificationError);
    console.log('Continuing without notifications...');
  }
} catch (error) {
  console.error('❌ CRITICAL ERROR: DataService creation failed:', error);
  console.error('Application will not function properly without DataService!');
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

// Set scheduler instance for routes
if (notificationScheduler) {
  app.set('notificationScheduler', notificationScheduler);
}

// Set dataService for routes
if (dataService) {
  app.set('dataService', dataService);
}

// WhatsApp Business and notification routes
const whatsappBusinessRoutes = require('./routes/whatsappBusiness');
const notificationRoutes = require('./routes/notifications');

app.use('/api/whatsapp-business', whatsappBusinessRoutes);
app.use('/api/notifications', notificationRoutes);

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
    deploymentTest: 'v2025-09-24-13:10:00-FRONTEND-STATIC-FILES-FIXED',
    pid: process.pid,
    ...azureDebug
  });
});

// Data version endpoint for change tracking
let lastDataUpdate = new Date().toISOString();

app.get('/api/data-version', (req, res) => {
  res.json({ 
    lastUpdate: lastDataUpdate,
    timestamp: new Date().toISOString()
  });
});

// Server-Sent Events endpoint for real-time updates
app.get('/api/events', (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  let client = null;
  try {
    client = sseManager ? sseManager.addClient(res) : null;
    console.log('SSE client connected');
  } catch (error) {
    console.error('Error adding SSE client:', error);
    res.write(`data: ${JSON.stringify({type: 'error', message: 'Failed to connect'})}\n\n`);
  }

  // Handle client disconnect
  req.on('close', () => {
    if (client && sseManager) {
      try {
        sseManager.removeClient(client);
      } catch (error) {
        console.error('Error removing SSE client:', error);
      }
    }
    console.log('SSE client disconnected');
  });

  req.on('aborted', () => {
    if (client && sseManager) {
      try {
        sseManager.removeClient(client);
      } catch (error) {
        console.error('Error removing SSE client on abort:', error);
      }
    }
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
    console.log('Azure Available:', dataService ? dataService.isAzureAvailable() : 'N/A');
    console.log('=======================');
    
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    const duties = await dataService.getDuties();
    console.log('Duties retrieved from Azure Table Storage');
    res.json(duties);
  } catch (error) {
    console.error('Error getting duties:', error);
    res.status(500).json({ error: 'Failed to read duties data from Azure Table Storage' });
  }
});

app.get('/api/children', async (req, res) => {
  try {
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    const children = await dataService.getChildren();
    console.log(`Children API called - Node version: ${process.version}`);
    res.json(children);
  } catch (error) {
    console.error('Error getting children:', error);
    res.status(500).json({ error: 'Failed to read children data from Azure Table Storage' });
  }
});

app.get('/api/crossings', async (req, res) => {
  try {
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    const crossings = await dataService.getCrossings();
    res.json(crossings);
  } catch (error) {
    console.error('Error getting crossings:', error);
    res.status(500).json({ error: 'Failed to read crossings data from Azure Table Storage' });
  }
});

// Update duties
app.put('/api/duties', async (req, res) => {
  try {
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    await dataService.storeDuties(req.body);
    lastDataUpdate = new Date().toISOString();
    console.log('Duties updated successfully via Azure Table Storage');
    
    // Broadcast real-time update to all connected clients
    if (sseManager) {
      try {
        sseManager.notifyDutyUpdate({
          type: 'duties-updated',
          data: req.body,
          timestamp: lastDataUpdate
        });
      } catch (broadcastError) {
        console.error('Error broadcasting SSE update:', broadcastError);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving duties:', error);
    res.status(500).json({ error: 'Failed to save duties to Azure Table Storage' });
  }
});

// Auto-fill duties endpoint
app.post('/api/duties/auto-fill', async (req, res) => {
  try {
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    // Get current configuration
    const children = await dataService.getChildren();
    const crossings = await dataService.getCrossings();
    
    if (!children || !crossings) {
      return res.status(400).json({ error: 'Missing children or crossings data' });
    }
    
    const childrenList = children.children || [];
    const crossingsList = crossings.crossings || [];
    const days = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag'];
    
    if (childrenList.length === 0 || crossingsList.length === 0) {
      return res.status(400).json({ error: 'No children or crossings available for auto-fill' });
    }
    
    // Create shuffled array of children for fair distribution
    const shuffledChildren = [...childrenList].sort(() => Math.random() - 0.5);
    let childIndex = 0;
    
    const newDuties = { duties: {} };
    const distribution = {};
    
    // Auto-fill duties
    for (const crossing of crossingsList) {
      newDuties.duties[crossing.name] = {};
      
      for (const day of days) {
        const child = shuffledChildren[childIndex % shuffledChildren.length];
        newDuties.duties[crossing.name][day] = child;
        
        // Track distribution
        distribution[child] = (distribution[child] || 0) + 1;
        
        childIndex++;
      }
    }
    
    // Clear audit log when auto-fill is performed
    if (dataService) {
      try {
        await dataService.clearAuditLog();
        console.log('Audit log cleared after auto-fill');
      } catch (error) {
        console.error('Error clearing audit log after auto-fill:', error);
      }
    }
    
    // Save the auto-filled duties
    await dataService.storeDuties(newDuties);
    lastDataUpdate = new Date().toISOString();
    console.log('Auto-fill completed successfully via Azure Table Storage');
    
    // Broadcast real-time update to all connected clients
    if (sseManager) {
      sseManager.notifyDutyUpdate({
        type: 'duties-auto-filled',
        data: newDuties,
        timestamp: lastDataUpdate
      });
    }
    
    res.json({ success: true, distribution, duties: newDuties });
  } catch (error) {
    console.error('Error during auto-fill:', error);
    res.status(500).json({ error: 'Failed to auto-fill duties in Azure Table Storage' });
  }
});

// Update children
app.put('/api/children', async (req, res) => {
  try {
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    await dataService.storeChildren(req.body);
    console.log('Children updated successfully via Azure Table Storage');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving children:', error);
    res.status(500).json({ error: 'Failed to save children to Azure Table Storage' });
  }
});

// Update crossings
app.put('/api/crossings', async (req, res) => {
  try {
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    await dataService.storeCrossings(req.body);
    console.log('Crossings updated successfully via Azure Table Storage');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving crossings:', error);
    res.status(500).json({ error: 'Failed to save crossings to Azure Table Storage' });
  }
});

// Get schedule data
app.get('/api/schedule', async (req, res) => {
  try {
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    const schedule = await dataService.getSchedule();
    res.json(schedule);
  } catch (error) {
    console.error('Error getting schedule:', error);
    res.status(500).json({ error: 'Failed to read schedule data from Azure Table Storage' });
  }
});

// Update schedule
app.put('/api/schedule', async (req, res) => {
  try {
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    await dataService.storeSchedule(req.body);
    console.log('Schedule updated successfully via Azure Table Storage');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({ error: 'Failed to save schedule to Azure Table Storage' });
  }
});

// Get audit log
app.get('/api/audit-log', async (req, res) => {
  try {
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    const auditLog = await dataService.getAuditLog();
    res.json(auditLog);
  } catch (error) {
    console.error('Error getting audit log:', error);
    res.status(500).json({ error: 'Failed to read audit log from Azure Table Storage' });
  }
});

// Add audit log entry
app.post('/api/audit-log', async (req, res) => {
  try {
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    await dataService.storeAuditLogEntry(req.body);
    console.log('Audit log entry stored successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error storing audit log entry:', error);
    res.status(500).json({ error: 'Failed to store audit log entry to Azure Table Storage' });
  }
});

// Clear audit log
app.delete('/api/audit-log', async (req, res) => {
  try {
    if (!dataService) {
      return res.status(500).json({ error: 'Data service not available' });
    }
    
    await dataService.clearAuditLog();
    console.log('Audit log cleared successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing audit log:', error);
    res.status(500).json({ error: 'Failed to clear audit log in Azure Table Storage' });
  }
});

// Serve static files from client build in production
if (isProduction) {
  console.log('Setting up static file serving...');
  console.log('Server running from:', __dirname);
  console.log('Looking for client files at:', path.join(__dirname, '../../client'));
  
  // Static files are at ../../client relative to server/src/
  app.use(express.static(path.join(__dirname, '../../client')));
  
  // Serve React app for all other routes
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../../client/index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
  });
}

console.log('Server setup complete with Azure integration!');

// Initialize notification services after server is fully set up
setTimeout(async () => {
  try {
    console.log('Initializing notification services...');
    
    // Start notification scheduler if enabled
    if (notificationScheduler && process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true') {
      console.log('Starting notification scheduler...');
      notificationScheduler.start();
    }
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing services:', error);
  }
}, 5000); // Wait 5 seconds for server to be fully ready

module.exports = app;