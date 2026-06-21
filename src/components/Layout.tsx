import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: Props) {
  const location = useLocation();

  const navLinks = [
    { to: '/bills', label: 'Bills' },
    { to: '/currencies', label: 'Currencies' },
    { to: '/account', label: 'Account' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900">Fees</span>
              </div>
              <div className="ml-10 flex space-x-4 items-center">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname.startsWith(to)
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={onLogout}
                className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
