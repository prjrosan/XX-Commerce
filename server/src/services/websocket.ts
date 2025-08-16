import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketMessage } from '../types';

interface ChatUser {
  id: string;
  username: string;
  userRole: string;
  ws: WebSocket;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<number, WebSocket> = new Map();
  private chatUsers: Map<string, ChatUser> = new Map();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔌 New WebSocket connection');

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        // Remove client from maps
        for (const [userId, client] of this.clients.entries()) {
          if (client === ws) {
            this.clients.delete(userId);
            console.log(`🔌 User ${userId} disconnected`);
            break;
          }
        }
        
        // Remove from chat users
        for (const [userId, chatUser] of this.chatUsers.entries()) {
          if (chatUser.ws === ws) {
            this.chatUsers.delete(userId);
            console.log(`💬 Chat user ${userId} disconnected`);
            this.broadcastChatUserList();
            break;
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
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
      case 'join':
        // Handle chat join
        this.handleChatJoin(ws, message);
        break;
      case 'message':
        // Handle chat message
        this.handleChatMessage(ws, message);
        break;
      case 'typing':
        // Handle typing indicator
        this.handleTyping(ws, message);
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

  // Chat methods
  private handleChatJoin(ws: WebSocket, message: any) {
    const { userId, username, userRole } = message;
    
    this.chatUsers.set(userId, {
      id: userId,
      username,
      userRole,
      ws
    });
    
    console.log(`💬 User ${username} (${userRole}) joined chat`);
    this.broadcastChatUserList();
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'system',
      message: `Welcome to XX-Commerce chat, ${username}!`
    }));
  }

  private handleChatMessage(ws: WebSocket, message: any) {
    const chatMessage = message.message;
    
    // Broadcast message to all chat users
    this.broadcastToChatUsers({
      type: 'message',
      message: chatMessage
    });
    
    console.log(`💬 ${chatMessage.username}: ${chatMessage.message}`);
  }

  private handleTyping(ws: WebSocket, message: any) {
    const { userId, isTyping } = message;
    
    // Broadcast typing indicator to other users
    this.broadcastToChatUsers({
      type: 'typing',
      userId,
      isTyping
    }, userId);
  }

  private broadcastChatUserList() {
    const userList = Array.from(this.chatUsers.values()).map(user => ({
      id: user.id,
      username: user.username,
      userRole: user.userRole,
      isOnline: true
    }));
    
    this.broadcastToChatUsers({
      type: 'user_list',
      users: userList
    });
  }

  private broadcastToChatUsers(message: any, excludeUserId?: string) {
    this.chatUsers.forEach((user, userId) => {
      if (userId !== excludeUserId && user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(JSON.stringify(message));
      }
    });
  }
} 