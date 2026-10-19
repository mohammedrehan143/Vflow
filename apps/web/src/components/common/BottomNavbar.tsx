import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Car,
  Zap,
  Clock,
  User,
  SlidersHorizontal,
} from 'lucide-react';

export const BottomNavbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
    },
    {
      label: 'Parking',
      path: '/parking',
      icon: Car,
    },
    {
      label: 'Charging',
      path: '/charging',
      icon: Zap,
    },
    {
      label: 'My Car',
      path: user ? '/vehicles' : '/auth',
      icon: SlidersHorizontal,
    },
    {
      label: user ? 'Account' : 'Sign In',
      path: user ? '/profile' : '/auth',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-black/95 backdrop-blur-lg border-t border-neutral-800 text-white shadow-2xl transition-all"
    >
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${
                active
                  ? 'text-yellow-400 font-bold scale-105'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  active ? 'bg-yellow-400/15 text-yellow-400' : 'group-hover:bg-neutral-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${active ? 'text-yellow-400 font-extrabold' : 'text-neutral-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
