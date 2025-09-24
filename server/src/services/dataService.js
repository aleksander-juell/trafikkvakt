const fs = require('fs');
const path = require('path');
const AzureTableService = require('./azureTableService');

class DataService {
  constructor() {
    console.log('=== INITIALIZING DATA SERVICE ===');
    this.azureService = new AzureTableService();
    this.useAzure = false; // Start with false, will be set after async init
    this.initialized = false;
    
    // Initialize asynchronously
    this.initialize();
  }
  
  async initialize() {
    try {
      // Wait for Azure service to fully initialize
      await this.waitForAzureInit();
      this.useAzure = this.azureService.isAvailable();
      
      console.log('Data service initialized. Azure enabled:', this.useAzure);
      
      if (this.useAzure) {
        console.log('Using Azure Table Storage for data persistence');
      } else {
        console.log('Using local JSON files for data persistence (fallback mode)');
      }
    } catch (error) {
      console.error('Failed to initialize Azure storage:', error);
      this.useAzure = false;
      console.log('Using local JSON files for data persistence (fallback mode)');
    } finally {
      this.initialized = true;
    }
  }
  
  async waitForAzureInit() {
    // Wait up to 10 seconds for Azure to initialize
    for (let i = 0; i < 100; i++) {
      console.log(`Waiting for Azure init... attempt ${i + 1}/100, initialized: ${this.azureService.initialized}, enabled: ${this.azureService.isEnabled}`);
      if (this.azureService.initialized) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log(`Azure initialization wait complete. Initialized: ${this.azureService.initialized}, Enabled: ${this.azureService.isEnabled}`);
  }

  // Helper method to get JSON file path
  getJSONFilePath(filename) {
    // Check if we're in production (Azure App Service)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.WEBSITE_SITE_NAME;
    
    if (isProduction) {
      // In production, look for files in the same directory as the server
      return path.join(__dirname, '..', '..', filename);
    } else {
      // In development, use the config directory
      return path.join(__dirname, '..', '..', '..', 'config', filename);
    }
  }

  // Read JSON file (fallback method)
  readJSONFile(filename) {
    try {
      const filePath = this.getJSONFilePath(filename);
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return null;
    }
  }

  // Write JSON file (fallback method)
  writeJSONFile(filename, data) {
    try {
      const filePath = this.getJSONFilePath(filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  }

  // Get duties data
  async getDuties() {
    console.log('=== GET DUTIES - Storage method:', this.useAzure ? 'AZURE' : 'JSON');
    
    if (this.useAzure) {
      try {
        console.log('Attempting to get duties from Azure...');
        const result = await this.azureService.getDuties();
        console.log('Successfully retrieved duties from Azure');
        return result;
      } catch (error) {
        console.error('Azure Table Storage failed, falling back to JSON file:', error);
        return this.readJSONFile('duties.json');
      }
    } else {
      console.log('Getting duties from JSON file...');
      return this.readJSONFile('duties.json');
    }
  }

  // Store duties data
  async storeDuties(duties) {
    console.log('=== STORE DUTIES - Storage method:', this.useAzure ? 'AZURE' : 'JSON');
    
    if (this.useAzure) {
      try {
        console.log('Attempting to store duties in Azure...');
        await this.azureService.storeDuties(duties);
        console.log('Successfully stored duties in Azure');
        return true;
      } catch (error) {
        console.error('Azure Table Storage failed, falling back to JSON file:', error);
        return this.writeJSONFile('duties.json', duties);
      }
    } else {
      console.log('Storing duties in JSON file...');
      return this.writeJSONFile('duties.json', duties);
    }
  }

  // Get children data
  async getChildren() {
    if (this.useAzure) {
      try {
        return await this.azureService.getChildren();
      } catch (error) {
        console.error('Azure Table Storage failed, falling back to JSON file:', error);
        return this.readJSONFile('children.json');
      }
    } else {
      return this.readJSONFile('children.json');
    }
  }

  // Store children data
  async storeChildren(children) {
    if (this.useAzure) {
      try {
        await this.azureService.storeChildren(children);
        return true;
      } catch (error) {
        console.error('Azure Table Storage failed, falling back to JSON file:', error);
        return this.writeJSONFile('children.json', children);
      }
    } else {
      return this.writeJSONFile('children.json', children);
    }
  }

  // Get crossings data
  async getCrossings() {
    if (this.useAzure) {
      try {
        return await this.azureService.getCrossings();
      } catch (error) {
        console.error('Azure Table Storage failed, falling back to JSON file:', error);
        return this.readJSONFile('crossings.json');
      }
    } else {
      return this.readJSONFile('crossings.json');
    }
  }

  // Store crossings data
  async storeCrossings(crossings) {
    if (this.useAzure) {
      try {
        await this.azureService.storeCrossings(crossings);
        return true;
      } catch (error) {
        console.error('Azure Table Storage failed, falling back to JSON file:', error);
        return this.writeJSONFile('crossings.json', crossings);
      }
    } else {
      return this.writeJSONFile('crossings.json', crossings);
    }
  }

  // Get schedule data
  async getSchedule() {
    if (this.useAzure) {
      try {
        return await this.azureService.getSchedule();
      } catch (error) {
        console.error('Azure Table Storage failed, falling back to JSON file:', error);
        return this.readJSONFile('schedule.json');
      }
    } else {
      return this.readJSONFile('schedule.json');
    }
  }

  // Store schedule data
  async storeSchedule(schedule) {
    if (this.useAzure) {
      try {
        await this.azureService.storeSchedule(schedule);
        return true;
      } catch (error) {
        console.error('Azure Table Storage failed, falling back to JSON file:', error);
        return this.writeJSONFile('schedule.json', schedule);
      }
    } else {
      return this.writeJSONFile('schedule.json', schedule);
    }
  }

  // Check if using Azure
  isUsingAzure() {
    return this.useAzure;
  }
}

module.exports = DataService;