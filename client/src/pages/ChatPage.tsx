import { useState } from "react";
import ChatHistory from "@/components/ChatHistory/ChatHistory";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface Message {
  id: number;
  text: string;
  role: "user" | "bot";
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messages: Array<{ text: string, role: 'user' | 'bot' }>;
}

const ChatPage = () => {
  // State for managing chat messages and UI
  const [messages, setMessages] = useState<Message[]>([]); // Current chat messages
  const [input, setInput] = useState(""); // User input text
  const [loading, setLoading] = useState(false); // Loading state for bot responses
  const [showNewChat, setShowNewChat] = useState(false); // Toggle for new chat button
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null); // Current chat session ID

  // Handles sending a new message
  const handleSend = () => {
    if (!input.trim()) return; // Don't send empty messages

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      role: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // First loading message
    const loadingMsg1: Message = {
      id: Date.now() + 1,
      text: "Analyzing symptoms...",
      role: "bot",
    };
    setMessages((prev) => [...prev, loadingMsg1]);

    // Second loading message after delay
    setTimeout(() => {
      const loadingMsg2: Message = {
        id: Date.now() + 2,
        text: "Preparing the best advice...",
        role: "bot",
      };
      setMessages((prev) => [...prev, loadingMsg2]);

      // Final response after another delay
      setTimeout(() => {
        const responseMsg = {
          id: Date.now() + 3,
          text: `Based on your symptoms, here's a possible suggestion: Stay hydrated, rest well, and consult a doctor if symptoms persist.`,
          role: "bot" as const,
        };

        setMessages((prev) => [
          ...prev.filter(msg => msg.id !== loadingMsg1.id && msg.id !== loadingMsg2.id),
          responseMsg
        ]);

        // Save to chat history
        const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        const newSession = {
          id: currentSessionId || Date.now().toString(),
          title: `Chat ${new Date().toLocaleDateString()}`,
          lastMessage: responseMsg.text,
          timestamp: Date.now(),
          messages: [...messages, responseMsg]
        };
        localStorage.setItem('chatSessions', JSON.stringify([
          newSession,
          ...sessions.filter((s: any) => s.id !== currentSessionId)
        ]));

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

  return (
    // Main container with dark/light theme support
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header with logo, theme toggle and chat history */}
      <header className="px-2 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-1 sm:gap-2">
          <img src="/logo.png" alt="HealthMate Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
          <h1 className="text-sm sm:text-lg font-semibold">HealthMate</h1>
        </div>
        {/* Header controls */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          {/* <ThemeToggle /> */}

          {/* Chat history button */}
          <div className="relative">
            <ChatHistory
              onSelectSession={(session: ChatSession) => {
                setMessages(session.messages.map((msg: { text: string, role: 'user' | 'bot' }) => ({
                  id: Date.now(),
                  text: msg.text,
                  role: msg.role
                })));
                setCurrentSessionId(session.id);
              }}
              onCreateNew={() => {
                setMessages([]);
                setCurrentSessionId(null);
                setShowNewChat(false);
              }}
            />
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      {/* Chat messages area with responsive padding */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-5 bg-gray-50 dark:bg-gray-900 custom-scrollbar">

        {/* Render all messages with appropriate styling */}
        {messages.map((msg) => (

          <div
            key={msg.id}
            className={`flex transition-all duration-300 ${msg.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`relative w-fit max-w-[90%] sm:max-w-2xl px-4 py-2 sm:px-5 sm:py-3 rounded-2xl text-sm sm:text-base shadow-md ${msg.role === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                }`}
            >
              {msg.text}
            </div>
          </div>

        ))}
      </div>

      {/* Chat Input */}
      {/* Fixed input area at bottom with responsive sizing */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-2 sm:pb-4 px-2 sm:px-4">
        {/* Input container that grows responsively */}
        <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl">
          {showNewChat ? (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setMessages([]);
                  setShowNewChat(false);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 sm:px-6 sm:py-3 rounded-md text-sm sm:text-base"
              >
                New Chat
              </button>
            </div>
          ) : (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl animate-fade-in-up">
            <textarea
              className="flex-1 resize-none rounded-md border-none bg-transparent px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-0"
              rows={1}
              placeholder={loading ? "Analyzing..." : "Describe your symptoms..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={() => {
                handleSend();
                setShowNewChat(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 sm:px-5 sm:py-2.5 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center animate-pulse">Thinking...</span>
              ) : (
                "Send"
              )}
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

