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
import { API_ROUTES } from "@/../utils/apiConfig";

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
      const response = await axios.post(API_ROUTES.login, {
        email: form.email,
        password: form.password,
      });

      const { token } = response.data;

      const userResponse = await axios.get(API_ROUTES.getCurrentUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = userResponse.data; 

      login(token, user);


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
          placeholder="demowashere@example.com"
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
          "w-full cursor-pointer text-white",
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
