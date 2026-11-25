import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCheck,
  Search,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeUserId = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch list of conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/communications/conversations/');
      const convList = res.data;
      setConversations(convList);

      // If activeUserId param is provided, pick that partner or load their details
      if (activeUserId) {
        const found = convList.find((c) => String(c.user_id) === String(activeUserId));
        if (found) {
          setActivePartner(found);
        } else {
          // Fetch student user info
          try {
            const userRes = await api.get(`/auth/students/${activeUserId}/`);
            const u = userRes.data;
            const newPartnerObj = {
              user_id: u.id,
              username: u.username,
              full_name: u.first_name ? `${u.first_name} ${u.last_name}` : u.username,
              avatar: u.student_profile?.display_avatar,
              last_message: '',
            };
            setActivePartner(newPartnerObj);
          } catch (e) {
            console.error('Could not fetch target user:', e);
          }
        }
      } else if (convList.length > 0 && !activePartner) {
        setActivePartner(convList[0]);
        setSearchParams({ user: convList[0].user_id });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [activeUserId]);

  // Fetch message thread when activePartner changes
  useEffect(() => {
    if (!activePartner) return;

    const fetchThread = async () => {
      try {
        const res = await api.get(`/communications/messages/${activePartner.user_id}/`);
        setMessages(res.data.results || res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchThread();
    const interval = setInterval(fetchThread, 5000); // Polling for incoming messages
    return () => clearInterval(interval);
  }, [activePartner]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner) return;

    setSending(true);
    try {
      const res = await api.post('/communications/messages/send/', {
        receiver: activePartner.user_id,
        content: newMessage.trim(),
      });

      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
      fetchConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Conversations List */}
        <div className="w-full sm:w-80 border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Student Messages</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
              <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No conversations yet. Message a seller or requester to start chatting!
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activePartner?.user_id === conv.user_id;
                return (
                  <button
                    key={conv.user_id}
                    onClick={() => {
                      setActivePartner(conv);
                      setSearchParams({ user: conv.user_id });
                    }}
                    className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                      isActive ? 'bg-white border-l-4 border-brand-600 shadow-xs' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <img
                      src={conv.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${conv.username}`}
                      alt={conv.username}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {conv.full_name || conv.username}
                        </h4>
                        {conv.unread_count > 0 && (
                          <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.last_message || 'Start chatting...'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Chat Window */}
        <div className="flex-1 flex flex-col bg-slate-50/50">
          {activePartner ? (
            <>
              {/* Top Chat Partner Bar */}
              <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={activePartner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${activePartner.username}`}
                    alt={activePartner.username}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {activePartner.full_name || activePartner.username}
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Verified Campus Student
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Timeline */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    <MessageSquare size={36} className="mx-auto mb-2 text-slate-300" />
                    <span>No messages exchanged yet with {activePartner.full_name}. Say hello!</span>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-brand-700 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          <p>{m.content}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message (e.g. Schedule meetup time, question on reviewer condition)..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="p-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors shrink-0"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 p-8 text-center">
              Select a conversation from the left to start messaging.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

