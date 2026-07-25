'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden w-full">
      {/* Sidebar handles both desktop and mobile modes */}
      <AdminSidebar isMobileOpen={isMobileOpen} closeSidebar={() => setIsMobileOpen(false)} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="ml-3 text-lg font-bold text-gray-800">PaSr Admin</h1>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold text-gray-600 hidden sm:inline-block">Connected</span>
            <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shadow-sm ml-2">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
