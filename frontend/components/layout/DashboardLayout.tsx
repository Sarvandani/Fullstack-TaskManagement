'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Bar - Horizontal Layout */}
      <header className="block lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="flex items-center justify-between px-2 sm:px-3 py-2.5 gap-2">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 flex-shrink-0 truncate max-w-[120px]">
            TaskManager
          </h1>
          <nav className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 justify-center">
            <a
              href="/dashboard"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              <span>Dashboard</span>
            </a>
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:flex lg:flex-col bg-white border-r border-gray-200">
        <div className="p-6 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">TaskManager</h1>
          <nav className="space-y-2">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </a>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-14 sm:pt-16 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
