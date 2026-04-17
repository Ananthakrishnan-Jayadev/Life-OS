import { generateDatesBack } from '../lib/utils';

export const tracks = [
  { id: 'French', name: 'French', icon: '🇫🇷', color: 'amber' },
  { id: 'LeetCode', name: 'LeetCode', icon: '💻', color: 'sage' },
  { id: 'Cloud', name: 'Cloud', icon: '☁️', color: 'slate' },
  { id: 'TechStack', name: 'Tech Stack', icon: '🔧', color: 'cream' },
];

const days = generateDatesBack(30);

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export const studyData = days.map(date => ({
  date,
  tracks: {
    french: {
      completed: Math.random() > 0.25,
      log: { lesson: `Chapter ${Math.floor(Math.random() * 20) + 1}`, vocab: 'bonjour, merci, s\'il vous plaît' },
    },
    leetcode: {
      completed: Math.random() > 0.35,
      log: {
        problem: rand(['Two Sum', 'Valid Parentheses', 'Merge Intervals', 'LRU Cache', 'Binary Search', 'Max Subarray']),
        difficulty: rand(['Easy', 'Medium', 'Hard']),
        solved: Math.random() > 0.2,
        concept: rand(['Arrays', 'Trees', 'DP', 'Graphs', 'Stack', 'Hash Map']),
      },
    },
    cloud: {
      completed: Math.random() > 0.4,
      log: { topic: rand(['S3', 'Lambda', 'EC2', 'IAM', 'VPC', 'RDS', 'CloudFront']), notes: 'Reviewed core concepts and pricing.' },
    },
    techstack: {
      completed: Math.random() > 0.45,
      log: { topic: rand(['React Server Components', 'Zustand', 'Tailwind v4', 'Vite 5', 'tRPC', 'Drizzle ORM']), notes: 'Built a small prototype.' },
    },
  },
}));

export const todayStudy = studyData[studyData.length - 1];
