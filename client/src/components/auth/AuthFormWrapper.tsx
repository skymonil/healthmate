import AuthFormSwitcher from "./AuthFormSwitcher";

const AuthFormWrapper = () => {
  return (
    <div className="w-full max-w-md rounded-2xl shadow-xl p-8 md:p-10 border border-emerald-200 dark:border-emerald-800 bg-neutral-100 dark:bg-neutral-900">
      <div className="text-center space-y-1 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome to{" "}
          <span className="text-emerald-600 dark:text-emerald-400">
            HealthMate
          </span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Your AI-powered health partner.
        </p>
      </div>

      <AuthFormSwitcher />
    </div>
  );
};

export default AuthFormWrapper;
