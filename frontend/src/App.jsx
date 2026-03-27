import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import PageWrapper from './components/layout/PageWrapper';
import Home from './pages/Home';
import Workout from './pages/Workout';
import BodyTracker from './pages/BodyTracker';
import StudyChecklist from './pages/StudyChecklist';
import Budget from './pages/Budget';
import JobTracker from './pages/JobTracker';
import Habits from './pages/Habits';
import Inbox from './pages/Inbox';

const pages = [
  { path: '/', element: <Home />, title: 'Dashboard' },
  { path: '/workout', element: <Workout />, title: 'Workout Tracker' },
  { path: '/body', element: <BodyTracker />, title: 'Body Tracker' },
  { path: '/study', element: <StudyChecklist />, title: 'Study Checklist' },
  { path: '/budget', element: <Budget />, title: 'Budget Tracker' },
  { path: '/jobs', element: <JobTracker />, title: 'Job Applications' },
  { path: '/habits', element: <Habits />, title: 'Habit Streaks' },
  { path: '/inbox', element: <Inbox />, title: 'Quick Capture' },
];

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            {pages.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={<PageWrapper>{element}</PageWrapper>}
              />
            ))}
          </Routes>
        </main>
      </div>
    </div>
  );
}
