import React from 'react';

interface HostProfileProps {
  name?: string;
}

export const HostProfile: React.FC<HostProfileProps> = ({ name }) => {
  const greeting = name ? `Welcome, ${name}!` : 'Welcome!';

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white p-8 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

      {/* Left Side: Profile */}
      <div className="flex flex-col sm:flex-row items-center gap-5 z-10 w-full sm:w-auto">
        {/* Logo with Gradient Border */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <img
            src="/img/logo.png"
            alt="Vinteum Logo"
            className="relative w-16 h-16 rounded-full object-cover border-2 border-white shadow-md bg-white p-1"
          />
        </div>

        {/* Profile Info */}
        <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
          <h1 className="text-xl font-bold text-gray-800">Vinteum Software</h1>
          <p className="text-sm text-gray-500 font-medium mb-2">Book your demo</p>
          <p className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
            {greeting}
          </p>
        </div>
      </div>

      {/* Right Side: Meeting Details */}
      <div className="flex flex-col gap-2 z-10 w-full sm:w-auto">
        {/* Meeting Info Card */}
        <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-200 shadow-sm justify-between sm:justify-start">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">
              Meeting Details
            </span>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="flex items-center gap-1 text-gray-800">
                <span className="material-icons-round text-base text-gray-500">schedule</span>
                60 Min
              </span>
              <span className="w-px h-3 bg-gray-200"></span>
              <span className="flex items-center gap-1 text-gray-800">
                <span className="material-icons-round text-base text-primary">videocam</span>
                Zoom
              </span>
            </div>
          </div>
        </div>

        {/* Timezone Selector */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 rounded-lg border border-transparent hover:border-gray-200 transition-colors cursor-pointer group">
          <span className="material-icons-round text-sm text-blue-500 group-hover:animate-pulse-subtle">public</span>
          <span className="text-xs text-gray-500">Timezone:</span>
          <span className="text-xs font-semibold text-gray-800">America/Sao_Paulo</span>
          <span className="material-icons-round text-sm text-gray-500 opacity-50">expand_more</span>
        </div>
      </div>
    </div>
  );
};
