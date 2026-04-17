import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check, Square, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import ChartWrapper from '../components/charts/ChartWrapper';
import { chartColors, commonAxisProps, commonTooltipStyle } from '../components/charts/chartTheme';
import { tracks } from '../data/study';
import { formatShortDate } from '../lib/utils';
import { toast } from '../store/toastStore';
import useStudy from '../hooks/useStudy';
import { useAuthStore } from '../store/authStore';

export default function StudyChecklist() {
  const userId = useAuthStore(s => s.user?.id);
  const { data: studyEntries, setData, streaks, loading, upsertEntry, refetch } = useStudy();
  const [dateOffset, setDateOffset] = useState(0);
  const [expandedTrack, setExpandedTrack] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [toggling, setToggling] = useState(null);

  const today = new Date();
  const currentDate = new Date(today);
  currentDate.setDate(currentDate.getDate() - dateOffset);
  const dateKey = currentDate.toISOString().split('T')[0];

  // Build {date: {tracks: {trackId: {completed, id}}}} from flat rows
  const entryMap = {};
  for (const entry of studyEntries) {
    if (!entryMap[entry.date]) entryMap[entry.date] = { tracks: {} };
    entryMap[entry.date].tracks[entry.track] = { completed: entry.completed, id: entry.id };
  }

  const dayEntry = entryMap[dateKey];

  const weekDates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - i);
    weekDates.push(d.toISOString().split('T')[0]);
  }

  const totalCompleted = weekDates.reduce((sum, d) => sum + tracks.filter(t => entryMap[d]?.tracks[t.id]?.completed).length, 0);
  const totalPossible = weekDates.length * tracks.length;
  const barData = tracks.map(t => ({ name: t.name, completed: weekDates.filter(d => entryMap[d]?.tracks[t.id]?.completed).length }));

  // Optimistic toggle
  const handleToggle = async (trackId) => {
    if (toggling === trackId) return;
    setToggling(trackId);

    const currentlyDone = dayEntry?.tracks[trackId]?.completed || false;
    const newDone = !currentlyDone;

    // Optimistic: update local data
    const prevData = studyEntries;
    setData(prev => {
      const existing = prev.find(e => e.date === dateKey);
      if (existing) {
        return prev.map(e => {
          if (e.date !== dateKey) return e;
          const logs = e.study_logs || [];
          const existingLog = logs.find(l => l.track_id === trackId);
          const newLogs = existingLog
            ? logs.map(l => l.track_id === trackId ? { ...l, completed: newDone } : l)
            : [...logs, { track_id: trackId, completed: newDone, id: `opt-${Date.now()}` }];
          return { ...e, study_logs: newLogs };
        });
      }
      return [...prev, { date: dateKey, id: null, study_logs: [{ track_id: trackId, completed: newDone, id: `opt-${Date.now()}` }] }];
    });

    try {
      await upsertEntry({ date: dateKey, track: trackId, completed: newDone });
      await refetch();
      toast.success(newDone ? 'Track completed!' : 'Track unchecked');
    } catch (e) {
      setData(prevData);
      toast.error('Failed to update — please try again');
    } finally {
      setToggling(null);
    }
  };

  if (loading) return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 stagger-fade">
      <div className="flex items-center gap-4">
        <button onClick={() => setDateOffset(dateOffset + 1)} className="text-text-tertiary hover:text-text-primary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-display text-xl">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </h2>
        <button onClick={() => setDateOffset(Math.max(0, dateOffset - 1))} className="text-text-tertiary hover:text-text-primary disabled:opacity-30" disabled={dateOffset === 0}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map(track => {
          const entry = dayEntry?.tracks[track.id];
          const done = entry?.completed || false;
          const isExpanded = expandedTrack === track.id;
          const streak = streaks[track.id] || 0;
          return (
            <Card key={track.id} className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggle(track.id)} className="transition-colors" disabled={toggling === track.id}>
                    {done ? <Check className="w-5 h-5 text-accent-sage" /> : <Square className="w-5 h-5 text-text-tertiary hover:text-text-primary" />}
                  </button>
                  <span className="text-lg">{track.icon}</span>
                  <span className={`font-body font-medium ${done ? 'text-text-secondary line-through' : 'text-text-primary'}`}>{track.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={track.color}>{streak}d streak</Badge>
                  <button onClick={() => setExpandedTrack(isExpanded ? null : track.id)} className="text-text-tertiary hover:text-text-primary">
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              {isExpanded && entry?.log && (
                <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                  {Object.entries(entry.log).map(([key, val]) => (
                    <div key={key} className="flex gap-2">
                      <span className="text-text-tertiary capitalize min-w-[80px]">{key}:</span>
                      <span className="text-text-secondary">{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card header="Weekly Scorecard">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-24" />
              {weekDates.map(d => (
                <div key={d} className="w-8 text-center text-[10px] text-text-tertiary font-mono">
                  {new Date(d).toLocaleDateString('en-US', { weekday: 'narrow' })}
                </div>
              ))}
              <div className="w-12 text-right text-xs text-text-tertiary">Total</div>
            </div>
            {tracks.map(track => {
              const weekCount = weekDates.filter(d => entryMap[d]?.tracks[track.id]?.completed).length;
              return (
                <div key={track.id} className="flex items-center gap-2">
                  <div className="w-24 text-sm text-text-secondary truncate">{track.icon} {track.name}</div>
                  {weekDates.map(d => {
                    const done = entryMap[d]?.tracks[track.id]?.completed;
                    return (
                      <div key={d} className={`w-8 h-8 flex items-center justify-center ${done ? 'bg-accent-sage/20' : 'bg-bg-input'}`}>
                        {done ? <Check className="w-3 h-3 text-accent-sage" /> : null}
                      </div>
                    );
                  })}
                  <div className="w-12 text-right text-sm font-mono text-text-secondary">{weekCount}/7</div>
                </div>
              );
            })}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">This week</span>
                <span className="font-mono text-sm text-accent-cream">{totalCompleted}/{totalPossible} ({totalPossible > 0 ? Math.round(totalCompleted / totalPossible * 100) : 0}%)</span>
              </div>
              <ProgressBar value={totalCompleted} max={totalPossible} color="cream" />
            </div>
          </div>
        </Card>

        <Card header="Completion by Track">
          <ChartWrapper height={250}>
            <BarChart data={barData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis dataKey="name" {...commonAxisProps} />
              <YAxis {...commonAxisProps} domain={[0, 7]} />
              <Tooltip {...commonTooltipStyle} />
              <Bar dataKey="completed" fill={chartColors.sage} />
            </BarChart>
          </ChartWrapper>
        </Card>
      </div>

      <section>
        <h2 className="font-display text-xl mb-4">History</h2>
        <Card>
          {studyEntries.length === 0 ? (
            <EmptyState icon={BookOpen} message="No study entries yet — start checking off tracks above." />
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {[...new Set(studyEntries.map(e => e.date))].slice(0, 20).map(date => {
                const completedTracks = tracks.filter(t => entryMap[date]?.tracks[t.id]?.completed);
                const isExpanded = expandedHistory === date;
                return (
                  <div key={date} className="border-b border-border pb-2">
                    <button onClick={() => setExpandedHistory(isExpanded ? null : date)} className="w-full flex items-center justify-between py-2 hover:bg-bg-tertiary px-2 transition-colors">
                      <span className="font-mono text-sm text-text-secondary">{formatShortDate(date)}</span>
                      <div className="flex gap-1">
                        {tracks.map(t => (
                          <div key={t.id} className={`w-3 h-3 ${entryMap[date]?.tracks[t.id]?.completed ? 'bg-accent-sage' : 'bg-bg-input'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-text-tertiary">{completedTracks.length}/{tracks.length}</span>
                    </button>
                    {isExpanded && (
                      <div className="px-2 py-2 bg-bg-tertiary space-y-2 text-sm">
                        {tracks.map(t => (
                          <div key={t.id}>
                            <span className={entryMap[date]?.tracks[t.id]?.completed ? 'text-accent-sage' : 'text-text-tertiary'}>
                              {t.icon} {t.name}: {entryMap[date]?.tracks[t.id]?.completed ? '✓' : '✗'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
