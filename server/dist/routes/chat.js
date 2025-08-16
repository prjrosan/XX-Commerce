"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const chatMessages = [];
const connectedUsers = new Map();
router.get('/history', auth_1.authenticateToken, (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const recentMessages = chatMessages.slice(-50);
        res.json({
            success: true,
            data: { messages: recentMessages }
        });
    }
    catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});
router.post('/send', auth_1.authenticateToken, (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user?.id;
        const username = req.user?.name;
        const userRole = req.user?.role;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const newMessage = {
            id: Date.now().toString(),
            userId,
            username,
            userRole,
            message: message.trim(),
            timestamp: new Date(),
            isAdmin: userRole === 'admin'
        };
        chatMessages.push(newMessage);
        res.json({
            success: true,
            data: { message: newMessage }
        });
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
router.get('/online-users', auth_1.authenticateToken, (req, res) => {
    try {
        const onlineUsers = Array.from(connectedUsers.values()).map((user) => ({
            id: user.id,
            username: user.username,
            userRole: user.userRole,
            isOnline: true
        }));
        res.json({
            success: true,
            data: { users: onlineUsers }
        });
    }
    catch (error) {
        console.error('Error fetching online users:', error);
        res.status(500).json({ error: 'Failed to fetch online users' });
    }
});
exports.default = router;
//# sourceMappingURL=chat.js.map