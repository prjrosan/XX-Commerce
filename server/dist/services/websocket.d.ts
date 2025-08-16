import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketMessage } from '../types';
export declare class WebSocketManager {
    private wss;
    private clients;
    private chatUsers;
    constructor(wss: WebSocketServer);
    private initialize;
    private handleMessage;
    addClient(userId: number, ws: WebSocket): void;
    sendToUser(userId: number, message: WebSocketMessage): void;
    broadcastToAll(message: WebSocketMessage): void;
    broadcastToAdmins(message: WebSocketMessage): void;
    private handleChatJoin;
    private handleChatMessage;
    private handleTyping;
    private broadcastChatUserList;
    private broadcastToChatUsers;
}
//# sourceMappingURL=websocket.d.ts.map