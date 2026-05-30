export default function AuthLayout({ children, leftContent, leftBg = "linkio-gradient-panel" }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream font-sans">
      {/* Left Column */}
      <div className={`w-full lg:w-[40%] ${leftBg} p-10 lg:p-16 flex flex-col justify-center text-white relative`}>
        {leftContent}
      </div>

      {/* Right Column */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-lg">{children}</div>
      </div>
    </div>
  );
}

