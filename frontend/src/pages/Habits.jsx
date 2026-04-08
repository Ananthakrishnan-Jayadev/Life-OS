import { useMemo, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton';
import ChartWrapper from '../components/charts/ChartWrapper';
import { chartColors, commonAxisProps, commonTooltipStyle } from '../components/charts/chartTheme';
import { generateDatesBack } from '../lib/utils';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { toast } from '../store/toastStore';
import useHabits from '../hooks/useHabits';

function AnimatedStreak({ value }) {
  const animated = useAnimatedNumber(value);
  return <span className="font-mono text-2xl font-semibold text-text-primary">{animated}</span>;
}

function CalendarHeatmap({ habitId, completionDates }) {
  const days = generateDatesBack(90);
  const weeks = [];
  let week = [];
  days.forEach((d, i) => {
    week.push(d);
    if (week.length === 7 || i === days.length - 1) { weeks.push([...week]); week = []; }
  });
  return (
    <div className="flex gap-[3px] overflow-x-auto py-2">
      {weeks.map((w, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {w.map(d => {
            const done = completionDates.includes(d);
            return <div key={d} title={`${d}: ${done ? 'Done' : 'Missed'}`} className={`w-3 h-3 ${done ? 'bg-accent-sage' : 'bg-bg-input'} hover:ring-1 hover:ring-accent-cream transition-all cursor-default`} />;
          })}
        </div>
      ))}
    </div>
  );
}

export default function Habits() {
  const { habits, entries, setEntries, streaks, setStreaks, loading, error, create, toggle } = useHabits(90);
  const [trendView, setTrendView] = useState('combined');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', icon: '', target: 'Daily', color: 'sage' });
  const [saving, setSaving] = useState(false);

  const days7 = generateDatesBack(7);

  const completionsByHabit = useMemo(() => {
    const map = {};
    for (const e of entries) {
      if (!e.completed) continue;
      if (!map[e.habit_id]) map[e.habit_id] = [];
      map[e.habit_id].push(e.date);
    }
    return map;
  }, [entries]);

  const weeklyTotal = habits.reduce((sum, h) => sum + days7.filter(d => (completionsByHabit[h.id] || []).includes(d)).length, 0);
  const weeklyMax = habits.length * 7;
  const weeklyPct = weeklyMax > 0 ? Math.round((weeklyTotal / weeklyMax) * 100) : 0;

  const trendData = useMemo(() => {
    const allDays = generateDatesBack(84);
    return Array.from({ length: 12 }, (_, w) => {
      const weekDays = allDays.slice(w * 7, (w + 1) * 7);
      const point = { week: `W${w + 1}` };
      if (trendView === 'combined') {
        const completed = habits.reduce((sum, h) => sum + weekDays.filter(d => (completionsByHabit[h.id] || []).includes(d)).length, 0);
        point.completion = habits.length > 0 ? Math.round((completed / (habits.length * 7)) * 100) : 0;
      } else {
        habits.forEach(h => {
          const completed = weekDays.filter(d => (completionsByHabit[h.id] || []).includes(d)).length;
          point[h.id] = Math.round((completed / 7) * 100);
        });
      }
      return point;
    });
  }, [completionsByHabit, habits, trendView]);

  // Optimistic toggle
  const handleToggle = async (habitId, date) => {
    const prevEntries = entries;
    const prevStreaks = streaks;
    const isDone = (completionsByHabit[habitId] || []).includes(date);
    const newCompleted = !isDone;

    // Optimistic update
    setEntries(prev => {
      const existing = prev.find(e => e.habit_id === habitId && e.date === date);
      if (existing) return prev.map(e => e.habit_id === habitId && e.date === date ? { ...e, completed: newCompleted } : e);
      return [...prev, { habit_id: habitId, date, completed: newCompleted, id: `opt-${Date.now()}` }];
    });

    try {
      await toggle(habitId, date, newCompleted);
      toast.success(newCompleted ? 'Habit logged!' : 'Habit unmarked');
    } catch (e) {
      setEntries(prevEntries);
      setStreaks(prevStreaks);
      toast.error('Failed to update habit');
    }
  };

  const handleAddHabit = async () => {
    if (!newHabit.name) return;
    setSaving(true);
    try {
      await create(newHabit);
      setNewHabit({ name: '', icon: '', target: 'Daily', color: 'sage' });
      setShowAddModal(false);
      toast.success('Habit added!');
    } catch (e) {
      toast.error('Failed to add habit');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
      </div>
      <SkeletonChart height={300} />
    </div>
  );

  if (error) return <div className="text-accent-rose py-12 text-center">{error}</div>;

  if (habits.length === 0) return (
    <div className="space-y-8 stagger-fade">
      <EmptyState
        icon={Check}
        message="No habits yet — start building your daily routines."
        action="Add First Habit"
        onAction={() => setShowAddModal(true)}
      />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Habit">
        <div className="space-y-4">
          <Input label="Name" value={newHabit.name} onChange={e => setNewHabit({ ...newHabit, name: e.target.value })} placeholder="e.g. Morning Run" />
          <Input label="Icon (emoji)" value={newHabit.icon} onChange={e => setNewHabit({ ...newHabit, icon: e.target.value })} placeholder="🏃" />
          <Input label="Target" value={newHabit.target} onChange={e => setNewHabit({ ...newHabit, target: e.target.value })} placeholder="Daily" />
          <Button onClick={handleAddHabit} disabled={saving}>{saving ? 'Adding...' : 'Add Habit'}</Button>
        </div>
      </Modal>
    </div>
  );

  return (
    <div className="space-y-8 stagger-fade">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4" /> Add Habit</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {habits.map(h => (
          <Card key={h.id} className="text-center">
            <span className="text-2xl">{h.icon}</span>
            <p className="text-sm text-text-secondary mt-1">{h.name}</p>
            <AnimatedStreak value={streaks[h.id] || 0} />
            <p className="text-[10px] text-text-tertiary">day streak</p>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="font-display text-xl mb-4">90-Day Heatmaps</h2>
        <div className="space-y-4">
          {habits.map(h => (
            <Card key={h.id}>
              <div className="flex items-center gap-3 mb-2">
                <span>{h.icon}</span>
                <span className="text-sm font-medium text-text-primary">{h.name}</span>
                <Badge color={h.color || 'sage'}>{streaks[h.id] || 0}d</Badge>
              </div>
              <CalendarHeatmap habitId={h.id} completionDates={completionsByHabit[h.id] || []} />
            </Card>
          ))}
        </div>
      </section>

      <Card header="Weekly Scorecard">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-28" />
            {days7.map(d => (
              <div key={d} className="w-10 text-center text-[10px] text-text-tertiary font-mono">
                {new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            ))}
            <div className="w-16 text-right text-xs text-text-tertiary">Score</div>
          </div>
          {habits.map(h => {
            const count = days7.filter(d => (completionsByHabit[h.id] || []).includes(d)).length;
            return (
              <div key={h.id} className="flex items-center gap-2">
                <div className="w-28 text-sm text-text-secondary truncate">{h.icon} {h.name}</div>
                {days7.map(d => {
                  const done = (completionsByHabit[h.id] || []).includes(d);
                  return (
                    <button key={d} onClick={() => handleToggle(h.id, d)}
                      className={`w-10 h-8 flex items-center justify-center border transition-colors ${done ? 'bg-accent-sage/20 border-accent-sage/40' : 'bg-bg-input border-border hover:border-border-hover'}`}>
                      {done && <Check className="w-3.5 h-3.5 text-accent-sage" />}
                    </button>
                  );
                })}
                <div className="w-16 text-right text-sm font-mono text-text-secondary">{count}/7</div>
              </div>
            );
          })}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-sm text-text-secondary">This week</span>
            <span className="font-mono text-accent-cream">{weeklyPct}%</span>
          </div>
          <ProgressBar value={weeklyTotal} max={weeklyMax} color="cream" />
        </div>
      </Card>

      <Card header={
        <div className="flex items-center justify-between">
          <span className="font-display text-lg text-text-primary">Trends</span>
          <div className="flex gap-2">
            <button onClick={() => setTrendView('combined')} className={`text-xs px-2 py-1 ${trendView === 'combined' ? 'bg-bg-tertiary text-accent-cream' : 'text-text-tertiary hover:text-text-primary'}`}>Combined</button>
            <button onClick={() => setTrendView('individual')} className={`text-xs px-2 py-1 ${trendView === 'individual' ? 'bg-bg-tertiary text-accent-cream' : 'text-text-tertiary hover:text-text-primary'}`}>Per Habit</button>
          </div>
        </div>
      }>
        <ChartWrapper height={300}>
          <LineChart data={trendData}>
            <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
            <XAxis dataKey="week" {...commonAxisProps} />
            <YAxis {...commonAxisProps} domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip {...commonTooltipStyle} formatter={v => `${v}%`} />
            {trendView === 'combined' ? (
              <Line type="monotone" dataKey="completion" name="Completion %" stroke={chartColors.cream} strokeWidth={2} dot={{ fill: chartColors.cream, r: 3 }} />
            ) : (
              <>
                <Legend wrapperStyle={{ color: chartColors.text, fontFamily: 'DM Sans', fontSize: 11 }} />
                {habits.map(h => (
                  <Line key={h.id} type="monotone" dataKey={h.id} name={h.name} stroke={chartColors[h.color] || chartColors.sage} strokeWidth={1.5} dot={false} />
                ))}
              </>
            )}
          </LineChart>
        </ChartWrapper>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Habit">
        <div className="space-y-4">
          <Input label="Name" value={newHabit.name} onChange={e => setNewHabit({ ...newHabit, name: e.target.value })} placeholder="e.g. Morning Run" />
          <Input label="Icon (emoji)" value={newHabit.icon} onChange={e => setNewHabit({ ...newHabit, icon: e.target.value })} placeholder="🏃" />
          <Input label="Target" value={newHabit.target} onChange={e => setNewHabit({ ...newHabit, target: e.target.value })} placeholder="Daily" />
          <Button onClick={handleAddHabit} disabled={saving}>{saving ? 'Adding...' : 'Add Habit'}</Button>
        </div>
      </Modal>
    </div>
  );
}
