// Server-Sent Events implementation for real-time updates
const express = require('express');

class SSEManager {
  constructor() {
    this.clients = new Set();
  }

  // Add a client connection
  addClient(res) {
    const client = {
      id: Date.now() + Math.random(),
      res
    };
    
    this.clients.add(client);
    console.log(`SSE client connected. Total clients: ${this.clients.size}`);

    // Send initial connection message
    this.sendToClient(client, {
      type: 'connection',
      message: 'Connected to real-time updates'
    });

    return client;
  }

  // Remove a client connection
  removeClient(client) {
    this.clients.delete(client);
    console.log(`SSE client disconnected. Total clients: ${this.clients.size}`);
  }

  // Send message to a specific client
  sendToClient(client, data) {
    try {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Error sending SSE message:', error);
      this.removeClient(client);
    }
  }

  // Broadcast message to all clients
  broadcast(data) {
    const deadClients = [];
    
    this.clients.forEach(client => {
      try {
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.error('Error broadcasting SSE message:', error);
        deadClients.push(client);
      }
    });

    // Remove dead connections
    deadClients.forEach(client => this.removeClient(client));
  }

  // Broadcast duty update
  notifyDutyUpdate(updateData) {
    this.broadcast({
      type: 'duty-update',
      data: updateData,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = SSEManager;