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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import axios from "axios";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { API_ROUTES } from "@/../utils/apiConfig";

/**
 * Interface defining the structure of a chat session
 * Represents a conversation between user and bot with messages and metadata
 */

interface ChatSession {
  id: string; // Unique identifier for the chat session
  title: string; // Title/description of the chat (truncated symptoms)
  lastMessage: string; // Last message in the conversation (truncated diagnosis)
  timestamp: number; // Timestamp when the session was created
  messages: Array<{
    // Array of messages in the conversation
    text: string; // Message content
    role: "user" | "bot"; // Sender of the message
    isHTML?: boolean; // Flag indicating if message contains HTML content
  }>;
}

/**
 * ChatHistory Component
 * Sidebar component that displays user's chat history and account controls
 * Handles session selection, creation, deletion, and user account management
 */
const ChatHistory = ({
  onSelectSession, // Callback when a chat session is selected
  onCreateNew, // Callback to create a new chat session
  mobileView, // Flag indicating if component is in mobile view
  setIsOpenHamburger, // Function to control hamburger menu state
}: {
  onSelectSession: (session: ChatSession) => void;
  onCreateNew: () => void;
  mobileView: boolean;
  setIsOpenHamburger: (openHamberger: boolean) => void;
  setShowNewChat: (showNewChat: boolean) => void;
}) => {
  const { user, logout, setUser } = useAuth(); // Authentication context utilities
  const [isOpen, setIsOpen] = useState(false); // State for sidebar visibility
  const [sessions, setSessions] = useState<ChatSession[]>([]); // Array of chat sessions
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering sessions
  const [isOpenDialog, setIsOpenDialog] = useState(false); // State for dropdown menu visibility
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(
    null
  ); // Session marked for deletion
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false); // State for account deletion dialog

  /**
   * Filters chat sessions based on search term
   * Searches through session titles, last messages, and all message content
   */
  const filteredSessions = sessions.filter((session) => {
    if (!searchTerm) return true; // Return all sessions if no search term
    const searchLower = searchTerm.toLowerCase();
    return (
      session.title.toLowerCase().includes(searchLower) || // Search in title
      session.lastMessage.toLowerCase().includes(searchLower) || // Search in last message
      session.messages.some(
        (
          msg // Search in all messages
        ) => msg.text.toLowerCase().includes(searchLower)
      )
    );
  });

  /**
   * Effect hook to initialize component state and fetch data
   * Handles mobile view, chat history, and user details
   */
  useEffect(() => {
    if (!user?.id) return; //Should not fetch user history until userId is retrieved
    mobileView ? setIsOpen(true) : setIsOpen(false); // Auto-open sidebar in mobile view

    /**
     * Fetches user's chat history from the backend API
     * Maps backend response to ChatSession format
     */
    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(API_ROUTES.getDiagnosisHistory, {
          params: { userId: user?.id },
          headers: { Authorization: `Bearer ${token}` },
        });

        // Transform backend data into ChatSession format
        const backendSessions = response.data.map((report: any) => ({
          id: report.reportId,
          title:
            report.symptoms?.substring(0, 50) +
            (report.symptoms?.length > 50 ? "..." : ""), // Truncate symptoms for title
          lastMessage:
            report.diagnosis?.substring(0, 50) +
            (report.diagnosis?.length > 50 ? "..." : ""), // Truncate diagnosis for preview
          timestamp: new Date(report.createdAt).getTime(), // Convert to timestamp
          messages: [
            { text: `${report.symptoms}`, role: "user" as const }, // User message with symptoms
            { text: report.diagnosis, role: "bot" as const }, // Bot message with diagnosis
          ],
        }));
        setSessions(backendSessions);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        toast.error("Failed to load chat history");
      }
    };

    fetchChatHistory();
  }, [user?.id]); // Dependency: re-fetch when user ID changes

  /**
   * Handles account deletion by making API call and cleaning up local storage
   * Removes user token, user data, and updates auth state
   */
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(API_ROUTES.deleteAccount, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token"); // Clear authentication token
      localStorage.removeItem("user"); // Clear user data
      setUser(null); // Update auth context
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  /**
   * Handles creating a new chat session
   * Resets search and deletion states, triggers parent callback, and closes sidebar
   */
  const handleNewChat = () => {
    setSearchTerm(""); // Clear search term
    setSessionToDelete(null); // Clear any pending deletion
    onCreateNew(); // Trigger parent callback
    setIsOpen(false); // Close sidebar
    setIsOpenHamburger(false); // Close hamburger menu if open
  };

  /**
   * Initiates chat session deletion process
   * Sets the session to be deleted for confirmation dialog
   */
  const confirmDelete = (session: ChatSession) => {
    setSessionToDelete(session); // Set session for deletion confirmation
  };

  /**
   * Deletes a chat session by making API call and updating local state
   * Removes the session from both backend and UI
   */
  const handleDelete = async () => {
    if (!sessionToDelete) return; // Guard clause if no session to delete

    try {
      const token = localStorage.getItem("token");
      await axios.delete(API_ROUTES.deleteDiagnosisById(sessionToDelete.id), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedSessions = sessions.filter(
        (s) => s.id !== sessionToDelete.id
      );
      setSessions(updatedSessions);
      toast.success("Chat deleted");
      setSessionToDelete(null);
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  return (
    <div className="relative">
      {/* Mobile Menu Button */}
      <button
        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-300 transition cursor-pointer"
        onClick={() => {
          setIsOpenHamburger(false);
          setIsOpen(true);
        }}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => {
              setIsOpen(false);
              setIsOpenHamburger(false);
            }}
          />

          <div className="fixed inset-y-0 left-0 w-72 sm:w-80 bg-white dark:bg-neutral-900 border-r border-emerald-100 dark:border-emerald-800 shadow-2xl z-50 flex flex-col animate-slide-in">
            {/* Header */}
            {!mobileView ? (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-inherit z-10">
                <button
                  className="flex items-center gap-2 font-semibold text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  onClick={() => {
                    onCreateNew();
                    setIsOpenHamburger(false);
                    setIsOpen(false);
                  }}
                >
                  <img src={logo} alt="HealthMate" className="size-9" />
                  <span>HealthMate</span>
                </button>
                <button
                  onClick={() => {
                    setIsOpenHamburger(false);
                    setIsOpen(false);
                  }}
                  className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800  sticky top-0 bg-inherit z-10">
                <button
                  onClick={() => {
                    onCreateNew();
                    setIsOpenHamburger(false);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 font-semibold text-lg px-2 py-1 rounded-md transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <img
                    src={logo}
                    alt="HealthMate"
                    className="size-8 rounded-sm shadow-sm"
                  />
                  <span className="tracking-tight">HealthMate</span>
                </button>
                <SheetPrimitive.Dialog>
                  <SheetPrimitive.Close asChild>
                    <button
                      onClick={() => {
                        setIsOpenHamburger(false);
                        setIsOpen(false);
                      }}
                      className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </button>
                  </SheetPrimitive.Close>
                </SheetPrimitive.Dialog>
              </div>
            )}

            {/* New Chat */}
            <div className="p-3 space-y-3 border-b border-gray-100 dark:border-gray-800">
              <SheetPrimitive.Dialog>
                <SheetPrimitive.Close asChild>
                  <button
                    // onClick={handleNewChat}
                    onClick={() => {
                      setIsOpenHamburger(false);
                      setIsOpen(false);
                      handleNewChat();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500 dark:bg-emerald-600 text-white hover:bg-emerald-400 transition cursor-pointer"
                  >
                    <Plus size={16} />
                    New Chat
                  </button>
                </SheetPrimitive.Close>
              </SheetPrimitive.Dialog>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    <SheetPrimitive.Dialog key={session.id}>
                      <SheetPrimitive.Close asChild key={session.id}>
                        <li
                          key={session.id}
                          className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition rounded-md"
                          onClick={() => {
                            onSelectSession(session);
                            setIsOpen(false);
                            setIsOpenHamburger(false);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-medium text-sm truncate flex-1">
                              {session.title}
                            </div>
                            <button
                              className="p-1 ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 cursor-pointer"
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
                      </SheetPrimitive.Close>
                    </SheetPrimitive.Dialog>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No chat history yet
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-emerald-100 dark:border-emerald-800 sticky bg-white dark:bg-neutral-900 bottom-2">
              <DropdownMenu onOpenChange={(open) => setIsOpenDialog(open)}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:focus:ring-emerald-500/50">
                    <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700 bg-emerald-500 dark:bg-emerald-600">
                      <AvatarFallback className="text-white font-semibold">
                        {user?.name?.trim()?.charAt(0)?.toUpperCase() || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 text-left overflow-hidden">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.name || "N/A"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || "not@loggedin.com"}
                      </span>
                    </div>
                    {isOpenDialog ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-56 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden"
                >
                  <DropdownMenuLabel className="px-3 py-2 text-xs tracking-wide text-gray-500 dark:text-gray-400">
                    Account
                    {/* Free Plan */}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-700" />

                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      toast.success("You have been logged out", {
                        description: "See you soon 👋",
                      });
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/40
"
                  >
                    Log Out
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteAccountOpen(true)}
                    className="px-3 py-2 text-sm cursor-pointer text-red-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 dark:text-red-400"
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
        <DialogContent className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100 text-lg">
              Delete Account
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to permanently delete your account? This
            action cannot be undone and all your data will be lost.
          </DialogDescription>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="text-gray-700 dark:text-gray-200 dark:bg-neutral-800 border-gray-300 dark:border-gray-600 mr-2 dark:hover:bg-neutral-700 cursor-pointer"
              onClick={() => setIsDeleteAccountOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white cursor-pointer"
              onClick={() => {
                console.log("Deleting account...");
                toast.success("Account deleted");
                setIsDeleteAccountOpen(false);
                handleDeleteAccount();
                logout();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!sessionToDelete}
        onOpenChange={() => setSessionToDelete(null)}
      >
        <DialogContent className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100 text-lg">
              Delete Chat
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to delete "{sessionToDelete?.title}"? This
            cannot be undone.
          </DialogDescription>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="text-gray-700 dark:text-gray-200 dark:bg-neutral-800 border-gray-300 dark:border-gray-600 mr-2 hover:bg-neutral-700 cursor-pointer"
              onClick={() => setSessionToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white cursor-pointer"
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
