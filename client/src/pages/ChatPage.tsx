import { useState, useEffect, useRef } from "react";
import { Share2, Menu, Send } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import DOMPurify from "dompurify";
import ChatHistory from "@/components/ChatHistory/ChatHistory";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import StarBorder from "@/components/ui/StarBorder";
import { useAuth } from "@/context/AuthContext";
import { API_ROUTES } from "@/../utils/apiConfig";

/**
 * Interface defining the structure of a chat message
 * Represents individual messages in a conversation between user and bot
 */
interface Message {
  id: number;
  text: string;
  role: "user" | "bot";
  isHTML?: boolean;
}

/**
 * Type defining the structure of a chat session for local storage
 * Represents a saved conversation with metadata
 */
type ChatSession = {
  id: string; // Unique identifier for the chat session
  title: string; // Title/description of the chat
  lastMessage: string; // Last message in the conversation
  timestamp: number; // Timestamp when the session was created
  messages: Array<{ text: string; role: "user" | "bot" }>; // Array of messages in the conversation
};

/**
 * Main ChatPage Component
 * Primary interface for user-bot conversations with symptom analysis
 * Handles message sending, session management, and UI interactions
 */
const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [_isSharedChat, setIsSharedChat] = useState(false);
  const [isOpenHamburger, setIsOpenHamburger] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  /**
   * Effect for handling shared chat URLs
   * Parses URL parameters to load shared chat sessions when present
   */
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

  /**
   * Effect for handling shared chat URLs
   * Parses URL parameters to load shared chat sessions when present
   */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Saves chat session to local storage
   * @param updatedMessages - Array of messages to save
   * @param lastMessage - The most recent message content for session preview
   */
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
      JSON.stringify([
        newSession,
        ...sessions.filter((s) => s.id !== newSession.id),
      ])
    );
  };

  /**
   * Simulates typing animation for bot messages
   * Iterates through the full text and reveals it character by character
   *
   * @param fullText - The complete diagnosis text to simulate typing for
   * @param callback - Function invoked with the current partial text at each step
   */
  const simulateTyping = (
    fullText: string,
    callback: (partial: string) => void
  ) => {
    let i = 0;
    const interval = setInterval(() => {
      callback(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 1);
  };

  /**
   * Handles sending user messages to the AI diagnosis API
   * Processes user input, shows loading state, and handles API response
   */
  const handleSend = async () => {
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

    try {
      const { data } = await axios.post(
        API_ROUTES.createDiagnosis,
        {
          userId: user?.id,
          symptoms: input.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessages((prev) => {
        const updated = [...prev.filter((m) => m.id !== loadingMsg.id)];
        const botMsg: Message = {
          id: Date.now() + 2,
          text: "",
          role: "bot",
          isHTML: true,
        };
        updated.push(botMsg);

        // Start typing simulation
        simulateTyping(data.diagnosis, (partial) => {
          setMessages((msgs) =>
            msgs.map((m) => (m.id === botMsg.id ? { ...m, text: partial } : m))
          );
        });

        saveSession(updated, data.diagnosis);
        return updated;
      });
    } catch (error) {
      setMessages((prev) => {
        const updated = [
          ...prev.filter((m) => m.id !== loadingMsg.id),
          {
            id: Date.now() + 2,
            text: "Error analyzing symptoms. Please try again later.",
            role: "bot" as const,
          },
        ];
        saveSession(updated, "Error analyzing symptoms");
        return updated;
      });
    } finally {
      setLoading(false);
      setShowNewChat(true);
    }
  };

  /**
   * Keyboard event handler for message input
   * Sends message on Enter key press, allows Shift+Enter for new lines
   * @param e - React keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Handles sharing user symptoms and AI diagnosis
   * via native share API or clipboard fallback
   * @param symptoms - The user inputted symptoms
   * @param diagnosis - The AI generated diagnosis
   * @param shareUrl - Whether to include the chat URL in the shared content
   */

  const stripHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const handleShareMessage = async (
    symptoms: string,
    diagnosis: string,
    shareUrl = false
  ) => {
    const plainSymptoms = stripHtml(symptoms);
    const plainDiagnosis = stripHtml(diagnosis);

    const content = `📝 Symptoms:\n${plainSymptoms}\n\n🤖 AI Diagnosis:\n${plainDiagnosis}${
      shareUrl ? `\n\n🔗 ${window.location.href}` : ""
    }`;

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
        shareUrl
          ? "Chat link copied with details!"
          : "Symptoms & diagnosis copied!"
      );
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="h-screen w-full bg-neutral-100 dark:bg-neutral-950 text-gray-900 dark:text-gray-100">
        <Sidebar
          side="left"
          variant="sidebar"
          collapsible="icon"
          className="hidden w-fit sm:flex"
        >
          <SidebarContent>
            <div className="flex flex-col items-center justify-between h-full">
              <div className="pt-2">
                <ChatHistory
                  onSelectSession={(session: ChatSession) => {
                    setMessages(
                      session.messages.map((msg) => ({
                        ...msg,
                        id: Date.now() + Math.random(),
                        role: msg.role as "user" | "bot",
                        isHTML: msg.role === "bot",
                      }))
                    );
                    setCurrentSessionId(session.id);
                    const hasDiagnosis = session.messages.some(
                      (msg) => msg.role === "bot"
                    );
                    setShowNewChat(hasDiagnosis);
                  }}
                  onCreateNew={() => {
                    setMessages([]);
                    setCurrentSessionId(null);
                    setShowNewChat(false);
                  }}
                  mobileView={false}
                  setIsOpenHamburger={setIsOpenHamburger}
                  setShowNewChat={setShowNewChat}
                />
              </div>

              <div className="pb-4">
                <Avatar className="h-8 w-8 border border-emerald-200 dark:border-emerald-800 bg-emerald-500 dark:bg-emerald-600">
                  <AvatarFallback className="text-white font-semibold">
                    {user?.name?.trim()?.charAt(0)?.toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col h-screen relative">
          <div className="md:hidden absolute top-3 left-3 z-50">
            <Sheet open={isOpenHamburger} onOpenChange={setIsOpenHamburger}>
              <SheetTrigger asChild>
                <button
                  className="p-2 bg-white dark:bg-neutral-800 rounded-full shadow-md cursor-pointer"
                  onClick={() => setIsOpenHamburger(true)}
                >
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
                        role: msg.role as "user" | "bot",
                        isHTML: msg.role === "bot",
                      }))
                    );
                    setCurrentSessionId(session.id);
                    const hasDiagnosis = session.messages.some(
                      (msg) => msg.role === "bot"
                    );
                    setShowNewChat(hasDiagnosis);
                  }}
                  onCreateNew={() => {
                    setMessages([]);
                    setCurrentSessionId(null);
                    setShowNewChat(false);
                  }}
                  mobileView={true}
                  setIsOpenHamburger={setIsOpenHamburger}
                  setShowNewChat={setShowNewChat}
                />
              </SheetContent>
            </Sheet>
          </div>

          <header
            className="px-4 py-3 bg-white dark:bg-neutral-900
 border-b border-emerald-200 dark:border-emerald-800 flex items-center gap-2 w-full pl-14"
          >
            <button
              className={`flex items-center gap-2 flex-1 ${
                messages.length > 0 ? "cursor-pointer" : "cursor-default"
              }`}
              onClick={() => {
                if (messages.length > 0) {
                  setMessages([]);
                  setCurrentSessionId(null);
                  setShowNewChat(false);
                  toast.success("New chat started");
                }
              }}
            >
              <img src="/logo.png" alt="HealthMate Logo" className="size-9" />
              <h1 className="text-lg font-semibold truncate">HealthMate</h1>
            </button>
            <ThemeToggleButton start="top-right" />
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 bg-neutral-100 dark:bg-neutral-950 custom-scrollbar">
            {messages.length > 0 ? (
              <div className="max-w-3xl mx-auto w-full px-2 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start flex-col"
                    }`}
                  >
                    <div
                      className={`w-fit max-w-[85%] xs:max-w-[90%] sm:max-w-[85%] md:max-w-[70%] px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base shadow-md ${
                        msg.role === "user"
                          ? "bg-emerald-500 dark:bg-emerald-600 text-white rounded-br-sm"
                          : " dark:bg-emerald-950 dark:text-emerald-100 bg-emerald-50 text-emerald-900 rounded-bl-sm"
                      }`}
                      dangerouslySetInnerHTML={
                        msg.isHTML
                          ? { __html: DOMPurify.sanitize(msg.text) }
                          : { __html: msg.text }
                      }
                    />

                    {msg.role === "bot" && msg.isHTML && (
                      <button
                        onClick={() => {
                          const prevMsg = messages[index - 1];
                          const symptoms =
                            prevMsg?.role === "user" ? prevMsg.text : "N/A";
                          const diagnosis = msg.text || "N/A";
                          handleShareMessage(symptoms, diagnosis);
                        }}
                        className="flex items-center gap-1 text-2xs sm:text-md text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 mt-1 hover:underline cursor-pointer"
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
                          "linear-gradient(120deg, #059669, #34d399, rgba(180, 180, 180,0.8) 50%, #34d399, #059669)",
                        backgroundSize: "200% 100%",
                        animation: "shine 5s linear infinite",
                      }}
                    >
                      Welcome to HealthMate Chat
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Describe your symptoms to get personalized health advice
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 flex justify-center px-3 sm:px-4 pb-4 sm:pb-4 bg-neutral-100 dark:bg-neutral-950 mb-1.5">
            <div className="w-full max-w-3xl">
              {showNewChat ? (
                <div className="flex items-center justify-between px-4 py-3 bg-neutral-200 dark:bg-neutral-800 rounded-lg">
                  <p className="text-md text-gray-700 dark:text-gray-300">
                    Only one diagnosis is allowed per chat. Start a new chat to
                    diagnose new symptoms.
                  </p>
                  <button
                    onClick={() => {
                      setMessages([]);
                      setShowNewChat(false);
                      setCurrentSessionId(null);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-md text-sm cursor-pointer"
                  >
                    New Chat
                  </button>
                </div>
              ) : (
                <StarBorder
                  as="div"
                  className="custom-class w-full"
                  color="#22d3ee"
                  speed="5s"
                  thickness={2}
                >
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 backdrop-blur-sm w-full">
                    <textarea
                      className="flex-1 resize-none bg-transparent px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base text-gray-900 dark:text-white placeholder-emerald-500 dark:placeholder-emerald-400 focus:outline-none focus:ring-0"
                      rows={1}
                      placeholder={
                        loading ? "Analyzing..." : "Describe your symptoms..."
                      }
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={loading}
                    />
                    <button
                      onClick={handleSend}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600  hover:from-emerald-600 hover:to-emerald-700  text-white font-semibold px-3 sm:px-4 py-1 sm:py-2  rounded-md transition-all duration-200  disabled:opacity-50 disabled:cursor-not-allowed w-16 sm:w-20 flex justify-center items-center cursor-pointer"
                      disabled={loading || !input.trim()}
                    >
                      {loading ? "..." : <Send />}
                    </button>
                  </div>
                </StarBorder>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ChatPage;
