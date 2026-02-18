'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Send, Bot, User, Building2, RefreshCw, Check, CheckCheck, Image as ImageIcon, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Chat {
  id: string;
  customerPhone: string;
  customerName: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  status: string;
}

interface MessageMetadata {
  orderId?: string;
  orderNumber?: string;
  paymentLinkUrl?: string;
  paymentStatus?: string;
  productId?: string;
}

interface Message {
  id: string;
  sender: 'customer' | 'business' | 'ai';
  content: string;
  messageType: string;
  mediaUrl?: string | null;
  isAiGenerated: boolean;
  status: string;
  createdAt: string;
  metadata?: MessageMetadata | null;
}

interface ChatWithMessages extends Chat {
  messages: Message[];
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/client/chats?${params}`);
      const data = await res.json();
      setChats(data.chats || []);
    } catch {
      console.error('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchChats();
    // Poll every 5 seconds for new messages
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  const selectChat = async (chatId: string) => {
    setLoadingChat(true);
    try {
      const res = await fetch(`/api/client/chats/${chatId}`);
      const data = await res.json();
      setSelectedChat(data);
      // Update unread count in sidebar
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
      );
    } catch {
      console.error('Failed to load chat');
    } finally {
      setLoadingChat(false);
    }
  };

  // Auto-refresh selected chat
  useEffect(() => {
    if (!selectedChat) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/client/chats/${selectedChat.id}`);
        const data = await res.json();
        setSelectedChat(data);
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedChat?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedChat || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/client/chats/${selectedChat.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const data = await res.json();
      if (data.success || data.message) {
        setReplyText('');
        // Refresh chat
        const chatRes = await fetch(`/api/client/chats/${selectedChat.id}`);
        const chatData = await chatRes.json();
        setSelectedChat(chatData);
        fetchChats();
      }
    } catch {
      console.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const formatPhone = (phone: string) => {
    if (phone.startsWith('91') && phone.length === 12) {
      return `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return `+${phone}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'customer':
        return <User className="h-4 w-4" />;
      case 'ai':
        return <Bot className="h-4 w-4" />;
      case 'business':
        return <Building2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusTicks = (status: string, sender: string) => {
    if (sender === 'customer') return null;
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <span className="text-[9px] text-red-500">Failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-4 md:-m-8">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-neutral-200 dark:border-neutral-700 flex flex-col bg-white dark:bg-neutral-900">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Live Chat</h1>
            <Button variant="ghost" size="icon" onClick={fetchChats} className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-neutral-400">
              <Bot className="h-12 w-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
              <p>No conversations yet.</p>
              <p className="mt-1">Messages from WhatsApp will appear here.</p>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors',
                  selectedChat?.id === chat.id && 'bg-neutral-100 dark:bg-neutral-800'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {chat.customerName || formatPhone(chat.customerPhone)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                      {formatPhone(chat.customerPhone)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1 truncate">
                      {chat.lastMessage || 'No messages'}
                    </p>
                  </div>
                  <div className="ml-2 flex flex-col items-end gap-1">
                    {chat.lastMessageAt && (
                      <span className="text-[10px] text-gray-400">
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    )}
                    {chat.unreadCount > 0 && (
                      <Badge className="h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1.5">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col bg-neutral-50 dark:bg-neutral-900">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="h-16 w-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
              <p className="text-gray-500 dark:text-neutral-400">Select a conversation to view messages</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedChat.customerName || formatPhone(selectedChat.customerPhone)}
                </p>
                <p className="text-xs text-gray-500">{formatPhone(selectedChat.customerPhone)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">WhatsApp</Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loadingChat ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                selectedChat.messages.map((msg) => {
                  const isCustomer = msg.sender === 'customer';
                  const meta = msg.metadata as MessageMetadata | null;
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex', isCustomer ? 'justify-start' : 'justify-end')}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] rounded-lg px-4 py-2 relative',
                          isCustomer
                            ? 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
                            : msg.sender === 'ai'
                            ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800'
                            : 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={cn(
                            'text-[10px] font-medium uppercase',
                            isCustomer ? 'text-gray-400' : msg.sender === 'ai' ? 'text-purple-500' : 'text-green-600'
                          )}>
                            {getSenderIcon(msg.sender)}
                          </span>
                          <span className={cn(
                            'text-[10px] font-medium',
                            isCustomer ? 'text-gray-400' : msg.sender === 'ai' ? 'text-purple-500' : 'text-green-600'
                          )}>
                            {msg.sender === 'ai' ? 'AI Bot' : msg.sender === 'business' ? 'You' : 'Customer'}
                          </span>
                        </div>

                        {/* Image message */}
                        {msg.messageType === 'image' && msg.mediaUrl && (
                          <div className="mb-2">
                            <img
                              src={msg.mediaUrl}
                              alt="Product"
                              className="rounded-md max-w-full max-h-48 object-cover"
                            />
                          </div>
                        )}

                        {/* Image indicator when no URL */}
                        {msg.messageType === 'image' && !msg.mediaUrl && (
                          <div className="mb-2 flex items-center gap-1 text-gray-400">
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-xs">Image</span>
                          </div>
                        )}

                        {/* Order card */}
                        {meta?.orderId && meta?.orderNumber && (
                          <div className="mb-2 bg-white/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-600 rounded-md p-2.5">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Package className="h-3.5 w-3.5 text-orange-500" />
                              <span className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                                {meta.orderNumber}
                              </span>
                              {meta.paymentStatus === 'paid' && (
                                <Badge className="text-[9px] h-4 bg-green-500">Paid</Badge>
                              )}
                            </div>
                            {meta.paymentLinkUrl && (
                              <a
                                href={meta.paymentLinkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-500 hover:underline break-all"
                              >
                                Payment Link
                              </a>
                            )}
                          </div>
                        )}

                        <p className="text-sm text-gray-800 dark:text-neutral-200 whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p className="text-[10px] text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {getStatusTicks(msg.status, msg.sender)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Press Enter to send. AI auto-replies are enabled.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
