import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Building2, UserSearch, MessageSquareWarning, Smartphone, Network, Layers, FlaskConical, FolderLock, History, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/brands', icon: Building2, label: 'Brand Management' },
  { to: '/radar', icon: UserSearch, label: 'Impersonation Radar' },
  { to: '/scam', icon: MessageSquareWarning, label: 'Scam DNA Analyzer' },
  { to: '/apps', icon: Smartphone, label: 'App Inspector' },
  { to: '/graph', icon: Network, label: 'Threat Graph' },
  { to: '/clusters', icon: Layers, label: 'Campaign Clusters' },
  { to: '/twin', icon: FlaskConical, label: 'Digital Twin' },
  { to: '/vault', icon: FolderLock, label: 'Evidence Vault' },
  { to: '/history', icon: History, label: 'Investigations' },
  { to: '/lab', icon: BarChart3, label: 'Detection Lab' },
  { to: '/copilot', icon: Bot, label: 'AI Copilot' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const loc = useLocation();

  return (
    <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-[#0b1120]/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
        <Shield className="w-8 h-8 text-cyan-400 shrink-0" />
        {!collapsed && <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">TrustShield AI</span>}
      </div>
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5 px-2">
        {nav.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'}`}>
            <n.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{n.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/5 p-3 space-y-2">
        {!collapsed && user && <div className="text-xs text-gray-500 px-2 truncate">{user.email}</div>}
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 w-full transition-all">
          <LogOut className="w-[18px] h-[18px]" />{!collapsed && 'Logout'}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-center w-full py-1.5 text-gray-500 hover:text-gray-300 transition-all">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
