import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell, BookOpen, DollarSign, Flame, Inbox,
  Ruler, Briefcase, Check, Square,
} from 'lucide-react';
import DashboardWidget from '../components/dashboard/DashboardWidget';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import { todayWorkout, stepsData } from '../data/workouts';
import { todayStudy, tracks } from '../data/study';
import { getMonthlyTotals } from '../data/budget';
import { habitList, habitData, getStreak } from '../data/habits';
import { latestMeasurement, previousMeasurement } from '../data/measurements';
import { jobApplications } from '../data/jobs';
import { inboxItems } from '../data/inbox';
import { formatCurrency } from '../lib/utils';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import useStore from '../store/useStore';

function TrendArrow({ current, previous, suffix = '', invert = false }) {
  const diff = current - previous;
  const isGood = invert ? diff < 0 : diff > 0;
  return (
    <span className={`text-xs font-mono ${diff === 0 ? 'text-text-tertiary' : isGood ? 'text-accent-sage' : 'text-accent-rose'}`}>
      {diff > 0 ? '▲' : diff < 0 ? '▼' : '—'} {Math.abs(diff).toFixed(1)}{suffix}
    </span>
  );
}

function HabitWeekGrid({ habitId }) {
  const completions = habitData[habitId] || [];
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({ date: key, done: completions.includes(key) });
  }
  return (
    <div className="flex gap-1">
      {days.map(d => (
        <div
          key={d.date}
          className={`w-5 h-5 ${d.done ? 'bg-accent-sage' : 'bg-bg-input'}`}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { inboxItems: storeInbox, addInboxItem } = useStore();
  const [captureText, setCaptureText] = useState('');

  const now = new Date();
  const budget = getMonthlyTotals(now.getFullYear(), now.getMonth() + 1);
  const todaySteps = stepsData[stepsData.length - 1]?.steps || 0;

  const activeJobs = jobApplications.filter(j => !['Rejected', 'Ghosted'].includes(j.status));
  const interviewing = jobApplications.filter(j => j.status === 'Interview').length;
  const thisWeek = jobApplications.filter(j => {
    const d = new Date(j.dateApplied);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  const handleCapture = () => {
    if (!captureText.trim()) return;
    addInboxItem(captureText.trim(), 'note');
    setCaptureText('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-fade">
      {/* Today's Workout */}
      <DashboardWidget title="Today's Workout" icon={Dumbbell} linkTo="/workout">
        <p className="font-display text-xl text-text-primary">{todayWorkout.bodyPart} Day</p>
        <p className="text-sm text-text-secondary mt-1">{todayWorkout.exerciseCount} exercises</p>
        <p className="text-xs text-text-tertiary mt-2">
          Last PR: <span className="font-mono text-accent-cream">{todayWorkout.lastPR}</span> {todayWorkout.primaryLift}
        </p>
      </DashboardWidget>

      {/* Study Checklist */}
      <DashboardWidget title="Study Checklist" icon={BookOpen} linkTo="/study">
        <div className="space-y-2">
          {tracks.map(track => {
            const entry = todayStudy?.tracks[track.id];
            const done = entry?.completed;
            return (
              <div key={track.id} className="flex items-center gap-2 text-sm">
                {done ? (
                  <Check className="w-4 h-4 text-accent-sage" />
                ) : (
                  <Square className="w-4 h-4 text-text-tertiary" />
                )}
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
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Income</span>
            <span className="font-mono text-accent-sage">{formatCurrency(budget.income)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Spent</span>
            <span className="font-mono text-accent-rose">{formatCurrency(budget.expenses)}</span>
          </div>
          <ProgressBar
            value={budget.expenses}
            max={budget.income}
            color={budget.expenses / budget.income > 0.8 ? 'amber' : 'sage'}
            showLabel
          />
        </div>
      </DashboardWidget>

      {/* Habit Streaks */}
      <DashboardWidget title="Habit Streaks" icon={Flame} linkTo="/habits" className="md:col-span-2 lg:col-span-2">
        <div className="space-y-3">
          {habitList.slice(0, 4).map(h => (
            <div key={h.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-[100px]">
                <span className="text-sm">{h.icon}</span>
                <span className="text-sm text-text-primary">{h.name}</span>
              </div>
              <HabitWeekGrid habitId={h.id} />
              <span className="font-mono text-sm text-accent-cream ml-3">{getStreak(h.id)}d</span>
            </div>
          ))}
        </div>
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
            {storeInbox.filter(i => !i.archived).slice(0, 3).map(item => (
              <div key={item.id} className="text-sm text-text-secondary truncate">
                — {item.content}
              </div>
            ))}
          </div>
        </div>
      </DashboardWidget>

      {/* Body Stats */}
      <DashboardWidget title="Body Stats" icon={Ruler} linkTo="/body">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Weight</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-text-primary">{latestMeasurement.weight} lbs</span>
              <TrendArrow current={latestMeasurement.weight} previous={previousMeasurement.weight} invert />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">BF%</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-text-primary">{latestMeasurement.bf}%</span>
              <TrendArrow current={latestMeasurement.bf} previous={previousMeasurement.bf} suffix="%" invert />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Steps today</span>
            <span className="font-mono text-text-primary">{todaySteps.toLocaleString()}</span>
          </div>
        </div>
      </DashboardWidget>

      {/* Job Applications */}
      <DashboardWidget title="Job Apps" icon={Briefcase} linkTo="/jobs">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Total</span>
            <span className="font-mono text-text-primary">{jobApplications.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Interviewing</span>
            <span className="font-mono text-accent-cream">{interviewing}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">This week</span>
            <span className="font-mono text-accent-sage">{thisWeek} sent</span>
          </div>
        </div>
      </DashboardWidget>
    </div>
  );
}
