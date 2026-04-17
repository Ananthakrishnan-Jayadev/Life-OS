import { useState, useEffect, Fragment } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, Dumbbell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable, SkeletonChart } from '../components/ui/Skeleton';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import ChartWrapper from '../components/charts/ChartWrapper';
import { chartColors, commonAxisProps, commonTooltipStyle } from '../components/charts/chartTheme';
import { bodyParts, equipment } from '../data/exercises';
import { formatShortDate } from '../lib/utils';
import { toast } from '../store/toastStore';
import useExercises from '../hooks/useExercises';
import useWorkouts from '../hooks/useWorkouts';

export default function Workout() {
  const { data: exercises, loading: exLoading, create: createExercise } = useExercises();
  const { data: workouts, loading: wkLoading, create: createWorkout, addExercise: addWkExercise, addSet, remove: deleteWorkout, getProgression } = useWorkouts();

  const [bpFilter, setBpFilter] = useState('');
  const [eqFilter, setEqFilter] = useState('');
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [historyBpFilter, setHistoryBpFilter] = useState('');
  const [progressionData, setProgressionData] = useState([]);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logBodyPart, setLogBodyPart] = useState('');
  const [logExercises, setLogExercises] = useState([]);
  const [logAddExercise, setLogAddExercise] = useState('');
  const [saving, setSaving] = useState(false);
  const [newEx, setNewEx] = useState({ name: '', body_part: '', equipment: '' });

  const filteredExercises = exercises.filter(e => (!bpFilter || e.body_part === bpFilter) && (!eqFilter || e.equipment === eqFilter));
  const filteredHistory = workouts.filter(w => !historyBpFilter || w.body_part === historyBpFilter);

  useEffect(() => {
    if (!selectedExercise) return;
    const ex = exercises.find(e => e.name === selectedExercise);
    if (!ex) return;
    getProgression(ex.id).then(data => {
      setProgressionData(data.map(d => ({ date: formatShortDate(d.date), weight: d.weight })));
    }).catch(() => {});
  }, [selectedExercise, exercises]);

  const addExerciseToLog = () => {
    if (!logAddExercise) return;
    setLogExercises([...logExercises, { name: logAddExercise, sets: [{ reps: '', weight: '' }] }]);
    setLogAddExercise('');
  };
  const addSetToExercise = (idx) => { const u = [...logExercises]; u[idx].sets.push({ reps: '', weight: '' }); setLogExercises(u); };
  const updateSet = (exIdx, setIdx, field, value) => { const u = [...logExercises]; u[exIdx].sets[setIdx][field] = value; setLogExercises(u); };
  const removeExercise = (idx) => setLogExercises(logExercises.filter((_, i) => i !== idx));

  const saveWorkout = async () => {
    if (!logExercises.length) return;
    setSaving(true);
    try {
      const workout = await createWorkout({ date: logDate, body_part: logBodyPart });
      for (const ex of logExercises) {
        const dbEx = exercises.find(e => e.name === ex.name);
        if (!dbEx) continue;
        const wkEx = await addWkExercise({ workout_id: workout.id, exercise_id: dbEx.id });
        for (const [setIdx, s] of ex.sets.entries()) {
          if (!s.reps && !s.weight) continue;
          await addSet({ workout_exercise_id: wkEx.id, set_number: setIdx + 1, reps: parseInt(s.reps) || 0, weight: parseFloat(s.weight) || 0 });
        }
      }
      setLogExercises([]);
      setLogBodyPart('');
      toast.success('Workout saved!');
    } catch (e) {
      toast.error('Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const handleAddExercise = async () => {
    if (!newEx.name) return;
    try {
      await createExercise(newEx);
      setNewEx({ name: '', body_part: '', equipment: '' });
      setShowAddExercise(false);
      toast.success('Exercise added!');
    } catch (e) {
      toast.error('Failed to add exercise');
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await deleteWorkout(id);
      toast.success('Workout deleted');
    } catch (e) {
      toast.error('Failed to delete workout');
    }
  };

  const loading = exLoading && wkLoading;

  return (
    <div className="space-y-8 stagger-fade">
      {/* Exercise Database */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-xl">Exercise Database</h2>
          <div className="flex gap-2 flex-wrap">
            <Select options={bodyParts.map(b => ({ value: b, label: b }))} value={bpFilter} onChange={e => setBpFilter(e.target.value)} placeholder="All Body Parts" />
            <Select options={equipment.map(e => ({ value: e, label: e }))} value={eqFilter} onChange={e => setEqFilter(e.target.value)} placeholder="All Equipment" />
            <Button size="sm" onClick={() => setShowAddExercise(true)}><Plus className="w-4 h-4" /> Add</Button>
          </div>
        </div>
        <Card>
          {exLoading ? <SkeletonTable rows={5} cols={4} /> : filteredExercises.length === 0 ? (
            <EmptyState icon={Dumbbell} message="No exercises yet — add your first one." action="Add Exercise" onAction={() => setShowAddExercise(true)} />
          ) : (
            <Table>
              <Thead><Th>Exercise</Th><Th>Body Part</Th><Th>Equipment</Th><Th>Personal Best</Th></Thead>
              <Tbody>
                {filteredExercises.map(ex => (
                  <Tr key={ex.id}>
                    <Td className="font-medium">{ex.name}</Td>
                    <Td><Badge color="slate">{ex.body_part}</Badge></Td>
                    <Td className="text-text-secondary">{ex.equipment}</Td>
                    <Td className="font-mono">{ex.pb ? `${ex.pb} lbs` : '—'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      </section>

      {/* Log Workout */}
      <section>
        <h2 className="font-display text-xl mb-4">Log Workout</h2>
        <Card>
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Input label="Date" type="date" value={logDate} onChange={e => setLogDate(e.target.value)} />
              <Select label="Body Part" options={bodyParts.map(b => ({ value: b, label: b }))} value={logBodyPart} onChange={e => setLogBodyPart(e.target.value)} placeholder="Select..." />
            </div>
            {logExercises.map((ex, exIdx) => (
              <div key={exIdx} className="border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-text-primary">{ex.name}</h4>
                  <button onClick={() => removeExercise(exIdx)} className="text-text-tertiary hover:text-accent-rose"><Trash2 className="w-4 h-4" /></button>
                </div>
                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-3">
                    <span className="text-xs text-text-tertiary font-mono w-6">#{setIdx + 1}</span>
                    <Input placeholder="Reps" type="number" value={set.reps} onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)} className="w-20" />
                    <span className="text-text-tertiary">×</span>
                    <Input placeholder="Weight" type="number" value={set.weight} onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)} className="w-24" />
                    <span className="text-xs text-text-tertiary">lbs</span>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addSetToExercise(exIdx)}>+ Add Set</Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Select
                options={exercises.filter(e => !logBodyPart || e.body_part === logBodyPart).map(e => ({ value: e.name, label: e.name }))}
                value={logAddExercise} onChange={e => setLogAddExercise(e.target.value)} placeholder="Add exercise..."
              />
              <Button size="sm" onClick={addExerciseToLog}><Plus className="w-4 h-4" /></Button>
            </div>
            <Button onClick={saveWorkout} disabled={saving || logExercises.length === 0}>{saving ? 'Saving...' : 'Save Workout'}</Button>
          </div>
        </Card>
      </section>

      {/* History */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">History</h2>
          <Select options={bodyParts.map(b => ({ value: b, label: b }))} value={historyBpFilter} onChange={e => setHistoryBpFilter(e.target.value)} placeholder="All Body Parts" />
        </div>
        <Card>
          {wkLoading ? <SkeletonTable rows={5} cols={5} /> : filteredHistory.length === 0 ? (
            <EmptyState icon={Dumbbell} message="No workouts logged yet — start tracking above." />
          ) : (
            <Table>
              <Thead><Th>Date</Th><Th>Body Part</Th><Th>Exercises</Th><Th>Volume</Th><Th></Th></Thead>
              <Tbody>
                {filteredHistory.map(w => {
                  const allSets = (w.workout_exercises || []).flatMap(we => we.sets || []);
                  const volume = allSets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0);
                  return (
                    <Fragment key={w.id}>
                      <Tr onClick={() => setExpandedWorkout(expandedWorkout === w.id ? null : w.id)}>
                        <Td className="font-mono text-sm">{formatShortDate(w.date)}</Td>
                        <Td><Badge color="slate">{w.body_part}</Badge></Td>
                        <Td className="text-text-secondary">{(w.workout_exercises || []).map(e => e.exercise?.name).join(', ')}</Td>
                        <Td className="font-mono">{volume.toLocaleString()} lbs</Td>
                        <Td>{expandedWorkout === w.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</Td>
                      </Tr>
                      {expandedWorkout === w.id && (
                        <tr key={w.id + '-detail'}>
                          <td colSpan={5} className="px-4 py-3 bg-bg-tertiary">
                            {(w.workout_exercises || []).map((we, i) => (
                              <div key={i} className="mb-3">
                                <p className="text-sm font-medium text-accent-cream mb-1">{we.exercise?.name}</p>
                                <div className="flex flex-wrap gap-2">
                                  {(we.sets || []).map((s, j) => (
                                    <span key={j} className="text-xs font-mono text-text-secondary bg-bg-input px-2 py-1">{s.reps}×{s.weight}lbs</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <button onClick={() => handleDeleteWorkout(w.id)} className="text-xs text-accent-rose hover:underline mt-2">Delete workout</button>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </Card>
      </section>

      {/* Progression */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Progression</h2>
          <Select options={exercises.map(e => ({ value: e.name, label: e.name }))} value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} placeholder="Select exercise..." />
        </div>
        <Card header="Weight Over Time">
          {!selectedExercise ? (
            <EmptyState message="Select an exercise above to see progression." />
          ) : progressionData.length === 0 ? (
            <EmptyState message="No data yet for this exercise." />
          ) : (
            <ChartWrapper height={250}>
              <LineChart data={progressionData}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" {...commonAxisProps} />
                <YAxis {...commonAxisProps} />
                <Tooltip {...commonTooltipStyle} />
                <Line type="monotone" dataKey="weight" stroke={chartColors.sage} strokeWidth={2} dot={{ fill: chartColors.sage, r: 4 }} />
              </LineChart>
            </ChartWrapper>
          )}
        </Card>
      </section>

      <Modal isOpen={showAddExercise} onClose={() => setShowAddExercise(false)} title="Add Exercise">
        <div className="space-y-4">
          <Input label="Exercise Name" placeholder="e.g. Bulgarian Split Squat" value={newEx.name} onChange={e => setNewEx({ ...newEx, name: e.target.value })} />
          <Select label="Body Part" options={bodyParts.map(b => ({ value: b, label: b }))} value={newEx.body_part} onChange={e => setNewEx({ ...newEx, body_part: e.target.value })} placeholder="Select..." />
          <Select label="Equipment" options={equipment.map(e => ({ value: e, label: e }))} value={newEx.equipment} onChange={e => setNewEx({ ...newEx, equipment: e.target.value })} placeholder="Select..." />
          <Button onClick={handleAddExercise}>Add Exercise</Button>
        </div>
      </Modal>
    </div>
  );
}
