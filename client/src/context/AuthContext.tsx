import { createContext, useContext, useEffect, useState } from "react";

/**
 * User interface representing authenticated user data
 * Contains basic user information for application authentication
 */
type User = {
  id: string;      // Unique user identifier
  name: string;    // User's display name
  email: string;   // User's email address
};

/**
 * Authentication Context Type Definition
 * Defines the shape of authentication context and available methods
 */
type AuthContextType = {
  user: User | null;                         // Currently authenticated user object
  token: string | null;                      // JWT authentication token
  login: (token: string, user: User) => void; // Login function to set user credentials
  logout: () => void;                        // Logout function to clear authentication
  setUser: (user: User | null) => void;      // Function to update user data
  prevChat: boolean;                         // Flag indicating if user has previous chats
  setPrevChat: (prevChat: boolean | false) => void; // Function to set previous chat flag
};

// Create React Context with authentication type, initially undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * Context provider that manages authentication state and persistence
 * Wraps the application to provide authentication functionality to all child components
 * @param children - React child components that need access to auth context
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [prevChat, setPrevChat] = useState<boolean>(false);

  /**
   * Persistent authentication state initialization
   * Restores user session from localStorage on component mount
   */
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedPrevChat = localStorage.getItem("prevChat");

    // Restore authentication if token and user data exist
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    // Restore previous chat preference if it exists
    if (savedPrevChat) {
      setPrevChat(JSON.parse(savedPrevChat));
    }
  }, []);

  /**
   * Login function to authenticate user
   * Sets authentication state and persists to localStorage
   * @param token - JWT authentication token received from server
   * @param user - User object containing user information
   */
  const login = (token: string, user: User) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  /**
   * Logout function to clear authentication
   * Clears all authentication state and removes localStorage items
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("prevChat");
  };

  /**
   * Handles setting the previous chat preference flag
   * Updates both state and localStorage for persistence
   * @param value - Boolean value indicating if user has previous chats
   */
  const handleSetPrevChat = (value: boolean) => {
    setPrevChat(value);
    localStorage.setItem("prevChat", JSON.stringify(value));
  };

  // Provide authentication context to all child components
  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, prevChat, setPrevChat: handleSetPrevChat }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * Provides easy access to authentication state and methods
 * @returns Authentication context with user, token, and auth methods
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
