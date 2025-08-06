import AuthFormSwitcher from "./AuthFormSwitcher";

const AuthFormWrapper = () => {
  return (
    <div className="w-full max-w-md rounded-2xl shadow-xl p-8 md:p-10 border border-border">
      <div className="text-center space-y-1 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome to <span className="">HealthMate</span>
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
