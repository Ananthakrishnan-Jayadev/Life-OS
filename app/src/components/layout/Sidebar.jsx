import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Dumbbell, Ruler, BookOpen, DollarSign,
  Briefcase, Flame, Inbox, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/workout', icon: Dumbbell, label: 'Workout' },
  { path: '/body', icon: Ruler, label: 'Body Tracker' },
  { path: '/study', icon: BookOpen, label: 'Study' },
  { path: '/budget', icon: DollarSign, label: 'Budget' },
  { path: '/jobs', icon: Briefcase, label: 'Jobs' },
  { path: '/habits', icon: Flame, label: 'Habits' },
  { path: '/inbox', icon: Inbox, label: 'Inbox' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuthStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          'hidden md:flex flex-col bg-bg-secondary border-r border-border h-full transition-all duration-300',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-border">
          {!collapsed && (
            <h1 className="font-display text-xl text-accent-cream">Life OS</h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-2.5 text-sm font-body transition-all duration-200 relative',
                  isActive
                    ? 'text-accent-cream bg-bg-tertiary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent-cream" />
                  )}
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="border-t border-border px-4 py-3">
            {!collapsed && (
              <p className="text-xs text-text-tertiary truncate mb-2">{user.email}</p>
            )}
            <button
              onClick={signOut}
              className={clsx(
                'flex items-center gap-3 w-full py-2 text-sm text-text-secondary',
                'hover:text-text-primary hover:bg-bg-tertiary transition-colors rounded',
                collapsed ? 'justify-center px-0' : 'px-2'
              )}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-border flex justify-around py-2">
        {navItems.slice(0, 5).map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]',
                isActive ? 'text-accent-cream' : 'text-text-tertiary'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/habits"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]',
              isActive ? 'text-accent-cream' : 'text-text-tertiary'
            )
          }
        >
          <Flame className="w-5 h-5" />
          <span>More</span>
        </NavLink>
      </nav>
    </>
  );
}
