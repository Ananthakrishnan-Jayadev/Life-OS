import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import PageWrapper from './components/layout/PageWrapper';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import ToastContainer from './components/ui/Toast';

const Login      = lazy(() => import('./pages/Login'));
const Home       = lazy(() => import('./pages/Home'));
const Workout    = lazy(() => import('./pages/Workout'));
const BodyTracker = lazy(() => import('./pages/BodyTracker'));
const StudyChecklist = lazy(() => import('./pages/StudyChecklist'));
const Budget     = lazy(() => import('./pages/Budget'));
const JobTracker = lazy(() => import('./pages/JobTracker'));
const Habits     = lazy(() => import('./pages/Habits'));
const Inbox      = lazy(() => import('./pages/Inbox'));

const pages = [
  { path: '/',        element: <Home /> },
  { path: '/workout', element: <Workout /> },
  { path: '/body',    element: <BodyTracker /> },
  { path: '/study',   element: <StudyChecklist /> },
  { path: '/budget',  element: <Budget /> },
  { path: '/jobs',    element: <JobTracker /> },
  { path: '/habits',  element: <Habits /> },
  { path: '/inbox',   element: <Inbox /> },
];

function PageFallback() {
  return <div className="flex-1 p-6 space-y-4">
    {[1,2,3].map(i => <div key={i} className="h-32 animate-pulse bg-bg-tertiary" />)}
  </div>;
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={
          <Suspense fallback={null}>
            <Login />
          </Suspense>
        } />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <TopBar />
                  <main className="flex-1 overflow-y-auto p-6">
                    <Suspense fallback={<PageFallback />}>
                      <Routes>
                        {pages.map(({ path, element }) => (
                          <Route
                            key={path}
                            path={path}
                            element={<PageWrapper>{element}</PageWrapper>}
                          />
                        ))}
                      </Routes>
                    </Suspense>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
