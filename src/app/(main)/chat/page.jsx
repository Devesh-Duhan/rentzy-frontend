"use client";

import React, { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import axiosInstance from "@/lib/axios";
import { Send, User as UserIcon, ArrowLeft } from "lucide-react";

let socket;

export default function ChatPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const [socketConnected, setSocketConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const ENDPOINT = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    // The backend now requires a valid JWT on the Socket.IO handshake.
    const token = localStorage.getItem("token");
    socket = io(ENDPOINT, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
      setSocketConnected(false);
    });
    socket.on("connected", () => setSocketConnected(true));

    socket.on("message recieved", (newMessageReceived) => {
      const incomingChatId = newMessageReceived?.chatId?._id || newMessageReceived?.chatId;
      if (selectedChat && selectedChat._id === incomingChatId) {
        setMessages((prev) => prev.some(message => message._id === newMessageReceived._id) ? prev : [...prev, newMessageReceived]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, router, selectedChat]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await axiosInstance.get('/chats');
        setChats(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    if (user) fetchChats();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/chats/${selectedChat._id}/messages`);
      setMessages(Array.isArray(data) ? data : []);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedChat) {
      try {
        const messageText = newMessage.trim();
        setNewMessage("");
        const { data } = await axiosInstance.post(`/chats/${selectedChat._id}/message`, {
          content: messageText,
        });
        setMessages((prev) => prev.some(message => message._id === data._id) ? prev : [...prev, data]);
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  const getOtherUser = (chat) => {
    if (!chat) return null;
    const buyerId = chat.buyer?._id || chat.buyer;
    const sellerId = chat.seller?._id || chat.seller;
    const myId = user?._id;

    if (buyerId === myId) return chat.seller;
    if (sellerId === myId) return chat.buyer;
    if (Array.isArray(chat.users)) return chat.users.find(u => (u._id || u) !== myId);
    return chat.seller || chat.buyer || null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <main className="flex-1 app-container pt-32 w-full">
        <div className="app-card overflow-hidden flex h-[70vh] mb-12">

          {/* Chat List Sidebar */}
          <div className={`w-full md:w-1/3 border-r border-slate-100 dark:border-slate-700/50 flex flex-col ${selectedChat ? "hidden md:flex" : "flex"}`}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="section-title text-xl md:text-xl">Your Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-medium">No chats yet.</div>
              ) : (
                chats.map((chat) => {
                  const otherUser = getOtherUser(chat);
                  const isSelected = selectedChat?._id === chat._id;

                  return (
                    <div
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 border-b border-slate-100 dark:border-slate-700/50 cursor-pointer transition-colors flex items-center gap-4 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-l-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                        {otherUser?.name?.[0] || <UserIcon size={20} />}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>{otherUser?.name || 'Unknown User'}</p>
                        <p className="text-xs text-slate-500 truncate">{chat.latestMessage?.content || "Tap to chat"}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!selectedChat ? "hidden md:flex" : "flex"}`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 flex items-center gap-4">
                  <button className="md:hidden btn-ghost p-2" onClick={() => setSelectedChat(null)}>
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    {getOtherUser(selectedChat)?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{getOtherUser(selectedChat)?.name}</h3>
                    {socketConnected && <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Online</p>}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {loading ? (
                    <div className="text-center font-medium text-slate-400 mt-10">Loading messages...</div>
                  ) : (
                    messages.map((m, i) => {
                      const senderId = (m.sender?._id || m.sender)?.toString();
                      const isMine = senderId === user?._id?.toString();
                      return (
                        <div key={m._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] p-4 rounded-2xl ${isMine ? 'bg-indigo-600 text-white rounded-tr-sm' : 'app-card rounded-tl-sm'} shadow-sm`}>
                            <p className="text-sm font-medium">{m.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="input-field flex-1"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send size={18} />
                    <span className="hidden sm:inline font-semibold">Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-24 h-24 app-card rounded-3xl flex items-center justify-center mb-6">
                  <UserIcon size={40} className="text-indigo-200 dark:text-indigo-400/50" />
                </div>
                <h3 className="section-title text-xl mb-2">Your Messages</h3>
                <p className="font-medium text-center max-w-xs text-slate-500 dark:text-slate-400">Select a conversation from the sidebar to continue chatting.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
