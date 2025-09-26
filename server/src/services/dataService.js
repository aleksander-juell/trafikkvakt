const AzureTableService = require('./azureTableService');

class DataService {
  constructor() {
    console.log('=== INITIALIZING DATA SERVICE ===');
    this.azureService = new AzureTableService();
    this.initialized = false;
    
    // Initialize asynchronously
    this.initialize();
  }
  
  async initialize() {
    try {
      // Wait for Azure service to fully initialize
      await this.waitForAzureInit();
      
      if (!this.azureService.isAvailable()) {
        throw new Error('Azure Table Storage is not available. Please check your connection string and configuration.');
      }
      
      console.log('Data service initialized successfully with Azure Table Storage');
    } catch (error) {
      console.error('Failed to initialize Azure storage:', error);
      throw error; // Re-throw to indicate initialization failure
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

  // Get duties data
  async getDuties() {
    console.log('=== GET DUTIES - Using Azure Table Storage');
    return await this.azureService.getDuties();
  }

  // Store duties data
  async storeDuties(duties) {
    console.log('=== STORE DUTIES - Using Azure Table Storage');
    await this.azureService.storeDuties(duties);
    return true;
  }

  // Get children data
  async getChildren() {
    return await this.azureService.getChildren();
  }

  // Store children data
  async storeChildren(children) {
    await this.azureService.storeChildren(children);
    return true;
  }

  // Get crossings data
  async getCrossings() {
    return await this.azureService.getCrossings();
  }

  // Store crossings data
  async storeCrossings(crossings) {
    await this.azureService.storeCrossings(crossings);
    return true;
  }

  // Get schedule data
  async getSchedule() {
    return await this.azureService.getSchedule();
  }

  // Store schedule data
  async storeSchedule(schedule) {
    await this.azureService.storeSchedule(schedule);
    return true;
  }

  // Get audit log data
  async getAuditLog() {
    return await this.azureService.getAuditLog();
  }

  // Store audit log entry
  async storeAuditLogEntry(entry) {
    await this.azureService.storeAuditLogEntry(entry);
    return true;
  }

  // Clear audit log
  async clearAuditLog() {
    await this.azureService.clearAuditLog();
    return true;
  }

  // Check if Azure is available
  isAzureAvailable() {
    return this.azureService.isAvailable();
  }
}

module.exports = DataService;