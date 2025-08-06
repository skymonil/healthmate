const AuthVisual = () => {
  return (
    <div className="hidden md:block w-full md:w-1/2 h-screen">
      <div className="h-full w-full  text-white flex flex-col items-center justify-center">
        <img
          src="/auth-illustration.png"
          alt="AI Diagnosis Visual"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
};

export default AuthVisual;
