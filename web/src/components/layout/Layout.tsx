import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { History, Home, LogOut, Menu, User, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOutUser } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Map', href: '/map', icon: History },
    { name: 'History', href: '/history', icon: History },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
              PZ
            </div>
            <div className="leading-tight">
              <span className="block text-base font-semibold text-slate-900">PicZFlip</span>
              <span className="block text-xs text-slate-500">Product intelligence</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-1 py-1 text-sm font-medium text-slate-600 shadow-sm md:flex">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-sm text-slate-500">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-900 hover:text-white"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200/80 p-2 text-slate-500 transition hover:bg-slate-100 md:hidden"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white/90 backdrop-blur md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              );
            })}
            <div className="rounded-2xl border border-slate-200/80 bg-white px-3 py-3 text-sm text-slate-500">
              <div className="font-medium text-slate-700">{user?.displayName || user?.email}</div>
              <button
                onClick={handleSignOut}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/80 px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-900 hover:text-white"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80 py-10 text-sm text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium text-slate-700">&copy; {new Date().getFullYear()} PicZFlip</p>
            <p>Simple marketplace analysis for modern teams.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/history" className="hover:text-slate-700">History</Link>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <Link to="/profile" className="hover:text-slate-700">Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
