import AppRouter from "./router/AppRouter";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider"

function App() {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <AppRouter />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </>
  );
}

export default App;
