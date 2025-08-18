import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  // const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: form.email,
          password: form.password,
        }
      );

      const { token, userId } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      login(token, userId);

      // const userDetails = await axios.get("http://localhost:8080/api/auth/me", {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // setUser(userDetails.data);

      toast.success("Login successful!", {
        description: "Welcome back!",
      });
      navigate("/chat");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Login failed. Please try again.";

      toast.error("Authentication failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-4 animate-in fade-in duration-700"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          className=""
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          className=""
        />
      </div>

      <Button
        type="submit"
        className={cn(
          "w-full cursor-pointer",
          loading && "opacity-75 cursor-not-allowed"
        )}
        disabled={loading}
      >
        {loading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
