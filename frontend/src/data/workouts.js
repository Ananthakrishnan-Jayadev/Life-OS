import { generateDatesBack } from '../lib/utils';

const days = generateDatesBack(30);

function makeWorkout(date, bodyPart, exercises) {
  return {
    id: date + bodyPart,
    date,
    bodyPart,
    exercises: exercises.map(e => ({
      name: e.name,
      sets: e.sets.map((s, i) => ({ set: i + 1, reps: s.reps, weight: s.weight })),
    })),
    totalVolume: exercises.reduce((sum, e) =>
      sum + e.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0
    ),
    steps: 5000 + Math.floor(Math.random() * 6000),
  };
}

export const workoutHistory = [
  makeWorkout(days[1], 'Chest', [
    { name: 'Bench Press', sets: [{ reps: 8, weight: 205 }, { reps: 6, weight: 215 }, { reps: 5, weight: 225 }] },
    { name: 'Incline Dumbbell Press', sets: [{ reps: 10, weight: 70 }, { reps: 8, weight: 75 }, { reps: 8, weight: 80 }] },
    { name: 'Cable Fly', sets: [{ reps: 12, weight: 35 }, { reps: 12, weight: 35 }, { reps: 10, weight: 40 }] },
    { name: 'Chest Dip', sets: [{ reps: 12, weight: 0 }, { reps: 10, weight: 0 }] },
  ]),
  makeWorkout(days[2], 'Back', [
    { name: 'Deadlift', sets: [{ reps: 5, weight: 315 }, { reps: 5, weight: 335 }, { reps: 3, weight: 365 }] },
    { name: 'Barbell Row', sets: [{ reps: 8, weight: 165 }, { reps: 8, weight: 175 }, { reps: 6, weight: 185 }] },
    { name: 'Lat Pulldown', sets: [{ reps: 10, weight: 140 }, { reps: 10, weight: 150 }, { reps: 8, weight: 160 }] },
    { name: 'Pull Up', sets: [{ reps: 8, weight: 0 }, { reps: 7, weight: 0 }, { reps: 6, weight: 0 }] },
  ]),
  makeWorkout(days[4], 'Legs', [
    { name: 'Squat', sets: [{ reps: 8, weight: 225 }, { reps: 6, weight: 255 }, { reps: 5, weight: 275 }] },
    { name: 'Romanian Deadlift', sets: [{ reps: 8, weight: 185 }, { reps: 8, weight: 205 }, { reps: 6, weight: 225 }] },
    { name: 'Leg Press', sets: [{ reps: 10, weight: 400 }, { reps: 10, weight: 430 }, { reps: 8, weight: 450 }] },
    { name: 'Leg Curl', sets: [{ reps: 12, weight: 100 }, { reps: 10, weight: 110 }, { reps: 10, weight: 120 }] },
  ]),
  makeWorkout(days[5], 'Shoulders', [
    { name: 'OHP', sets: [{ reps: 8, weight: 115 }, { reps: 6, weight: 125 }, { reps: 5, weight: 135 }] },
    { name: 'Lateral Raise', sets: [{ reps: 12, weight: 20 }, { reps: 12, weight: 22 }, { reps: 10, weight: 25 }] },
    { name: 'Face Pull', sets: [{ reps: 15, weight: 40 }, { reps: 12, weight: 45 }, { reps: 12, weight: 50 }] },
    { name: 'Rear Delt Fly', sets: [{ reps: 12, weight: 15 }, { reps: 12, weight: 18 }, { reps: 10, weight: 20 }] },
  ]),
  makeWorkout(days[6], 'Arms', [
    { name: 'Barbell Curl', sets: [{ reps: 10, weight: 75 }, { reps: 8, weight: 85 }, { reps: 6, weight: 95 }] },
    { name: 'Skull Crusher', sets: [{ reps: 10, weight: 55 }, { reps: 8, weight: 65 }, { reps: 8, weight: 75 }] },
    { name: 'Hammer Curl', sets: [{ reps: 10, weight: 35 }, { reps: 10, weight: 37 }, { reps: 8, weight: 40 }] },
    { name: 'Tricep Pushdown', sets: [{ reps: 12, weight: 50 }, { reps: 10, weight: 55 }, { reps: 10, weight: 60 }] },
  ]),
  makeWorkout(days[8], 'Chest', [
    { name: 'Bench Press', sets: [{ reps: 8, weight: 210 }, { reps: 6, weight: 220 }, { reps: 4, weight: 225 }] },
    { name: 'Incline Dumbbell Press', sets: [{ reps: 10, weight: 72 }, { reps: 8, weight: 77 }, { reps: 7, weight: 80 }] },
    { name: 'Cable Fly', sets: [{ reps: 12, weight: 37 }, { reps: 12, weight: 37 }, { reps: 10, weight: 40 }] },
  ]),
  makeWorkout(days[9], 'Back', [
    { name: 'Deadlift', sets: [{ reps: 5, weight: 325 }, { reps: 5, weight: 345 }, { reps: 3, weight: 365 }] },
    { name: 'Barbell Row', sets: [{ reps: 8, weight: 170 }, { reps: 8, weight: 180 }, { reps: 6, weight: 185 }] },
    { name: 'Lat Pulldown', sets: [{ reps: 10, weight: 145 }, { reps: 10, weight: 155 }, { reps: 8, weight: 160 }] },
  ]),
  makeWorkout(days[11], 'Legs', [
    { name: 'Squat', sets: [{ reps: 8, weight: 235 }, { reps: 6, weight: 255 }, { reps: 5, weight: 275 }] },
    { name: 'Romanian Deadlift', sets: [{ reps: 8, weight: 195 }, { reps: 8, weight: 215 }, { reps: 6, weight: 225 }] },
    { name: 'Leg Press', sets: [{ reps: 10, weight: 410 }, { reps: 10, weight: 440 }, { reps: 8, weight: 450 }] },
  ]),
  makeWorkout(days[15], 'Chest', [
    { name: 'Bench Press', sets: [{ reps: 8, weight: 215 }, { reps: 6, weight: 220 }, { reps: 5, weight: 225 }] },
    { name: 'Incline Dumbbell Press', sets: [{ reps: 10, weight: 75 }, { reps: 8, weight: 80 }, { reps: 7, weight: 80 }] },
    { name: 'Cable Fly', sets: [{ reps: 12, weight: 38 }, { reps: 10, weight: 40 }, { reps: 10, weight: 40 }] },
  ]),
  makeWorkout(days[16], 'Back', [
    { name: 'Deadlift', sets: [{ reps: 5, weight: 335 }, { reps: 3, weight: 355 }, { reps: 2, weight: 365 }] },
    { name: 'Barbell Row', sets: [{ reps: 8, weight: 175 }, { reps: 6, weight: 185 }, { reps: 6, weight: 185 }] },
  ]),
  makeWorkout(days[22], 'Chest', [
    { name: 'Bench Press', sets: [{ reps: 8, weight: 210 }, { reps: 6, weight: 220 }, { reps: 5, weight: 225 }] },
    { name: 'Incline Dumbbell Press', sets: [{ reps: 10, weight: 75 }, { reps: 8, weight: 80 }] },
  ]),
  makeWorkout(days[25], 'Legs', [
    { name: 'Squat', sets: [{ reps: 8, weight: 245 }, { reps: 6, weight: 265 }, { reps: 4, weight: 275 }] },
    { name: 'Romanian Deadlift', sets: [{ reps: 8, weight: 205 }, { reps: 8, weight: 220 }] },
  ]),
];

export const stepsData = generateDatesBack(30).map(date => ({
  date,
  steps: 4000 + Math.floor(Math.random() * 7000),
}));

export const todayWorkout = {
  bodyPart: 'Chest',
  exerciseCount: 4,
  primaryLift: 'Bench Press',
  lastPR: '225 lbs',
};
