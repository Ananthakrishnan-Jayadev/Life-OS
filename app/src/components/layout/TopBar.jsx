import { useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../ui/Button';

const titles = {
  '/': 'Dashboard',
  '/workout': 'Workout Tracker',
  '/body': 'Body Tracker',
  '/study': 'Study Checklist',
  '/budget': 'Budget Tracker',
  '/jobs': 'Job Applications',
  '/habits': 'Habit Streaks',
  '/inbox': 'Quick Capture',
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-primary">
      <div>
        {isHome ? (
          <>
            <h1 className="font-display text-2xl text-text-primary">
              {getGreeting()}.
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">{formatDate()}</p>
          </>
        ) : (
          <h1 className="font-display text-2xl text-text-primary">
            {titles[location.pathname] || 'Page'}
          </h1>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/inbox')}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Capture</span>
      </Button>
    </header>
  );
}
