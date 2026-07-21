import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Star, 
  Settings as SettingsIcon,
  Sparkles,
  Zap,
  Infinity
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const DashboardLayout: React.FC = () => {
  const { credits, setUpgradeModalOpen, subscriptionTier } = useAppContext();

  const navItems = [
    { name: 'Home', path: '/', icon: Home, exact: true },
    { name: 'Social Post Generator', path: '/dashboard/social', icon: MessageSquare },
    { name: 'Review Responder', path: '/dashboard/reviews', icon: Star },
    { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-100 bg-slate-950 selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r md:flex md:flex-col border-white/10 bg-slate-900/40 backdrop-blur-xl">
        <div className="flex items-center p-6 gap-3">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">BizSocial AI</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-xl ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/10 font-medium'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mx-4 mb-4 border bg-indigo-500/10 border-indigo-500/20 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-indigo-400">Credits Usage</span>
            <span className="text-xs font-bold flex items-center">
              {subscriptionTier !== 'free' ? <Infinity className="w-4 h-4 text-emerald-400" /> : `${credits} / 5`}
            </span>
          </div>
          {subscriptionTier === 'free' ? (
            <>
              <div className="w-full overflow-hidden rounded-full bg-slate-800 h-1.5">
                <div 
                  className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500" 
                  style={{ width: `${(credits / 5) * 100}%` }}
                />
              </div>
              <button 
                onClick={() => setUpgradeModalOpen(true)}
                className="w-full px-4 py-2 mt-4 text-xs font-bold text-white transition-all rounded-lg bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center"
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </button>
            </>
          ) : (
            <div className="mt-2 text-xs text-emerald-400 font-medium">
              You are on the {subscriptionTier.toUpperCase()} plan.
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative flex flex-col flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_40%)]">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 border-b md:hidden bg-slate-950/20 backdrop-blur-sm border-white/5 z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">BizSocial</span>
          </Link>
          <div className="flex items-center">
            <span className="mr-3 text-sm font-medium text-slate-400 flex items-center">
              {subscriptionTier !== 'free' ? <Infinity className="w-4 h-4 text-emerald-400" /> : `${credits} Credits`}
            </span>
          </div>
        </header>

        {/* Top Header (Desktop) */}
        <header className="z-10 items-center justify-between hidden h-16 px-8 border-b md:flex bg-slate-950/20 backdrop-blur-sm border-white/5">
          <div>
            <h1 className="text-sm font-medium text-slate-400">Workspace: <span className="text-slate-100">My Agency Workspace</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 border rounded-full bg-slate-900 border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                Remaining Credits: {subscriptionTier !== 'free' ? <Infinity className="w-3 h-3 text-emerald-400" /> : `${credits}/5`}
              </span>
            </div>
            <div className="flex items-center justify-center w-8 h-8 text-xs font-bold border rounded-full bg-slate-800 border-white/20">
              JD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-y-auto md:p-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile Nav Drawer (Bottom) */}
        <nav className="flex justify-around p-3 border-t md:hidden bg-slate-950 border-slate-800 pb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `p-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-6 h-6" />
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};
