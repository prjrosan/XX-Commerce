import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Shield, Store } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  userRole: 'customer' | 'seller' | 'admin';
  message: string;
  timestamp: Date;
  isAdmin: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Sample initial messages
  useEffect(() => {
    if (isOpen) {
      const initialMessages: ChatMessage[] = [
        {
          id: '1',
          userId: 'admin',
          username: 'XX-Commerce Support',
          userRole: 'admin',
          message: '👋 Welcome to XX-Commerce! How can we help you today?',
          timestamp: new Date(),
          isAdmin: true
        },
        {
          id: '2',
          userId: 'admin',
          username: 'XX-Commerce Support',
          userRole: 'admin',
          message: '💡 You can ask about products, orders, payments, or any general questions.',
          timestamp: new Date(Date.now() - 30000),
          isAdmin: true
        }
      ];
      setMessages(initialMessages);
    }
  }, [isOpen]);

  // WebSocket connection
  useEffect(() => {
    if (isOpen && user) {
      const websocket = new WebSocket(`ws://localhost:3001/chat`);
      
      websocket.onopen = () => {
        console.log('Chat WebSocket connected');
        // Send user info to join chat
        websocket.send(JSON.stringify({
          type: 'join',
          userId: user.id,
          username: user.username,
          userRole: user.role
        }));
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          setMessages(prev => [...prev, data.message]);
        } else if (data.type === 'typing') {
          setIsTyping(data.isTyping);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setWs(websocket);

      return () => {
        websocket.close();
      };
    }
  }, [isOpen, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !ws) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      userRole: user.role,
      message: newMessage.trim(),
      timestamp: new Date(),
      isAdmin: user.role === 'admin'
    };

    // Send message via WebSocket
    ws.send(JSON.stringify({
      type: 'message',
      message: message
    }));

    // Add to local state
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'seller':
        return <Store className="w-4 h-4 text-blue-500" />;
      case 'customer':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'seller':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'customer':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">XX-Commerce Support</h3>
            <p className="text-sm text-white/80">Live Chat</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          title="Close chat"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.userId === user?.id ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-center space-x-2 mb-1 ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  {message.userId !== user?.id && (
                    <>
                      {getRoleIcon(message.userRole)}
                      <span className="text-sm font-medium text-gray-700">{message.username}</span>
                    </>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full border ${getRoleColor(message.userRole)}`}>
                    {message.userRole}
                  </span>
                  {message.userId === user?.id && (
                    <>
                      <span className="text-sm font-medium text-gray-700">{message.username}</span>
                      {getRoleIcon(message.userRole)}
                    </>
                  )}
                </div>
                
                <div
                  className={`p-3 rounded-2xl ${
                    message.userId === user?.id
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.userId === user?.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce typing-dot-1"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce typing-dot-2"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            title="Send message"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setNewMessage('How do I track my order?')}
            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            title="Ask about order tracking"
            aria-label="Ask about order tracking"
          >
            Track Order
          </button>
          <button
            onClick={() => setNewMessage('What payment methods do you accept?')}
            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            title="Ask about payment methods"
            aria-label="Ask about payment methods"
          >
            Payment Info
          </button>
          <button
            onClick={() => setNewMessage('How do I become a seller?')}
            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            title="Ask about becoming a seller"
            aria-label="Ask about becoming a seller"
          >
            Become Seller
          </button>
        </div>
      </div>
    </div>
  );
}
