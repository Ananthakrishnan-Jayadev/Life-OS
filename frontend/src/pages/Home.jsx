import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, BookOpen, DollarSign, Flame, Inbox, Ruler, Briefcase, Check, Square } from 'lucide-react';
import DashboardWidget from '../components/dashboard/DashboardWidget';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import { tracks } from '../data/study';
import { formatCurrency } from '../lib/utils';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import useDashboard from '../hooks/useDashboard';
import useInbox from '../hooks/useInbox';
import { upsertStudyEntry, upsertStudyLog } from '../services/studyService';
import { useAuthStore } from '../store/authStore';

function TrendArrow({ current, previous, suffix = '', invert = false }) {
  if (current == null || previous == null) return null;
  const diff = current - previous;
  const isGood = invert ? diff < 0 : diff > 0;
  return (
    <span className={`text-xs font-mono ${diff === 0 ? 'text-text-tertiary' : isGood ? 'text-accent-sage' : 'text-accent-rose'}`}>
      {diff > 0 ? '▲' : diff < 0 ? '▼' : '—'} {Math.abs(diff).toFixed(1)}{suffix}
    </span>
  );
}

function HabitWeekGrid({ habitId, entries }) {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({ date: key, done: entries.some(e => e.habit_id === habitId && e.date === key && e.completed) });
  }
  return (
    <div className="flex gap-1">
      {days.map(d => <div key={d.date} className={`w-5 h-5 ${d.done ? 'bg-accent-sage' : 'bg-bg-input'}`} />)}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const userId = useAuthStore(s => s.user?.id);
  const { latestWorkout, todayStudy, budgetTotals, habitStreaks, latestMeasurement, jobStats, loading } = useDashboard();
  const { data: inboxItems, create: createInboxItem } = useInbox();
  const [captureText, setCaptureText] = useState('');
  const [toggling, setToggling] = useState(null);

  // Normalize today's study entries to {trackId: {completed}}
  const todayTrackMap = {};
  for (const entry of todayStudy) {
    for (const log of entry.study_logs || []) {
      todayTrackMap[log.track_id] = { completed: log.completed, entryId: entry.id };
    }
  }

  const handleCapture = async () => {
    if (!captureText.trim()) return;
    try { await createInboxItem({ content: captureText.trim(), tag: 'note' }); setCaptureText(''); }
    catch (e) { alert(e.message); }
  };

  const handleStudyToggle = async (trackId) => {
    setToggling(trackId);
    const today = new Date().toISOString().split('T')[0];
    try {
      let entryId = todayStudy[0]?.id;
      if (!entryId) {
        const entry = await upsertStudyEntry({ user_id: userId, date: today });
        entryId = entry.id;
      }
      const current = todayTrackMap[trackId]?.completed || false;
      await upsertStudyLog({ study_entry_id: entryId, track_id: trackId, completed: !current });
    } catch (e) { alert(e.message); }
    finally { setToggling(null); }
  };

  if (loading) return <div className="text-text-tertiary py-12 text-center">Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-fade">
      {/* Today's Workout */}
      <DashboardWidget title="Today's Workout" icon={Dumbbell} linkTo="/workout">
        {latestWorkout ? (
          <>
            <p className="font-display text-xl text-text-primary">{latestWorkout.body_part || 'Workout'}</p>
            <p className="text-sm text-text-secondary mt-1">{(latestWorkout.workout_exercises || []).length} exercises</p>
            <p className="text-xs text-text-tertiary mt-2 font-mono">{latestWorkout.date}</p>
          </>
        ) : (
          <p className="text-sm text-text-tertiary">No workouts logged yet.</p>
        )}
      </DashboardWidget>

      {/* Study Checklist */}
      <DashboardWidget title="Study Checklist" icon={BookOpen} linkTo="/study">
        <div className="space-y-2">
          {tracks.map(track => {
            const done = todayTrackMap[track.id]?.completed || false;
            return (
              <div key={track.id} className="flex items-center gap-2 text-sm">
                <button onClick={e => { e.stopPropagation(); handleStudyToggle(track.id); }} disabled={toggling === track.id} className="shrink-0">
                  {done ? <Check className="w-4 h-4 text-accent-sage" /> : <Square className="w-4 h-4 text-text-tertiary" />}
                </button>
                <span className={done ? 'text-text-secondary line-through' : 'text-text-primary'}>
                  {track.icon} {track.name}
                </span>
              </div>
            );
          })}
        </div>
      </DashboardWidget>

      {/* Budget Snapshot */}
      <DashboardWidget title="Budget Snapshot" icon={DollarSign} linkTo="/budget">
        {budgetTotals ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Income</span>
              <span className="font-mono text-accent-sage">{formatCurrency(budgetTotals.income)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Spent</span>
              <span className="font-mono text-accent-rose">{formatCurrency(budgetTotals.expense)}</span>
            </div>
            <ProgressBar value={budgetTotals.expense} max={budgetTotals.income || 1} color={budgetTotals.income > 0 && budgetTotals.expense / budgetTotals.income > 0.8 ? 'amber' : 'sage'} showLabel />
          </div>
        ) : (
          <p className="text-sm text-text-tertiary">No transactions this month.</p>
        )}
      </DashboardWidget>

      {/* Habit Streaks */}
      <DashboardWidget title="Habit Streaks" icon={Flame} linkTo="/habits" className="md:col-span-2 lg:col-span-2">
        {Object.keys(habitStreaks).length === 0 ? (
          <p className="text-sm text-text-tertiary">No habits tracked yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(habitStreaks).slice(0, 4).map(([habitId, streak]) => (
              <div key={habitId} className="flex items-center justify-between">
                <span className="text-sm text-text-primary font-mono">{habitId}</span>
                <span className="font-mono text-sm text-accent-cream ml-3">{streak}d</span>
              </div>
            ))}
          </div>
        )}
      </DashboardWidget>

      {/* Quick Capture */}
      <DashboardWidget title="Quick Capture" icon={Inbox} linkTo="/inbox">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={captureText}
              onChange={e => setCaptureText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCapture()}
              placeholder="+ New note..."
              className="flex-1 bg-bg-input border border-border rounded-none px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cream"
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="space-y-1.5">
            {inboxItems.filter(i => !i.archived).slice(0, 3).map(item => (
              <div key={item.id} className="text-sm text-text-secondary truncate">— {item.content}</div>
            ))}
          </div>
        </div>
      </DashboardWidget>

      {/* Body Stats */}
      <DashboardWidget title="Body Stats" icon={Ruler} linkTo="/body">
        {latestMeasurement ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Weight</span>
              <span className="font-mono text-text-primary">{latestMeasurement.weight} lbs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">BF%</span>
              <span className="font-mono text-text-primary">{latestMeasurement.bf ?? '—'}%</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-tertiary">No measurements yet.</p>
        )}
      </DashboardWidget>

      {/* Job Applications */}
      <DashboardWidget title="Job Apps" icon={Briefcase} linkTo="/jobs">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Total</span>
            <span className="font-mono text-text-primary">{jobStats.total || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Interviewing</span>
            <span className="font-mono text-accent-cream">{jobStats['Interview'] || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Offers</span>
            <span className="font-mono text-accent-sage">{(jobStats['Offer'] || 0) + (jobStats['Accepted'] || 0)}</span>
          </div>
        </div>
      </DashboardWidget>
    </div>
  );
}
