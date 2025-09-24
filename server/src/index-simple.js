// Simple test endpoint to verify deployment
const express = require('express');
const cors = require('cors');

console.log('=== SIMPLE TEST SERVER STARTING ===');
console.log('Environment variables:');
console.log('  AZURE_STORAGE_CONNECTION_STRING:', process.env.AZURE_STORAGE_CONNECTION_STRING ? 'PRESENT' : 'MISSING');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Minimal health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    deploymentTest: 'SIMPLE-TEST-VERSION-2025-09-24-12:45',
    azureEnvVar: process.env.AZURE_STORAGE_CONNECTION_STRING ? 'PRESENT' : 'MISSING',
    azureEnvVarLength: process.env.AZURE_STORAGE_CONNECTION_STRING ? process.env.AZURE_STORAGE_CONNECTION_STRING.length : 0
  });
});

// Simple duties endpoint
app.get('/api/duties', (req, res) => {
  res.json({ 
    duties: { 
      'Test': 'Simple deployment test' 
    }
  });
});

app.listen(PORT, () => {
  console.log(`=== SIMPLE TEST SERVER RUNNING ON PORT ${PORT} ===`);
});

console.log('=== SERVER SETUP COMPLETE ===');