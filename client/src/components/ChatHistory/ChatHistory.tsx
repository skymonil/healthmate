import { useState, useEffect } from "react";
import {
  Menu,
  Plus,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import logo from "/logo.png";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import * as SheetPrimitive from "@radix-ui/react-dialog"

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
  mobileView
}: {
  onSelectSession: (session: ChatSession) => void;
  onCreateNew: () => void;
  mobileView: boolean;
}) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

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
    mobileView ? setIsOpen(true) : setIsOpen(false);
    const savedSessions = localStorage.getItem("chatSessions");
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  const handleNewChat = () => {
    onCreateNew();
    setIsOpen(false);
  };

  const confirmDelete = (session: ChatSession) => {
    setSessionToDelete(session);
  };

  const handleDelete = () => {
    if (!sessionToDelete) return;
    const updatedSessions = sessions.filter(
      (s) => s.id !== sessionToDelete.id
    );
    setSessions(updatedSessions);
    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
    toast.success("Chat deleted");
    setSessionToDelete(null);
  };

  return (
    <div className="relative">
      {/* Mobile Menu Button */}
      <button
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="fixed inset-y-0 left-0 w-72 sm:w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col animate-slide-in"
          >
            {/* Header */}
            {!mobileView ? <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-inherit z-10">
              <button
                className="flex items-center gap-2 font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-colors"
                onClick={onCreateNew}
              >
                <img src={logo} alt="HealthMate" className="h-5 w-5" />
                <span>HealthMate</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div> :

              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-inherit z-10">
                <button
                  onClick={onCreateNew}
                  className="flex items-center gap-2 font-semibold text-lg px-2 py-1 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <img src={logo} alt="HealthMate" className="h-6 w-6 rounded-sm shadow-sm" />
                  <span className="tracking-tight">HealthMate</span>
                </button>

                <SheetPrimitive.Close asChild>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </button>
                </SheetPrimitive.Close>
              </div>}

            {/* New Chat + Search */}
            <div className="p-3 space-y-3 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                <Plus size={16} />
                New Chat
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Session List */}
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
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition rounded-md"
                      onClick={() => {
                        onSelectSession(session);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm truncate flex-1">
                          {session.title}
                        </div>
                        <button
                          className="p-1 ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(session);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <Trash2 size={14} />
                        </button>
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
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 sticky bg-white dark:bg-gray-900 bottom-2">
              <DropdownMenu onOpenChange={(open) => setIsOpenDialog(open)}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:focus:ring-blue-500/50">
                    <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700 bg-blue-500 dark:bg-blue-600">
                      <AvatarFallback className="text-white font-semibold">
                        {user?.name?.trim()?.charAt(0)?.toUpperCase() || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 text-left overflow-hidden">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.name || "Chirag"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        chiragvaru03@gmail.com
                      </span>
                    </div>
                    {isOpenDialog ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden"
                >
                  <DropdownMenuLabel className="px-3 py-2 text-xs tracking-wide text-gray-500 dark:text-gray-400">
                    Account
                    {/* Free Plan */}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Log Out
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteAccountOpen(true)}
                    className="px-3 py-2 text-sm cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 dark:text-red-400"
                  >
                    Delete Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </>
      )}

      {/* Account delete confirmation dialog */}
      <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogTitle>Delete Account Settings</DialogTitle>
          <DialogDescription>dialog-box for deleting account.</DialogDescription>
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100 text-lg">
              Delete Account
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="text-gray-700 dark:text-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 mr-2 hover:bg-gray-700"
              onClick={() => setIsDeleteAccountOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white"
              onClick={() => {
                console.log("Deleting account...");
                toast.success("Account deleted");
                setIsDeleteAccountOpen(false);
                logout();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogTitle>Delete Chat</DialogTitle>
          <DialogDescription>dialog-box for deleting chat.</DialogDescription>
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100 text-lg">
              Delete Chat
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to delete "{sessionToDelete?.title}"? This cannot be undone.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="text-gray-700 dark:text-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 mr-2 hover:bg-gray-700"
              onClick={() => setSessionToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>
        {`
          .animate-slide-in {
            animation: slideIn 0.25s ease-out forwards;
          }
          @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(107, 114, 128, 0.4);
            border-radius: 9999px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(107, 114, 128, 0.6);
          }
        `}
      </style>
    </div>
  );
};

export default ChatHistory;
