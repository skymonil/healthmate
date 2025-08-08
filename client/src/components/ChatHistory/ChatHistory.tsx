import { useState, useEffect } from "react";
import { Menu, MessageSquare, Plus, Search, X } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messages: Array<{ text: string; role: "user" | "bot" }>;
}

const ChatHistory = ({
  onSelectSession,
  onCreateNew,
}: {
  onSelectSession: (session: ChatSession) => void;
  onCreateNew: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSessions = sessions.filter((session) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      session.title.toLowerCase().includes(searchLower) ||
      session.lastMessage.toLowerCase().includes(searchLower) ||
      session.messages.some((msg) =>
        msg.text.toLowerCase().includes(searchLower)
      )
    );
  });

  useEffect(() => {
    const savedSessions = localStorage.getItem("chatSessions");
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  const handleNewChat = () => {
    onCreateNew();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Mobile Menu Button */}
      <button
        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsOpen(false)} />

          <div className="fixed inset-y-0 left-0 w-72 sm:w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg z-50 flex flex-col">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-2 font-semibold">
                <MessageSquare className="h-5 w-5" />
                <span>Chat History</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* New Chat + Search */}
            <div className="p-3 space-y-3 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
              >
                <Plus size={16} />
                New Chat
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Scrollable Session List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {searchTerm && filteredSessions.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No chats found matching "{searchTerm}"
                </div>
              ) : filteredSessions.length > 0 ? (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredSessions.map((session) => (
                    <li
                      key={session.id}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                      onClick={() => {
                        onSelectSession(session);
                        setIsOpen(false);
                      }}
                    >
                      <div className="font-medium text-sm truncate">
                        {session.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {session.lastMessage}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No chat history yet
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  C
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium">Chirag</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Free Plan</span>
                </div>
              </div>
              <button
                className="mt-3 w-full py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition"
                onClick={() => setIsOpen(false)}
              >
                Close Sidebar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Scrollbar Styles */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(107, 114, 128, 0.5);
            border-radius: 9999px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
        `}
      </style>
    </div>
  );
};

export default ChatHistory;
