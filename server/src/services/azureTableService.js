const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

class AzureTableService {
  constructor() {
    // Azure Storage connection string from environment variables
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.tableName = process.env.AZURE_TABLE_NAME || 'trafikkvakt';
    this.isEnabled = false;
    this.initialized = false;
    
    console.log('=== AZURE TABLE SERVICE CONSTRUCTOR ===');
    console.log('Connection string present:', !!this.connectionString);
    console.log('Connection string length:', this.connectionString ? this.connectionString.length : 0);
    console.log('Table name:', this.tableName);
    
    if (!this.connectionString) {
      console.warn('Azure Storage connection string not found. Using fallback JSON file storage.');
      this.initialized = true;
      return;
    }

    try {
      console.log('Creating TableClient from connection string...');
      this.tableClient = TableClient.fromConnectionString(
        this.connectionString,
        this.tableName
      );
      console.log('TableClient created successfully');
      
      // Initialize table
      this.initializeTable().then(() => {
        console.log('Azure Table Storage initialization completed successfully');
        this.initialized = true;
      }).catch(error => {
        console.error('Failed to initialize table in constructor:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        this.isEnabled = false;
        this.initialized = true; // Mark as initialized even if failed
      });
    } catch (error) {
      console.error('Failed to initialize Azure Table Storage in constructor:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      this.isEnabled = false;
      this.initialized = true;
    }
  }

  async initializeTable() {
    console.log('=== INITIALIZING AZURE TABLE ===');
    console.log('Table name:', this.tableName);
    
    try {
      console.log('Attempting to create table...');
      await this.tableClient.createTable();
      console.log(`Azure table '${this.tableName}' initialized successfully`);
      this.isEnabled = true;
    } catch (error) {
      console.log('Error during table creation:', error);
      console.log('Error status code:', error.statusCode);
      console.log('Error message:', error.message);
      
      if (error.statusCode === 409) {
        // Table already exists
        console.log(`Azure table '${this.tableName}' already exists`);
        this.isEnabled = true;
      } else {
        console.error('Failed to create Azure table - detailed error:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        this.isEnabled = false;
        throw error;
      }
    }
  }

  // Store duties data
  async storeDuties(duties) {
    if (!this.isEnabled) {
      throw new Error('Azure Table Storage is not enabled');
    }

    try {
      const entity = {
        partitionKey: 'duties',
        rowKey: 'current',
        data: JSON.stringify(duties),
        lastUpdated: new Date().toISOString(),
        timestamp: new Date()
      };

      await this.tableClient.upsertEntity(entity, 'Replace');
      console.log('Duties stored successfully in Azure Table Storage');
      return true;
    } catch (error) {
      console.error('Failed to store duties in Azure Table Storage:', error);
      throw error;
    }
  }

  // Retrieve duties data
  async getDuties() {
    if (!this.isEnabled) {
      throw new Error('Azure Table Storage is not enabled');
    }

    try {
      const entity = await this.tableClient.getEntity('duties', 'current');
      const duties = JSON.parse(entity.data);
      console.log('Duties retrieved successfully from Azure Table Storage');
      return duties;
    } catch (error) {
      if (error.statusCode === 404) {
        console.log('No duties found in Azure Table Storage, returning null');
        return null;
      }
      console.error('Failed to retrieve duties from Azure Table Storage:', error);
      throw error;
    }
  }

  // Store children data
  async storeChildren(children) {
    if (!this.isEnabled) {
      throw new Error('Azure Table Storage is not enabled');
    }

    try {
      const entity = {
        partitionKey: 'config',
        rowKey: 'children',
        data: JSON.stringify(children),
        lastUpdated: new Date().toISOString(),
        timestamp: new Date()
      };

      await this.tableClient.upsertEntity(entity, 'Replace');
      console.log('Children stored successfully in Azure Table Storage');
      return true;
    } catch (error) {
      console.error('Failed to store children in Azure Table Storage:', error);
      throw error;
    }
  }

  // Retrieve children data
  async getChildren() {
    if (!this.isEnabled) {
      throw new Error('Azure Table Storage is not enabled');
    }

    try {
      const entity = await this.tableClient.getEntity('config', 'children');
      const children = JSON.parse(entity.data);
      console.log('Children retrieved successfully from Azure Table Storage');
      return children;
    } catch (error) {
      if (error.statusCode === 404) {
        console.log('No children found in Azure Table Storage, returning null');
        return null;
      }
      console.error('Failed to retrieve children from Azure Table Storage:', error);
      throw error;
    }
  }

  // Store crossings data
  async storeCrossings(crossings) {
    if (!this.isEnabled) {
      throw new Error('Azure Table Storage is not enabled');
    }

    try {
      const entity = {
        partitionKey: 'config',
        rowKey: 'crossings',
        data: JSON.stringify(crossings),
        lastUpdated: new Date().toISOString(),
        timestamp: new Date()
      };

      await this.tableClient.upsertEntity(entity, 'Replace');
      console.log('Crossings stored successfully in Azure Table Storage');
      return true;
    } catch (error) {
      console.error('Failed to store crossings in Azure Table Storage:', error);
      throw error;
    }
  }

  // Retrieve crossings data
  async getCrossings() {
    if (!this.isEnabled) {
      throw new Error('Azure Table Storage is not enabled');
    }

    try {
      const entity = await this.tableClient.getEntity('config', 'crossings');
      const crossings = JSON.parse(entity.data);
      console.log('Crossings retrieved successfully from Azure Table Storage');
      return crossings;
    } catch (error) {
      if (error.statusCode === 404) {
        console.log('No crossings found in Azure Table Storage, returning null');
        return null;
      }
      console.error('Failed to retrieve crossings from Azure Table Storage:', error);
      throw error;
    }
  }

  // Store schedule data
  async storeSchedule(schedule) {
    if (!this.isEnabled) {
      throw new Error('Azure Table Storage is not enabled');
    }

    try {
      const entity = {
        partitionKey: 'config',
        rowKey: 'schedule',
        data: JSON.stringify(schedule),
        lastUpdated: new Date().toISOString(),
        timestamp: new Date()
      };

      await this.tableClient.upsertEntity(entity, 'Replace');
      console.log('Schedule stored successfully in Azure Table Storage');
      return true;
    } catch (error) {
      console.error('Failed to store schedule in Azure Table Storage:', error);
      throw error;
    }
  }

  // Retrieve schedule data
  async getSchedule() {
    if (!this.isEnabled) {
      throw new Error('Azure Table Storage is not enabled');
    }

    try {
      const entity = await this.tableClient.getEntity('config', 'schedule');
      const schedule = JSON.parse(entity.data);
      console.log('Schedule retrieved successfully from Azure Table Storage');
      return schedule;
    } catch (error) {
      if (error.statusCode === 404) {
        console.log('No schedule found in Azure Table Storage, returning null');
        return null;
      }
      console.error('Failed to retrieve schedule from Azure Table Storage:', error);
      throw error;
    }
  }

  // Health check
  isAvailable() {
    return this.isEnabled;
  }
}

module.exports = AzureTableService;