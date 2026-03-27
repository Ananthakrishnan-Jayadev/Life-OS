import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import ChartWrapper from '../components/charts/ChartWrapper';
import { chartColors, commonAxisProps, commonTooltipStyle } from '../components/charts/chartTheme';
import { habitList, getStreak, getBestStreak } from '../data/habits';
import { generateDatesBack } from '../lib/utils';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import useStore from '../store/useStore';

function AnimatedStreak({ value }) {
  const animated = useAnimatedNumber(value);
  return <span className="font-mono text-2xl font-semibold text-text-primary">{animated}</span>;
}

function CalendarHeatmap({ habitId, completions }) {
  const days = generateDatesBack(90);
  const weeks = [];
  let week = [];
  days.forEach((d, i) => {
    week.push(d);
    if (week.length === 7 || i === days.length - 1) {
      weeks.push([...week]);
      week = [];
    }
  });

  return (
    <div className="flex gap-[3px] overflow-x-auto py-2">
      {weeks.map((w, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {w.map(d => {
            const done = completions.includes(d);
            return (
              <div
                key={d}
                title={`${d}: ${done ? 'Done' : 'Missed'}`}
                className={`w-3 h-3 ${done ? 'bg-accent-sage' : 'bg-bg-input'} hover:ring-1 hover:ring-accent-cream transition-all cursor-default`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function Habits() {
  const { habitCompletions, toggleHabit } = useStore();
  const [trendView, setTrendView] = useState('combined');

  const days7 = generateDatesBack(7);
  const today = new Date().toISOString().split('T')[0];

  // Weekly scorecard
  const weeklyTotal = habitList.reduce((sum, h) => {
    return sum + days7.filter(d => (habitCompletions[h.id] || []).includes(d)).length;
  }, 0);
  const weeklyMax = habitList.length * 7;
  const weeklyPct = Math.round((weeklyTotal / weeklyMax) * 100);

  // Trend data: weekly completion % over past 12 weeks
  const trendData = useMemo(() => {
    const data = [];
    const allDays = generateDatesBack(84); // 12 weeks
    for (let w = 0; w < 12; w++) {
      const weekDays = allDays.slice(w * 7, (w + 1) * 7);
      const weekLabel = `W${w + 1}`;

      if (trendView === 'combined') {
        const completed = habitList.reduce((sum, h) =>
          sum + weekDays.filter(d => (habitCompletions[h.id] || []).includes(d)).length, 0
        );
        data.push({ week: weekLabel, completion: Math.round((completed / (habitList.length * 7)) * 100) });
      } else {
        const point = { week: weekLabel };
        habitList.forEach(h => {
          const completed = weekDays.filter(d => (habitCompletions[h.id] || []).includes(d)).length;
          point[h.id] = Math.round((completed / 7) * 100);
        });
        data.push(point);
      }
    }
    return data;
  }, [habitCompletions, trendView]);

  return (
    <div className="space-y-8 stagger-fade">
      {/* Active Streaks */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {habitList.map(h => {
          const streak = getStreak(h.id);
          const best = getBestStreak(h.id);
          return (
            <Card key={h.id} className="text-center">
              <span className="text-2xl">{h.icon}</span>
              <p className="text-sm text-text-secondary mt-1">{h.name}</p>
              <AnimatedStreak value={streak} />
              <p className="text-[10px] text-text-tertiary">day streak</p>
              <p className="text-[10px] text-text-tertiary mt-1">Best: {best}d</p>
            </Card>
          );
        })}
      </div>

      {/* Calendar Heatmaps */}
      <section>
        <h2 className="font-display text-xl mb-4">90-Day Heatmaps</h2>
        <div className="space-y-4">
          {habitList.map(h => (
            <Card key={h.id}>
              <div className="flex items-center gap-3 mb-2">
                <span>{h.icon}</span>
                <span className="text-sm font-medium text-text-primary">{h.name}</span>
                <Badge color={h.color}>{getStreak(h.id)}d</Badge>
              </div>
              <CalendarHeatmap habitId={h.id} completions={habitCompletions[h.id] || []} />
            </Card>
          ))}
        </div>
      </section>

      {/* Weekly Scorecard */}
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

          {habitList.map(h => {
            const count = days7.filter(d => (habitCompletions[h.id] || []).includes(d)).length;
            return (
              <div key={h.id} className="flex items-center gap-2">
                <div className="w-28 text-sm text-text-secondary truncate">{h.icon} {h.name}</div>
                {days7.map(d => {
                  const done = (habitCompletions[h.id] || []).includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => toggleHabit(h.id, d)}
                      className={`w-10 h-8 flex items-center justify-center border transition-colors ${
                        done ? 'bg-accent-sage/20 border-accent-sage/40' : 'bg-bg-input border-border hover:border-border-hover'
                      }`}
                    >
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

      {/* Trends */}
      <Card header={
        <div className="flex items-center justify-between">
          <span className="font-display text-lg text-text-primary">Trends</span>
          <div className="flex gap-2">
            <button
              onClick={() => setTrendView('combined')}
              className={`text-xs px-2 py-1 ${trendView === 'combined' ? 'bg-bg-tertiary text-accent-cream' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              Combined
            </button>
            <button
              onClick={() => setTrendView('individual')}
              className={`text-xs px-2 py-1 ${trendView === 'individual' ? 'bg-bg-tertiary text-accent-cream' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              Per Habit
            </button>
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
                {habitList.map(h => (
                  <Line
                    key={h.id}
                    type="monotone"
                    dataKey={h.id}
                    name={h.name}
                    stroke={chartColors[h.color] || chartColors.sage}
                    strokeWidth={1.5}
                    dot={false}
                  />
                ))}
              </>
            )}
          </LineChart>
        </ChartWrapper>
      </Card>
    </div>
  );
}
