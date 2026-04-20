import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Users, ArrowLeft, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';

const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId') || 'general';
  const isAiChat = matchId === 'ai_assistant';
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user, messages, setMessages, addMessage } = useStore();

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const chatMessages = await apiService.getMessages(matchId);
        setMessages(chatMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [matchId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !user) return;

    const currentMessage = messageInput.trim();
    setMessageInput('');
    if (isAiChat) setIsTyping(true);

    try {
      const response = await apiService.sendMessage({
        matchId,
        userId: user.id,
        userName: user.name,
        message: currentMessage,
      });
      
      if (Array.isArray(response)) {
        response.forEach(msg => addMessage(msg));
      } else {
        addMessage(response);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      if (isAiChat) setIsTyping(false);
    }
  };

  const mockMessages = isAiChat ? [
    {
      id: 'mock-1',
      matchId: 'ai_assistant',
      userId: 'gemini-bot',
      userName: 'Sportsy AI',
      message: 'Hello! I am your Sportsy AI Assistant. How can I help you today? I can recommend turfs, help you find matches, or give you sports advice.',
      timestamp: new Date().toISOString(),
    }
  ] : [
    {
      id: '1',
      matchId,
      userId: '2',
      userName: 'Mike Chen',
      message: 'Hey everyone! Looking forward to our basketball game tomorrow. Should we meet 15 minutes early to warm up?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      matchId,
      userId: '3',
      userName: 'Sarah Wilson',
      message: 'Sounds good! I can bring some extra water bottles if needed.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  const displayMessages = messages.length > 0 ? messages : mockMessages;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-900 flex flex-col">
      {/* Chat Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4" data-page-enter>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center">
                {isAiChat ? (
                  <>
                    <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
                    Sportsy AI Assistant
                  </>
                ) : (
                  'Match Chat'
                )}
              </h1>
              <div className="flex items-center text-gray-400 text-sm mt-1">
                {!isAiChat && <Users className="w-4 h-4 mr-1" />}
                <span>
                  {isAiChat ? 'Powered by Google Gemini' : 'Basketball Game - Tomorrow 6:00 PM'}
                </span>
              </div>
            </div>
          </div>
          
          {!isAiChat && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-400 text-sm">4 online</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {displayMessages.map((message) => {
            const isOwnMessage = message.userId === user?.id;
            const isAiMessage = message.userId === 'gemini-bot';
            const messageTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] lg:max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {!isOwnMessage && (
                    <div className={`text-sm mb-1 ml-3 flex items-center ${isAiMessage ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                      {isAiMessage && <Sparkles className="w-3 h-3 mr-1" />}
                      {message.userName}
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : isAiMessage
                        ? 'bg-gray-800 border border-gray-700 text-white rounded-bl-sm shadow-lg'
                        : 'bg-gray-700 text-white rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
                    <div
                      className={`text-xs mt-2 ${
                        isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                      }`}
                    >
                      {messageTime}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] lg:max-w-[70%] order-1">
                <div className="text-sm mb-1 ml-3 flex items-center text-blue-400 font-bold">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Sportsy AI
                </div>
                <div className="px-4 py-4 bg-gray-800 border border-gray-700 text-white rounded-lg rounded-bl-sm shadow-lg flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          {user ? (
            <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={isAiChat ? "Ask Sportsy AI a question..." : "Type your message..."}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isTyping}
                />
              </div>
              <button
                type="submit"
                disabled={!messageInput.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors duration-200 shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="text-center py-2 text-gray-400">
              Please <a href="/login" className="text-blue-400 hover:underline">sign in</a> to send a message.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;