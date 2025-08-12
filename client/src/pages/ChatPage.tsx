import { useState, useEffect, useRef } from "react";
import { Share2, Menu } from "lucide-react";
import { toast } from "sonner";
import ChatHistory from "@/components/ChatHistory/ChatHistory";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import ShinyText from '@/components/ui/ShinyText';

interface Message {
  id: number;
  text: string;
  role: "user" | "bot";
}

type ChatSession = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messages: Array<{ text: string; role: "user" | "bot" }>;
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [_isSharedChat, setIsSharedChat] = useState(false);
  // const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Parse shared chat from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedChat = params.get("share");
    if (sharedChat) {
      try {
        const session = JSON.parse(decodeURIComponent(sharedChat));
        setIsSharedChat(true);
        setMessages(session.messages);
      } catch (e) {
        console.error("Error parsing shared chat:", e);
      }
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveSession = (updatedMessages: Message[], lastMessage: string) => {
    const sessions: ChatSession[] = JSON.parse(
      localStorage.getItem("chatSessions") || "[]"
    );
    const newSession: ChatSession = {
      id: currentSessionId || Date.now().toString(),
      title: `Chat ${new Date().toLocaleDateString()}`,
      lastMessage,
      timestamp: Date.now(),
      messages: updatedMessages,
    };
    localStorage.setItem(
      "chatSessions",
      JSON.stringify([newSession, ...sessions.filter((s) => s.id !== newSession.id)])
    );
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now(), text: input.trim(), role: "user" };
    const loadingMsg: Message = { id: Date.now() + 1, text: "Analyzing symptoms...", role: "bot" };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMsg.id ? { ...msg, text: "Preparing the best advice..." } : msg
        )
      );

      setTimeout(() => {
        const responseText =
          "Based on your symptoms, here's a possible suggestion: Stay hydrated, rest well, and consult a doctor if symptoms persist.";
        const responseMsg: Message = {
          id: Date.now() + 2,
          text: responseText,
          role: "bot",
        };

        setMessages((prev) => {
          const updated = [...prev.filter((m) => m.id !== loadingMsg.id), responseMsg];
          saveSession(updated, responseText);
          return updated;
        });

        setLoading(false);
        setShowNewChat(true);
      }, 1500);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleShareMessage = async (message: string, shareUrl = false) => {
    const content = shareUrl ? `${message}\n\n${window.location.href}` : message;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shared from HealthMate",
          text: content,
          url: shareUrl ? window.location.href : undefined,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(content);
      toast.success(
        shareUrl ? "Chat link copied to clipboard!" : "Message copied to clipboard!"
      );
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="h-screen w-full bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">

        {/* Desktop Sidebar */}
        <Sidebar side="left" variant="sidebar" collapsible="icon" className="hidden w-fit sm:flex">
          <SidebarContent>
            <div className="flex flex-col items-center justify-between h-full">
              <div className="pt-2">
                <ChatHistory
                  onSelectSession={(session: ChatSession) => {
                    setMessages(
                      session.messages.map((msg) => ({
                        ...msg,
                        id: Date.now() + Math.random(),
                      }))
                    );
                    setCurrentSessionId(session.id);
                    setShowNewChat(false);
                  }}
                  onCreateNew={() => {
                    setMessages([]);
                    setCurrentSessionId(null);
                    setShowNewChat(false);
                  }}
                />
              </div>

              <div className="pb-4">
                <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700 bg-blue-500 dark:bg-blue-600">
                  <AvatarFallback className="text-white font-semibold">
                    {"C"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-screen relative">

          {/* Mobile ChatHistory via Sheet */}
          <div className="md:hidden absolute top-3 left-3 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <ChatHistory
                  onSelectSession={(session: ChatSession) => {
                    setMessages(
                      session.messages.map((msg) => ({
                        ...msg,
                        id: Date.now() + Math.random(),
                      }))
                    );
                    setCurrentSessionId(session.id);
                    setShowNewChat(false);
                  }}
                  onCreateNew={() => {
                    setMessages([]);
                    setCurrentSessionId(null);
                    setShowNewChat(false);
                  }}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Header */}
          <header className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 w-full pl-14">
            <button
              className={`flex items-center gap-2 flex-1 ${messages.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => {
                if (messages.length > 0) {
                  setMessages([]);
                  setCurrentSessionId(null);
                  setShowNewChat(false);
                  toast.success("New chat started");
                }
              }}
            >
              <img src="/logo.png" alt="HealthMate Logo" className="h-8 w-8" />
              <h1 className="text-lg font-semibold truncate">HealthMate</h1>
            </button>
            <ThemeToggleButton start="top-right" />
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 bg-gray-100 dark:bg-gray-950 custom-scrollbar">
            {messages.length > 0 ? (
              <div className="max-w-3xl mx-auto w-full px-2 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start flex-col"}`}
                  >
                    <div
                      className={`w-fit max-w-[85%] xs:max-w-[90%] sm:max-w-[85%] md:max-w-[70%] px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base shadow-md ${msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                        }`}
                    >
                      {msg.text}
                    </div>
                    {msg.role === "bot" && (
                      <button
                        onClick={() => handleShareMessage(msg.text)}
                        className="flex items-center gap-1 text-2xs sm:text-xs text-blue-500 dark:text-blue-400 mt-1 hover:underline"
                      >
                        <Share2 size={12} /> Share
                      </button>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full -mt-16 px-4">
                <div className="max-w-lg text-center space-y-6">
                  <div className="space-y-2">
                    <h2
                      className="text-4xl font-bold bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          "linear-gradient(120deg, #2563eb, #60a5fa, rgba(180, 180, 180,0.8) 50%, #60a5fa, #2563eb)",
                        backgroundSize: "200% 100%",
                        animation: "shine 5s linear infinite",
                      }}
                    >
                      Welcome to HealthMate Chat
                    </h2>
                    {/* <ShinyText text="Welcome to HealthMate Chat!" disabled={false} speed={3} className='custom-class' /> */}
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Describe your symptoms to get personalized health advice
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="sticky bottom-0 flex justify-center px-3 sm:px-4 pb-4 sm:pb-4 bg-gray-100 dark:bg-gray-950 mb-1.5">
            <div className="w-full max-w-3xl">
              {showNewChat ? (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setMessages([]);
                      setShowNewChat(false);
                      setCurrentSessionId(null);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-md text-sm sm:text-base w-full md:w-auto"
                  >
                    New Chat
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl w-full">
                  <textarea
                    className="flex-1 resize-none bg-transparent px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-0"
                    rows={1}
                    placeholder={loading ? "Analyzing..." : "Describe your symptoms..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-16 sm:w-20"
                    disabled={loading}
                  >
                    {loading ? "..." : "Send"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ChatPage;

