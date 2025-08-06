import AuthFormWrapper from "@/components/auth/AuthFormWrapper";
import AuthVisual from "@/components/auth/AuthVisual";
import ThemeToggle from "@/components/ui/ThemeToggle";

const AuthPage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-gray-100">
        <ThemeToggle />
      {/* Left Visual Section */}
      <AuthVisual />

      {/* Right Auth Form Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AuthFormWrapper />
      </div>
    </div>
  );
};

export default AuthPage;
