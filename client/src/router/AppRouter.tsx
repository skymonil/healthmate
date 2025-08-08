import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import AuthPage from "@/pages/AuthPage";
import ChatPage from "@/pages/ChatPage";
import { useAuth } from "@/context/AuthContext";

export default function AppRouter() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          // element={isLoggedIn ? <Navigate to="/chat" /> : <AuthPage />}
          element={<ChatPage />}
        />
        <Route
          path="/chat"
          element={isLoggedIn ? <ChatPage /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
