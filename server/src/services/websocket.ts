import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketMessage } from '../types';

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<number, WebSocket> = new Map();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔌 New WebSocket connection');

      ws.on('message', (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        // Remove client from map
        for (const [userId, client] of this.clients.entries()) {
          if (client === ws) {
            this.clients.delete(userId);
            console.log(`🔌 User ${userId} disconnected`);
            break;
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'cart_update':
        // Handle cart updates
        break;
      case 'order_update':
        // Handle order updates
        break;
      case 'product_update':
        // Handle product updates
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  public addClient(userId: number, ws: WebSocket) {
    this.clients.set(userId, ws);
    console.log(`🔌 User ${userId} connected`);
  }

  public sendToUser(userId: number, message: WebSocketMessage) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  public broadcastToAll(message: WebSocketMessage) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public broadcastToAdmins(message: WebSocketMessage) {
    // In a real app, you'd filter by admin users
    this.broadcastToAll(message);
  }
} 