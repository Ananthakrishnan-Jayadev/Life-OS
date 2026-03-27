import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import ChartWrapper from '../components/charts/ChartWrapper';
import { chartColors, commonAxisProps, commonTooltipStyle } from '../components/charts/chartTheme';
import { exercises, bodyParts, equipment } from '../data/exercises';
import { workoutHistory, stepsData } from '../data/workouts';
import { formatShortDate } from '../lib/utils';

export default function Workout() {
  const [bpFilter, setBpFilter] = useState('');
  const [eqFilter, setEqFilter] = useState('');
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState('Bench Press');
  const [historyBpFilter, setHistoryBpFilter] = useState('');

  // Log workout state
  const [logBodyPart, setLogBodyPart] = useState('');
  const [logExercises, setLogExercises] = useState([]);
  const [logAddExercise, setLogAddExercise] = useState('');

  const filteredExercises = exercises.filter(e =>
    (!bpFilter || e.bodyPart === bpFilter) && (!eqFilter || e.equipment === eqFilter)
  );

  const filteredHistory = workoutHistory.filter(w =>
    !historyBpFilter || w.bodyPart === historyBpFilter
  );

  // Progression data for selected exercise
  const progressionData = workoutHistory
    .filter(w => w.exercises.some(e => e.name === selectedExercise))
    .map(w => {
      const ex = w.exercises.find(e => e.name === selectedExercise);
      const topSet = ex?.sets.reduce((max, s) => s.weight > max ? s.weight : max, 0) || 0;
      return { date: formatShortDate(w.date), weight: topSet };
    });

  const addExerciseToLog = () => {
    if (!logAddExercise) return;
    setLogExercises([...logExercises, {
      name: logAddExercise,
      sets: [{ reps: '', weight: '' }],
    }]);
    setLogAddExercise('');
  };

  const addSetToExercise = (idx) => {
    const updated = [...logExercises];
    updated[idx].sets.push({ reps: '', weight: '' });
    setLogExercises(updated);
  };

  const updateSet = (exIdx, setIdx, field, value) => {
    const updated = [...logExercises];
    updated[exIdx].sets[setIdx][field] = value;
    setLogExercises(updated);
  };

  const removeExercise = (idx) => {
    setLogExercises(logExercises.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-8 stagger-fade">
      {/* Exercise Database */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-xl">Exercise Database</h2>
          <div className="flex gap-2 flex-wrap">
            <Select
              options={bodyParts.map(b => ({ value: b, label: b }))}
              value={bpFilter}
              onChange={e => setBpFilter(e.target.value)}
              placeholder="All Body Parts"
            />
            <Select
              options={equipment.map(e => ({ value: e, label: e }))}
              value={eqFilter}
              onChange={e => setEqFilter(e.target.value)}
              placeholder="All Equipment"
            />
            <Button size="sm" onClick={() => setShowAddExercise(true)}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
        </div>

        <Card>
          <Table>
            <Thead>
              <Th>Exercise</Th>
              <Th>Body Part</Th>
              <Th>Equipment</Th>
              <Th>Personal Best</Th>
            </Thead>
            <Tbody>
              {filteredExercises.map(ex => (
                <Tr key={ex.id}>
                  <Td className="font-medium">{ex.name}</Td>
                  <Td><Badge color="slate">{ex.bodyPart}</Badge></Td>
                  <Td className="text-text-secondary">{ex.equipment}</Td>
                  <Td className="font-mono">{ex.pb ? `${ex.pb} lbs` : '—'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      </section>

      {/* Log Workout */}
      <section>
        <h2 className="font-display text-xl mb-4">Log Workout</h2>
        <Card>
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Input label="Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              <Select
                label="Body Part"
                options={bodyParts.map(b => ({ value: b, label: b }))}
                value={logBodyPart}
                onChange={e => setLogBodyPart(e.target.value)}
                placeholder="Select..."
              />
            </div>

            {logExercises.map((ex, exIdx) => (
              <div key={exIdx} className="border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-text-primary">{ex.name}</h4>
                  <button onClick={() => removeExercise(exIdx)} className="text-text-tertiary hover:text-accent-rose">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-3">
                    <span className="text-xs text-text-tertiary font-mono w-6">#{setIdx + 1}</span>
                    <Input
                      placeholder="Reps"
                      type="number"
                      value={set.reps}
                      onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                      className="w-20"
                    />
                    <span className="text-text-tertiary">×</span>
                    <Input
                      placeholder="Weight"
                      type="number"
                      value={set.weight}
                      onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                      className="w-24"
                    />
                    <span className="text-xs text-text-tertiary">lbs</span>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addSetToExercise(exIdx)}>
                  + Add Set
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Select
                options={exercises
                  .filter(e => !logBodyPart || e.bodyPart === logBodyPart)
                  .map(e => ({ value: e.name, label: e.name }))}
                value={logAddExercise}
                onChange={e => setLogAddExercise(e.target.value)}
                placeholder="Add exercise..."
              />
              <Button size="sm" onClick={addExerciseToLog}><Plus className="w-4 h-4" /></Button>
            </div>

            <Input label="Steps" type="number" placeholder="Today's steps" className="w-40" />
            <Button>Save Workout</Button>
          </div>
        </Card>
      </section>

      {/* History */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">History</h2>
          <Select
            options={bodyParts.map(b => ({ value: b, label: b }))}
            value={historyBpFilter}
            onChange={e => setHistoryBpFilter(e.target.value)}
            placeholder="All Body Parts"
          />
        </div>
        <Card>
          <Table>
            <Thead>
              <Th>Date</Th>
              <Th>Body Part</Th>
              <Th>Exercises</Th>
              <Th>Volume</Th>
              <Th>Steps</Th>
              <Th></Th>
            </Thead>
            <Tbody>
              {filteredHistory.map(w => (
                <>
                  <Tr key={w.id} onClick={() => setExpandedWorkout(expandedWorkout === w.id ? null : w.id)}>
                    <Td className="font-mono text-sm">{formatShortDate(w.date)}</Td>
                    <Td><Badge color="slate">{w.bodyPart}</Badge></Td>
                    <Td className="text-text-secondary">{w.exercises.map(e => e.name).join(', ')}</Td>
                    <Td className="font-mono">{w.totalVolume.toLocaleString()} lbs</Td>
                    <Td className="font-mono">{w.steps.toLocaleString()}</Td>
                    <Td>
                      {expandedWorkout === w.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Td>
                  </Tr>
                  {expandedWorkout === w.id && (
                    <tr key={w.id + '-detail'}>
                      <td colSpan={6} className="px-4 py-3 bg-bg-tertiary">
                        {w.exercises.map((ex, i) => (
                          <div key={i} className="mb-3">
                            <p className="text-sm font-medium text-accent-cream mb-1">{ex.name}</p>
                            <div className="flex flex-wrap gap-2">
                              {ex.sets.map((s, j) => (
                                <span key={j} className="text-xs font-mono text-text-secondary bg-bg-input px-2 py-1">
                                  {s.reps}×{s.weight}lbs
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </Tbody>
          </Table>
        </Card>
      </section>

      {/* Progression Charts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Progression</h2>
          <Select
            options={exercises.filter(e => e.pb).map(e => ({ value: e.name, label: e.name }))}
            value={selectedExercise}
            onChange={e => setSelectedExercise(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card header="Weight Over Time">
            <ChartWrapper height={250}>
              <LineChart data={progressionData}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" {...commonAxisProps} />
                <YAxis {...commonAxisProps} />
                <Tooltip {...commonTooltipStyle} />
                <Line type="monotone" dataKey="weight" stroke={chartColors.sage} strokeWidth={2} dot={{ fill: chartColors.sage, r: 4 }} />
              </LineChart>
            </ChartWrapper>
          </Card>
          <Card header="Steps (30 Days)">
            <ChartWrapper height={250}>
              <LineChart data={stepsData.map(d => ({ date: formatShortDate(d.date), steps: d.steps }))}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" {...commonAxisProps} interval={4} />
                <YAxis {...commonAxisProps} />
                <Tooltip {...commonTooltipStyle} />
                <Line type="monotone" dataKey="steps" stroke={chartColors.amber} strokeWidth={2} dot={false} />
              </LineChart>
            </ChartWrapper>
          </Card>
        </div>
      </section>

      {/* Add Exercise Modal */}
      <Modal isOpen={showAddExercise} onClose={() => setShowAddExercise(false)} title="Add Exercise">
        <div className="space-y-4">
          <Input label="Exercise Name" placeholder="e.g. Bulgarian Split Squat" />
          <Select label="Body Part" options={bodyParts.map(b => ({ value: b, label: b }))} placeholder="Select..." />
          <Select label="Equipment" options={equipment.map(e => ({ value: e, label: e }))} placeholder="Select..." />
          <Button onClick={() => setShowAddExercise(false)}>Add Exercise</Button>
        </div>
      </Modal>
    </div>
  );
}
