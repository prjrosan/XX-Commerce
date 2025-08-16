"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketManager = void 0;
const ws_1 = require("ws");
class WebSocketManager {
    constructor(wss) {
        this.clients = new Map();
        this.chatUsers = new Map();
        this.wss = wss;
        this.initialize();
    }
    initialize() {
        this.wss.on('connection', (ws) => {
            console.log('🔌 New WebSocket connection');
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(ws, message);
                }
                catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });
            ws.on('close', () => {
                for (const [userId, client] of this.clients.entries()) {
                    if (client === ws) {
                        this.clients.delete(userId);
                        console.log(`🔌 User ${userId} disconnected`);
                        break;
                    }
                }
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
    handleMessage(ws, message) {
        switch (message.type) {
            case 'cart_update':
                break;
            case 'order_update':
                break;
            case 'product_update':
                break;
            case 'join':
                this.handleChatJoin(ws, message);
                break;
            case 'message':
                this.handleChatMessage(ws, message);
                break;
            case 'typing':
                this.handleTyping(ws, message);
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }
    addClient(userId, ws) {
        this.clients.set(userId, ws);
        console.log(`🔌 User ${userId} connected`);
    }
    sendToUser(userId, message) {
        const client = this.clients.get(userId);
        if (client && client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
    broadcastToAll(message) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
    broadcastToAdmins(message) {
        this.broadcastToAll(message);
    }
    handleChatJoin(ws, message) {
        const { userId, username, userRole } = message;
        this.chatUsers.set(userId, {
            id: userId,
            username,
            userRole,
            ws
        });
        console.log(`💬 User ${username} (${userRole}) joined chat`);
        this.broadcastChatUserList();
        ws.send(JSON.stringify({
            type: 'system',
            message: `Welcome to XX-Commerce chat, ${username}!`
        }));
    }
    handleChatMessage(ws, message) {
        const chatMessage = message.message;
        this.broadcastToChatUsers({
            type: 'message',
            message: chatMessage
        });
        console.log(`💬 ${chatMessage.username}: ${chatMessage.message}`);
    }
    handleTyping(ws, message) {
        const { userId, isTyping } = message;
        this.broadcastToChatUsers({
            type: 'typing',
            userId,
            isTyping
        }, userId);
    }
    broadcastChatUserList() {
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
    broadcastToChatUsers(message, excludeUserId) {
        this.chatUsers.forEach((user, userId) => {
            if (userId !== excludeUserId && user.ws.readyState === ws_1.WebSocket.OPEN) {
                user.ws.send(JSON.stringify(message));
            }
        });
    }
}
exports.WebSocketManager = WebSocketManager;
//# sourceMappingURL=websocket.js.map