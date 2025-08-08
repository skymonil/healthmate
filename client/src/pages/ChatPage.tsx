import { useState, useEffect, useRef } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import ChatHistory from "@/components/ChatHistory/ChatHistory";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";

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
  const [messages, setMessages] = useState<Message[]>(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedChat = params.get("share");
    if (sharedChat) {
      try {
        const session = JSON.parse(decodeURIComponent(sharedChat));
        setIsSharedChat(true);
        return session.messages;
      } catch (e) {
        console.error("Error parsing shared chat:", e);
      }
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [_isSharedChat, setIsSharedChat] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input.trim(),
      role: "user",
    };

    const loadingMsg: Message = {
      id: Date.now() + 1,
      text: "Analyzing symptoms...",
      role: "bot",
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMsg.id
            ? { ...msg, text: "Preparing the best advice..." }
            : msg
        )
      );

      setTimeout(() => {
        const responseMsg: Message = {
          id: Date.now() + 2,
          text: `Based on your symptoms, here's a possible suggestion: Stay hydrated, rest well, and consult a doctor if symptoms persist.`,
          role: "bot",
        };

        setMessages((prev) => {
          const updated = [
            ...prev.filter((m) => m.id !== loadingMsg.id),
            responseMsg,
          ];

          const sessions: ChatSession[] = JSON.parse(
            localStorage.getItem("chatSessions") || "[]"
          );
          const newSession: ChatSession = {
            id: currentSessionId || Date.now().toString(),
            title: `Chat ${new Date().toLocaleDateString()}`,
            lastMessage: responseMsg.text,
            timestamp: Date.now(),
            messages: updated,
          };
          localStorage.setItem(
            "chatSessions",
            JSON.stringify([
              newSession,
              ...sessions.filter((s) => s.id !== newSession.id),
            ])
          );

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
    const content = shareUrl
      ? `${message}\n\n${window.location.href}`
      : message;
    
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
      toast.success(shareUrl
        ? "Chat link copied to clipboard!"
        : "Message copied to clipboard!");
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Sidebar */}
        <Sidebar
          side="left"
          variant="sidebar"
          collapsible="icon"
          className="hidden md:flex"
        >
          <SidebarContent>
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
          </SidebarContent>
        </Sidebar>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Header */}
          <header className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <img src="/logo.png" alt="HealthMate Logo" className="h-8 w-8" />
            <h1 className="text-lg font-semibold truncate flex-1 flex items-center gap-2">
              HealthMate
            </h1>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 bg-gray-50 dark:bg-gray-900 custom-scrollbar">
            {messages.length > 0 ? (
              <div className="max-w-3xl mx-auto w-full px-2 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start flex-col"
                    }`}
                  >
                    <div
                      className={`w-fit max-w-[90%] sm:max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-base shadow-md ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.role === "bot" && (
                      <button
                        onClick={() => handleShareMessage(msg.text)}
                        className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 mt-1 hover:underline"
                      >
                        <Share2 size={12} /> Share
                      </button>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full -mt-16">
                <div className="max-w-2xl text-center px-4 mb-8">
                  <h2 className="text-3xl font-bold mb-4">
                    Welcome to HealthMate Chat
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Describe your symptoms to get personalized health advice
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="sticky bottom-0 flex justify-center px-4 pb-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-3xl">
              {showNewChat ? (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setMessages([]);
                      setShowNewChat(false);
                      setCurrentSessionId(null);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-md text-base w-full md:w-auto"
                  >
                    New Chat
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl w-full">
                  <textarea
                    className="flex-1 resize-none bg-transparent px-3 py-2 text-base text-gray-900 dark:text-white focus:outline-none focus:ring-0"
                    rows={1}
                    placeholder={
                      loading
                        ? "Analyzing..."
                        : "Describe your symptoms..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-20"
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
