import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { API_ROUTES } from "@/../utils/apiConfig";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"signup" | "otp">("signup");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(API_ROUTES.register, form);

      toast.success("OTP sent!", {
        description: "Please check your email and enter the OTP.",
      });

      setStep("otp");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Signup failed. Please try again.";
      toast.error("Signup Failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(API_ROUTES.verifyOtp, {
        email: form.email,
        otp,
      });

      const { token } = response.data;

      const userResponse = await axios.get(API_ROUTES.getCurrentUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = userResponse.data;

      login(token, user);

      toast.success("Account verified!", {
        description: "Welcome aboard!",
      });

      navigate("/chat");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "OTP verification failed.";
      toast.error("Verification Failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return step === "signup" ? (
    <form
      onSubmit={handleSignup}
      className="space-y-4 animate-in fade-in duration-700"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Demoder Devanand"
          required
          value={form.name}
          onChange={handleChange}
          disabled={loading}
          className=""
        />
      </div>
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
        Sign Up
      </Button>
    </form>
  ) : (
    <form
      onSubmit={handleVerifyOtp}
      className="space-y-4 animate-in fade-in duration-700 "
    >
      <div className="space-y-2">
        <Label htmlFor="otp">Enter OTP sent to {form.email}</Label>
        <Input
          id="otp"
          name="otp"
          type="text"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
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
        Verify OTP
      </Button>
    </form>
  );
};

export default SignupForm;
