
import { MessageCircle, X } from 'lucide-react';

interface ChatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount?: number;
}

export default function ChatToggle({ isOpen, onToggle, unreadCount = 0 }: ChatToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-4 right-4 z-40 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
        isOpen 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
      }`}
      title={isOpen ? "Close chat" : "Open chat"}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </div>
    </button>
  );
}
