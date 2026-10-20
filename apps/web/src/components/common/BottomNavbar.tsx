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
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200 text-neutral-600 shadow-2xl transition-all"
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
                  ? 'text-black font-black scale-105'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  active ? 'bg-yellow-400 text-black shadow-xs' : 'group-hover:bg-neutral-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${active ? 'text-black font-black' : 'text-neutral-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
