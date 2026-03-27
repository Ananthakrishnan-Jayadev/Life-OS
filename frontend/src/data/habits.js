import { generateDatesBack } from '../lib/utils';

export const habitList = [
  { id: 'gym', name: 'Gym', icon: '💪', target: '5x/week', color: 'sage' },
  { id: 'french', name: 'French', icon: '🇫🇷', target: 'Daily', color: 'amber' },
  { id: 'leetcode', name: 'LeetCode', icon: '💻', target: 'Daily', color: 'sage' },
  { id: 'cloud', name: 'Cloud Study', icon: '☁️', target: 'Daily', color: 'slate' },
  { id: 'steps', name: 'Steps >8000', icon: '🚶', target: 'Daily', color: 'cream' },
  { id: 'budget', name: 'Budget Check-in', icon: '💰', target: 'Daily', color: 'amber' },
];

const days90 = generateDatesBack(90);

function genCompletions(probability) {
  return days90.filter(() => Math.random() < probability);
}

// Gym has weekday bias
const gymDays = days90.filter(d => {
  const day = new Date(d).getDay();
  return day >= 1 && day <= 5 ? Math.random() < 0.82 : Math.random() < 0.15;
});

export const habitData = {
  gym: gymDays,
  french: genCompletions(0.72),
  leetcode: genCompletions(0.58),
  cloud: genCompletions(0.52),
  steps: genCompletions(0.65),
  budget: genCompletions(0.48),
};

export function getStreak(habitId) {
  const completions = habitData[habitId] || [];
  let streak = 0;
  const today = new Date();
  for (let i = 0; i <= 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (completions.includes(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export function getBestStreak(habitId) {
  const completions = (habitData[habitId] || []).sort();
  let best = 0, current = 0;
  for (let i = 0; i < days90.length; i++) {
    if (completions.includes(days90[i])) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}
