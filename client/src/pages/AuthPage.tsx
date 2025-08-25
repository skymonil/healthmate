import AuthFormWrapper from "@/components/auth/AuthFormWrapper";
import AuthVisual from "@/components/auth/AuthVisual";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";

const AuthPage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 relative">
      <div className="absolute top-4 right-4 z-10">
        {/* <ThemeToggle /> */}
        <ThemeToggleButton start="top-right" />
      </div>
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
