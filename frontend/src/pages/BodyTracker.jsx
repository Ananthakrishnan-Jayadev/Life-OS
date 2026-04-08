import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Trash2, ChevronLeft, X, ImageIcon, Ruler } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonStatCards, SkeletonTable } from '../components/ui/Skeleton';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import ChartWrapper from '../components/charts/ChartWrapper';
import { chartColors, commonAxisProps, commonTooltipStyle } from '../components/charts/chartTheme';
import { formatShortDate, daysAgo } from '../lib/utils';
import { toast } from '../store/toastStore';
import useMeasurements from '../hooks/useMeasurements';

const measurementFields = ['neck', 'chest', 'waist', 'hips', 'arms', 'thighs'];
const rangeOptions = [
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
  { value: '180', label: '180 Days' },
  { value: 'all', label: 'All Time' },
];

function calcNavyBF(neck, waist, hips, height, gender = 'male') {
  if (!neck || !waist || !height) return null;
  if (gender === 'male') return (495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450).toFixed(1);
  if (!hips) return null;
  return (495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(height)) - 450).toFixed(1);
}

function PhotoModal({ photos, initialIndex, onClose }) {
  const [idx, setIdx] = useState(initialIndex);
  const photo = photos[idx];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-8 right-0 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        <img src={photo.url} alt={photo.date} className="w-full max-h-[80vh] object-contain border border-border" />
        <p className="text-center text-sm text-white/60 font-mono mt-2">{formatShortDate(photo.date)}</p>
        {photos.length > 1 && (
          <div className="absolute inset-y-0 flex items-center justify-between w-full px-2 pointer-events-none">
            <button onClick={() => setIdx((idx - 1 + photos.length) % photos.length)} disabled={idx === 0}
              className="pointer-events-auto bg-black/50 hover:bg-black/70 p-1 disabled:opacity-20 text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setIdx((idx + 1) % photos.length)} disabled={idx === photos.length - 1}
              className="pointer-events-auto bg-black/50 hover:bg-black/70 p-1 disabled:opacity-20 text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BodyTracker() {
  const { data: measurements, loading, error, create, remove } = useMeasurements();
  const [expandedRow, setExpandedRow] = useState(null);
  const [range, setRange] = useState('all');
  const [selectedMeasurement, setSelectedMeasurement] = useState('waist');
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [modalPhoto, setModalPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '', height: '', neck: '', chest: '', waist: '', hips: '', arms: '', thighs: '', bf_override: '',
  });

  const autoBF = calcNavyBF(parseFloat(form.neck), parseFloat(form.waist), parseFloat(form.hips), parseFloat(form.height));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null); setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.date || !form.weight) return;
    setSaving(true);
    try {
      await create({
        date: form.date,
        weight: parseFloat(form.weight) || null,
        neck: parseFloat(form.neck) || null,
        chest: parseFloat(form.chest) || null,
        waist: parseFloat(form.waist) || null,
        hips: parseFloat(form.hips) || null,
        arms: parseFloat(form.arms) || null,
        thighs: parseFloat(form.thighs) || null,
        bf: parseFloat(form.bf_override) || parseFloat(autoBF) || null,
      }, photoFile);
      setForm({ date: new Date().toISOString().split('T')[0], weight: '', height: '', neck: '', chest: '', waist: '', hips: '', arms: '', thighs: '', bf_override: '' });
      clearPhoto();
      toast.success('Measurement saved!');
    } catch (e) {
      toast.error('Failed to save measurement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try { await remove(id); toast.success('Entry deleted'); }
    catch (e) { toast.error('Failed to delete entry'); }
  };

  if (loading) return (
    <div className="space-y-8">
      <SkeletonStatCards count={4} />
      <SkeletonTable rows={5} cols={6} />
    </div>
  );
  if (error) return <div className="text-accent-rose py-12 text-center">{error}</div>;

  const latest = measurements[0];
  const previous = measurements[1];
  const filteredData = range === 'all' ? measurements : measurements.filter(m => daysAgo(m.date) <= parseInt(range));
  const chartData = [...filteredData].reverse().map(m => ({ date: formatShortDate(m.date), weight: m.weight, bf: m.bf }));
  const measurementChartData = [...filteredData].reverse().map(m => ({ date: formatShortDate(m.date), value: m[selectedMeasurement] }));
  const weightDiff = latest && previous ? (latest.weight - previous.weight).toFixed(1) : null;
  const bfDiff = latest && previous ? (latest.bf - previous.bf).toFixed(1) : null;
  const photos = measurements.filter(m => m.photo_url).map(m => ({ url: m.photo_url, date: m.date, id: m.id }));

  return (
    <div className="space-y-8 stagger-fade">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Weight" value={latest?.weight ?? '—'} suffix=" lbs" trend={weightDiff !== null ? (parseFloat(weightDiff) <= 0 ? 'up' : 'down') : null} trendValue={weightDiff !== null ? `${weightDiff} lbs` : null} />
        <StatCard label="Body Fat %" value={latest?.bf ?? '—'} suffix="%" trend={bfDiff !== null ? (parseFloat(bfDiff) <= 0 ? 'up' : 'down') : null} trendValue={bfDiff !== null ? `${bfDiff}%` : null} />
        <StatCard label="Waist" value={latest?.waist ?? '—'} suffix='"' />
        <StatCard label="Days Since Entry" value={latest ? daysAgo(latest.date) : '—'} suffix=" days" />
      </div>

      <Card header="New Entry">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <Input label="Weight (lbs)" type="number" placeholder="182" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
          <Input label="Height (in)" type="number" placeholder="70" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} />
          <Input label="Neck (in)" type="number" placeholder="15.4" value={form.neck} onChange={e => setForm({ ...form, neck: e.target.value })} />
          <Input label="Chest (in)" type="number" placeholder="40.5" value={form.chest} onChange={e => setForm({ ...form, chest: e.target.value })} />
          <Input label="Waist (in)" type="number" placeholder="31" value={form.waist} onChange={e => setForm({ ...form, waist: e.target.value })} />
          <Input label="Hips (in)" type="number" placeholder="37.5" value={form.hips} onChange={e => setForm({ ...form, hips: e.target.value })} />
          <Input label="Arms (in)" type="number" placeholder="15.6" value={form.arms} onChange={e => setForm({ ...form, arms: e.target.value })} />
          <Input label="Thighs (in)" type="number" placeholder="22.8" value={form.thighs} onChange={e => setForm({ ...form, thighs: e.target.value })} />
          <Input label="BF% (auto)" type="number" value={autoBF || ''} placeholder="Fill height+neck+waist" disabled />
          <Input label="BF% Override" type="number" placeholder="Optional" value={form.bf_override} onChange={e => setForm({ ...form, bf_override: e.target.value })} />
        </div>
        <div className="mt-4">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Progress Photo (optional)</p>
          {photoPreview ? (
            <div className="flex items-start gap-3">
              <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover border border-border" />
              <button onClick={clearPhoto} className="text-xs text-accent-rose hover:underline mt-1">Remove</button>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer w-fit px-3 py-2 border border-border text-sm text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors">
              <ImageIcon className="w-4 h-4" />
              <span>Attach photo</span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          )}
        </div>
        <Button className="mt-4" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Entry'}</Button>
      </Card>

      <section>
        <h2 className="font-display text-xl mb-4">History</h2>
        <Card>
          {measurements.length === 0 ? (
            <EmptyState icon={Ruler} message="No entries yet — add your first measurement above." />
          ) : (
            <Table>
              <Thead><Th>Date</Th><Th>Weight</Th><Th>BF%</Th><Th>Waist</Th><Th>Chest</Th><Th>Photo</Th><Th></Th></Thead>
              <Tbody>
                {measurements.map(m => (
                  <>
                    <Tr key={m.id} onClick={() => setExpandedRow(expandedRow === m.id ? null : m.id)}>
                      <Td className="font-mono text-sm">{formatShortDate(m.date)}</Td>
                      <Td className="font-mono">{m.weight} lbs</Td>
                      <Td className="font-mono">{m.bf ?? '—'}%</Td>
                      <Td className="font-mono">{m.waist ?? '—'}"</Td>
                      <Td className="font-mono">{m.chest ?? '—'}"</Td>
                      <Td>
                        {m.photo_url ? (
                          <button onClick={e => { e.stopPropagation(); const idx = photos.findIndex(p => p.id === m.id); setModalPhoto({ index: idx }); }}>
                            <img src={m.photo_url} alt="progress" className="w-10 h-10 object-cover border border-border hover:border-border-hover transition-colors" />
                          </button>
                        ) : <span className="text-text-tertiary text-xs">—</span>}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          {expandedRow === m.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          <button onClick={e => { e.stopPropagation(); handleDelete(m.id); }} className="text-text-tertiary hover:text-accent-rose"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </Td>
                    </Tr>
                    {expandedRow === m.id && (
                      <tr key={m.id + '-detail'}>
                        <td colSpan={7} className="px-4 py-3 bg-bg-tertiary">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            {measurementFields.map(f => (
                              <div key={f}><span className="text-text-tertiary capitalize">{f}: </span><span className="font-mono text-text-primary">{m[f] ?? '—'}"</span></div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Progress Charts</h2>
          <Select options={rangeOptions} value={range} onChange={e => setRange(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card header="Weight & Body Fat %">
            <ChartWrapper height={280}>
              <LineChart data={chartData}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" {...commonAxisProps} />
                <YAxis yAxisId="left" {...commonAxisProps} />
                <YAxis yAxisId="right" orientation="right" {...commonAxisProps} />
                <Tooltip {...commonTooltipStyle} />
                <Legend wrapperStyle={{ color: chartColors.text, fontFamily: 'DM Sans', fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="weight" name="Weight (lbs)" stroke={chartColors.cream} strokeWidth={2} dot={{ fill: chartColors.cream, r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="bf" name="BF %" stroke={chartColors.rose} strokeWidth={2} dot={{ fill: chartColors.rose, r: 3 }} />
              </LineChart>
            </ChartWrapper>
          </Card>
          <Card header={
            <div className="flex items-center justify-between">
              <span className="font-display text-lg text-text-primary">Measurement Trend</span>
              <Select options={measurementFields.map(f => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))} value={selectedMeasurement} onChange={e => setSelectedMeasurement(e.target.value)} />
            </div>
          }>
            <ChartWrapper height={280}>
              <LineChart data={measurementChartData}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" {...commonAxisProps} />
                <YAxis {...commonAxisProps} domain={['auto', 'auto']} />
                <Tooltip {...commonTooltipStyle} />
                <Line type="monotone" dataKey="value" name={selectedMeasurement} stroke={chartColors.sage} strokeWidth={2} dot={{ fill: chartColors.sage, r: 3 }} />
              </LineChart>
            </ChartWrapper>
          </Card>
        </div>
      </section>

      {modalPhoto !== null && photos.length > 0 && (
        <PhotoModal photos={photos} initialIndex={modalPhoto.index} onClose={() => setModalPhoto(null)} />
      )}
    </div>
  );
}
