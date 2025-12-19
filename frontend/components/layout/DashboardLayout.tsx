'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FolderKanban, BarChart3, LogOut, User } from 'lucide-react';

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
      {/* Mobile Top Bar - Only visible on mobile */}
      <header className="block md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">TaskManager</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden xs:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-[100px]">
                  {user?.name}
                </p>
              </div>
            </div>
            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Only visible on desktop */}
      <aside className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6">
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
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
      <main className="p-4 md:ml-64 md:p-8">
        {children}
      </main>
    </div>
  );
}
