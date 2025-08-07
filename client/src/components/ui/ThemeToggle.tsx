import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme = "light", setTheme } = useTheme();

  return (
    <div className="absolute top-2 right-2 md:top-3 md:right-3 z-50 flex gap-1 p-1 rounded-full bg-gray-200 dark:bg-gray-800 shadow">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full ${theme === "light" ? "bg-white text-gray-900" : "text-gray-600 dark:text-gray-400"}`}
      >
        <Sun size={18} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full ${theme === "dark" ? "bg-gray-700 text-white" : "text-gray-600 dark:text-gray-400"}`}
      >
        <Moon size={18} />
      </button>
    </div>
  );
};

export default ThemeToggle;
