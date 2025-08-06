import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LoginForm from "./LoginForm";
import RegisterForm from "./SignupForm";

const tabs = [
  { label: "Login", value: "login" },
  { label: "Signup", value: "register" },
];

const AuthFormSwitcher = () => {
  const [activeTab, setActiveTab] = useState("login");

  const renderForm = () => {
    switch (activeTab) {
      case "login":
        return <LoginForm />;
      case "register":
        return <RegisterForm />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full animate-fade-in text-slate-900 dark:text-gray-100">
      <div className="flex justify-center gap-2 mb-6">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "ghost"}
            className={cn(
              "rounded-full px-4 py-2 text-sm cursor-pointer transition-all",
              activeTab === tab.value
                ? "bg-emerald-500 dark:bg-emerald-400 text-white dark:text-slate-900 shadow-md"
                : "text-slate-900 dark:text-gray-100 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Separator className="bg-slate-400/40 dark:bg-slate-600/40 mb-4" />
      <div className="space-y-4">{renderForm()}</div>
    </div>
  );
};

export default AuthFormSwitcher;
