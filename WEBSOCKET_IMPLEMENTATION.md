# WebSocket Implementation for Ultra-Fast Updates

## Installation Required:
```bash
cd server && npm install ws
```

## Server Setup (server/src/websocket.js):
```javascript
const WebSocket = require('ws');
const http = require('http');

class WebSocketManager {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Set();
    
    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);
      
      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to real-time updates'
      }));
      
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }
  
  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  notifyDutyUpdate(updateData) {
    this.broadcast({
      type: 'duty-update',
      data: updateData,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = WebSocketManager;
```

## Client Hook (client/src/hooks/useWebSocket.ts):
```typescript
import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string, onMessage: (data: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${url}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [url, onMessage]);
  
  return { isConnected };
}
```

## Benefits:
- **Instant updates** (< 100ms)
- **Bidirectional communication**
- **Automatic reconnection**
- **Perfect for collaborative features**