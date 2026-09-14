import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart2, LogOut, Heart, Key, Building, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(false);
  const userEmail = localStorage.getItem('user_email') || 'guest@ivy.homes';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('api_key');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* Sidebar - Glassmorphism */}
      <div className={`w-full ${isMinimized ? 'md:w-24' : 'md:w-64'} bg-white/70 backdrop-blur-2xl border-r border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col z-20 transition-all duration-300 ease-in-out relative`}>
        <div className={`py-8 ${isMinimized ? 'px-4' : 'px-8'} transition-all duration-300 relative`}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute top-8 right-[-14px] md:flex hidden items-center justify-center w-7 h-7 bg-blue-600 border border-blue-600 shadow-sm rounded-full text-white hover:bg-blue-700 transition-all z-50"
          >
            {isMinimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <div className={`flex items-center gap-3 mb-1 ${isMinimized ? 'justify-center' : 'justify-start'}`}>
            <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="Ivy Homes Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            {!isMinimized && (
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-900 whitespace-nowrap overflow-hidden">
                Ivy Homes
              </h1>
            )}
          </div>
          {!isMinimized && <p className="text-sm font-medium text-slate-500 tracking-wide overflow-hidden whitespace-nowrap">REAL ESTATE</p>}
        </div>

        <nav className={`flex-1 space-y-1.5 mt-2 overflow-y-auto ${isMinimized ? 'px-3' : 'px-4'}`}>
          {[
            { to: '/listings', icon: Home, label: 'Listings' },
            { to: '/saved', icon: Heart, label: 'Saved' },
            { to: '/rentals', icon: Key, label: 'Rentals' },
            { to: '/projects', icon: Building, label: 'Projects' },
            { to: '/analytics', icon: BarChart2, label: 'Analytics' }
          ].map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                title={isMinimized ? item.label : ""}
                className={`relative flex items-center rounded-xl transition-all duration-300 group ${isMinimized ? 'justify-center py-3' : 'px-4 py-3.5'} ${isActive
                    ? 'text-indigo-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-indigo-900 font-medium'
                  }`}
              >
                {/* Active Background Pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-blue-200 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-200/60 rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Hover Background */}
                {!isActive && (
                  <div className="absolute inset-0 bg-white/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                <div className={`relative z-10 flex items-center ${isMinimized ? 'justify-center w-full' : ''}`}>
                  <Icon className={`h-5 w-5 ${isMinimized ? '' : 'mr-3'} transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                  {!isMinimized && <span className="whitespace-nowrap">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/50 bg-white/30 backdrop-blur-sm space-y-2">
          {!isMinimized && (
            <div className="px-4 py-2 mb-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Logged In As</p>
              <p className="text-sm font-bold text-slate-700 truncate">{userEmail}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={isMinimized ? 'Log out' : ''}
            className={`flex items-center ${isMinimized ? 'justify-center w-12 h-12 mx-auto' : 'w-full px-4 py-3'} text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-xl transition-all shadow-sm hover:shadow-md group`}
          >
            <LogOut className={`h-5 w-5 ${isMinimized ? '' : 'mr-3'} text-red-500 transition-colors`} />
            {!isMinimized && <span className="whitespace-nowrap">Log out</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
