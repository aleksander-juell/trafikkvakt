import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  MapPin, 
  Calendar, 
  ClipboardList,
  Home,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Parents', href: '/parents', icon: Users },
  { name: 'Children', href: '/children', icon: UserPlus },
  { name: 'Crossings', href: '/crossings', icon: MapPin },
  { name: 'Weeks', href: '/weeks', icon: Calendar },
  { name: 'Duties', href: '/duties', icon: ClipboardList },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Holmen Skole 4C</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-4 bg-primary-600 text-white">
              <h1 className="text-xl font-bold">Holmen Skole 4C</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive(item.href)
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 lg:pl-0">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}