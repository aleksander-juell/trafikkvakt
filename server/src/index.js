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
app.put('/api/duties', async (req, res) => {
  try {
    if (dataService) {
      const success = await dataService.storeDuties(req.body);
      if (success) {
        lastDataUpdate = new Date().toISOString();
        console.log('Duties updated successfully via DataService (Azure or JSON)');
        
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
      } else {
        res.status(500).json({ error: 'Failed to save duties via DataService' });
      }
    } else {
      // Fallback to direct file write
      const dutiesPath = path.join(__dirname, '../../config/duties.json');
      fs.writeFileSync(dutiesPath, JSON.stringify(req.body, null, 2));
      lastDataUpdate = new Date().toISOString();
      console.log('Duties updated successfully via direct file write');
      
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
    }
  } catch (error) {
    console.error('Error saving duties:', error);
    res.status(500).json({ error: 'Failed to save duties' });
  }
});

// Auto-fill duties endpoint
app.post('/api/duties/auto-fill', async (req, res) => {
  try {
    // Get current configuration
    const children = dataService ? await dataService.getChildren() : null;
    const crossings = dataService ? await dataService.getCrossings() : null;
    
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
    
    // Save the auto-filled duties
    if (dataService) {
      const success = await dataService.storeDuties(newDuties);
      if (success) {
        lastDataUpdate = new Date().toISOString();
        console.log('Auto-fill completed successfully via DataService');
        
        // Broadcast real-time update to all connected clients
        if (sseManager) {
          sseManager.notifyDutyUpdate({
            type: 'duties-auto-filled',
            data: newDuties,
            timestamp: lastDataUpdate
          });
        }
        
        res.json({ success: true, distribution, duties: newDuties });
      } else {
        res.status(500).json({ error: 'Failed to save auto-filled duties' });
      }
    } else {
      // Fallback to direct file write
      const dutiesPath = path.join(__dirname, '../../config/duties.json');
      fs.writeFileSync(dutiesPath, JSON.stringify(newDuties, null, 2));
      lastDataUpdate = new Date().toISOString();
      console.log('Auto-fill completed successfully via direct file write');
      
      // Broadcast real-time update to all connected clients
      if (sseManager) {
        sseManager.notifyDutyUpdate({
          type: 'duties-auto-filled',
          data: newDuties,
          timestamp: lastDataUpdate
        });
      }
      
      res.json({ success: true, distribution, duties: newDuties });
    }
  } catch (error) {
    console.error('Error during auto-fill:', error);
    res.status(500).json({ error: 'Failed to auto-fill duties' });
  }
});

// Update children
app.put('/api/children', async (req, res) => {
  try {
    if (dataService) {
      const success = await dataService.storeChildren(req.body);
      if (success) {
        console.log('Children updated successfully via DataService (Azure or JSON)');
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to save children via DataService' });
      }
    } else {
      // Fallback to direct file write
      const childrenPath = path.join(__dirname, '../../config/children.json');
      fs.writeFileSync(childrenPath, JSON.stringify(req.body, null, 2));
      console.log('Children updated successfully via direct file write');
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error saving children:', error);
    res.status(500).json({ error: 'Failed to save children' });
  }
});

// Update crossings
app.put('/api/crossings', async (req, res) => {
  try {
    if (dataService) {
      const success = await dataService.storeCrossings(req.body);
      if (success) {
        console.log('Crossings updated successfully via DataService (Azure or JSON)');
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to save crossings via DataService' });
      }
    } else {
      // Fallback to direct file write
      const crossingsPath = path.join(__dirname, '../../config/crossings.json');
      fs.writeFileSync(crossingsPath, JSON.stringify(req.body, null, 2));
      console.log('Crossings updated successfully via direct file write');
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error saving crossings:', error);
    res.status(500).json({ error: 'Failed to save crossings' });
  }
});

// Get schedule data
app.get('/api/schedule', async (req, res) => {
  try {
    const schedule = dataService ? await dataService.getSchedule() : null;
    if (schedule) {
      res.json(schedule);
    } else {
      const schedulePath = path.join(__dirname, '../../config/schedule.json');
      if (fs.existsSync(schedulePath)) {
        const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
        console.log('Schedule retrieved using direct file fallback');
        res.json(scheduleData);
      } else {
        res.status(500).json({ error: 'Failed to read schedule data' });
      }
    }
  } catch (error) {
    console.error('Error getting schedule:', error);
    res.status(500).json({ error: 'Failed to read schedule data' });
  }
});

// Update schedule
app.put('/api/schedule', async (req, res) => {
  try {
    if (dataService) {
      const success = await dataService.storeSchedule(req.body);
      if (success) {
        console.log('Schedule updated successfully via DataService (Azure or JSON)');
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to save schedule via DataService' });
      }
    } else {
      // Fallback to direct file write
      const schedulePath = path.join(__dirname, '../../config/schedule.json');
      fs.writeFileSync(schedulePath, JSON.stringify(req.body, null, 2));
      console.log('Schedule updated successfully via direct file write');
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({ error: 'Failed to save schedule' });
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