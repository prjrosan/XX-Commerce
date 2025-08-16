import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory storage for chat messages (in production, use database)
const chatMessages: any[] = [];
const connectedUsers = new Map();

// Get chat history
router.get('/history', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Return last 50 messages
    const recentMessages = chatMessages.slice(-50);
    res.json({ 
      success: true, 
      data: { messages: recentMessages } 
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Send a message
router.post('/send', authenticateToken, (req: AuthRequest, res: Response) => {
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

    // Broadcast to all connected users via WebSocket
    // This will be handled by the WebSocket server

    res.json({ 
      success: true, 
      data: { message: newMessage } 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get online users
router.get('/online-users', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const onlineUsers = Array.from(connectedUsers.values()).map((user: any) => ({
      id: user.id,
      username: user.username,
      userRole: user.userRole,
      isOnline: true
    }));

    res.json({ 
      success: true, 
      data: { users: onlineUsers } 
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
});

export default router;
