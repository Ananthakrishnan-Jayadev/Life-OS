import { create } from 'zustand';
import { studyData } from '../data/study';
import { inboxItems as defaultInbox } from '../data/inbox';
import { jobApplications as defaultJobs } from '../data/jobs';
import { allTransactions as defaultTransactions } from '../data/budget';
import { habitData as defaultHabitData } from '../data/habits';

const useStore = create((set, get) => ({
  // Study
  studyEntries: studyData,
  toggleStudyTrack: (date, trackId) => set(state => ({
    studyEntries: state.studyEntries.map(entry =>
      entry.date === date
        ? { ...entry, tracks: { ...entry.tracks, [trackId]: { ...entry.tracks[trackId], completed: !entry.tracks[trackId].completed } } }
        : entry
    ),
  })),

  // Inbox
  inboxItems: defaultInbox,
  addInboxItem: (content, tag) => set(state => ({
    inboxItems: [
      { id: Date.now(), content, tag, timestamp: new Date().toISOString(), archived: false },
      ...state.inboxItems,
    ],
  })),
  archiveInboxItem: (id) => set(state => ({
    inboxItems: state.inboxItems.map(item =>
      item.id === id ? { ...item, archived: true } : item
    ),
  })),
  deleteInboxItem: (id) => set(state => ({
    inboxItems: state.inboxItems.filter(item => item.id !== id),
  })),

  // Jobs
  jobs: defaultJobs,
  updateJobStatus: (id, status) => set(state => ({
    jobs: state.jobs.map(job => job.id === id ? { ...job, status } : job),
  })),
  addJob: (job) => set(state => ({
    jobs: [{ ...job, id: Date.now(), dateApplied: new Date().toISOString().split('T')[0] }, ...state.jobs],
  })),

  // Budget
  transactions: defaultTransactions,
  addTransaction: (txn) => set(state => ({
    transactions: [...state.transactions, { ...txn, id: Date.now() }].sort((a, b) => a.date.localeCompare(b.date)),
  })),

  // Habits
  habitCompletions: defaultHabitData,
  toggleHabit: (habitId, date) => set(state => {
    const completions = [...(state.habitCompletions[habitId] || [])];
    const idx = completions.indexOf(date);
    if (idx >= 0) completions.splice(idx, 1);
    else completions.push(date);
    return { habitCompletions: { ...state.habitCompletions, [habitId]: completions } };
  }),
}));

export default useStore;
