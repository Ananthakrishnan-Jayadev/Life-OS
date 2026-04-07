import { useState } from 'react';
import { LayoutList, Columns, Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import ChartWrapper from '../components/charts/ChartWrapper';
import { chartColors, commonAxisProps, commonTooltipStyle } from '../components/charts/chartTheme';
import { statuses, statusColors } from '../data/jobs';
import { formatShortDate } from '../lib/utils';
import useJobs from '../hooks/useJobs';

const STATUS_PIE_COLORS = {
  'Applied': chartColors.slate, 'Phone Screen': chartColors.amber, 'Interview': chartColors.cream,
  'Offer': chartColors.sage, 'Accepted': '#5a8a5a', 'Rejected': chartColors.rose, 'Ghosted': '#4a4440',
};

export default function JobTracker() {
  const { data: jobs, stats, loading, error, create, update, remove } = useJobs();
  const [view, setView] = useState('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState('date_applied');
  const [sortDir, setSortDir] = useState('desc');
  const [newJob, setNewJob] = useState({ company: '', title: '', salary: '', notes: '', status: 'Applied' });
  const [saving, setSaving] = useState(false);

  const totalApplied = stats.total || 0;
  const responded = jobs.filter(j => !['Applied', 'Ghosted'].includes(j.status)).length;
  const responseRate = totalApplied > 0 ? Math.round((responded / totalApplied) * 100) : 0;
  const interviewing = stats['Interview'] || 0;
  const offers = (stats['Offer'] || 0) + (stats['Accepted'] || 0);
  const thisWeek = jobs.filter(j => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(j.date_applied) >= weekAgo;
  }).length;

  const sorted = [...jobs].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'date_applied') return mul * (a.date_applied || '').localeCompare(b.date_applied || '');
    return mul * (a[sortBy] || '').localeCompare(b[sortBy] || '');
  });

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  const statusCounts = statuses.map(s => ({ name: s, value: stats[s] || 0 })).filter(s => s.value > 0);

  const weeklyData = (() => {
    const weeks = {};
    jobs.forEach(j => {
      if (!j.date_applied) return;
      const d = new Date(j.date_applied);
      const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b)).map(([week, count]) => ({ week: formatShortDate(week), count }));
  })();

  const handleAdd = async () => {
    if (!newJob.company || !newJob.title) return;
    setSaving(true);
    try {
      await create({ ...newJob, date_applied: new Date().toISOString().split('T')[0] });
      setNewJob({ company: '', title: '', salary: '', notes: '', status: 'Applied' });
      setShowAddModal(false);
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try { await update(id, { status }); } catch (e) { alert(e.message); }
  };

  if (loading) return <div className="text-text-tertiary py-12 text-center">Loading...</div>;
  if (error) return <div className="text-accent-rose py-12 text-center">{error}</div>;

  return (
    <div className="space-y-8 stagger-fade">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Applied" value={totalApplied} />
        <StatCard label="Response Rate" value={responseRate} suffix="%" />
        <StatCard label="Interviewing" value={interviewing} />
        <StatCard label="Offers" value={offers} />
        <StatCard label="This Week" value={thisWeek} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant={view === 'table' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('table')}><LayoutList className="w-4 h-4" /> Table</Button>
          <Button variant={view === 'kanban' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('kanban')}><Columns className="w-4 h-4" /> Kanban</Button>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4" /> Add Application</Button>
      </div>

      {view === 'table' && (
        <Card>
          {jobs.length === 0 ? (
            <p className="text-text-tertiary text-sm py-6 text-center">No applications yet. Add your first one.</p>
          ) : (
            <Table>
              <Thead>
                <Th sortable onClick={() => toggleSort('company')}>Company</Th>
                <Th>Title</Th>
                <Th sortable onClick={() => toggleSort('date_applied')}>Date</Th>
                <Th>Status</Th>
                <Th>Salary</Th>
                <Th>Notes</Th>
                <Th></Th>
              </Thead>
              <Tbody>
                {sorted.map(job => (
                  <Tr key={job.id}>
                    <Td className="font-medium">{job.company}</Td>
                    <Td className="text-text-secondary">{job.title}</Td>
                    <Td className="font-mono text-sm">{formatShortDate(job.date_applied)}</Td>
                    <Td>
                      <Select options={statuses.map(s => ({ value: s, label: s }))} value={job.status} onChange={e => handleStatusChange(job.id, e.target.value)} />
                    </Td>
                    <Td className="font-mono text-sm text-text-secondary">{job.salary}</Td>
                    <Td className="text-text-tertiary text-sm max-w-[200px] truncate">{job.notes}</Td>
                    <Td>
                      <button onClick={() => remove(job.id)} className="text-text-tertiary hover:text-accent-rose"><Trash2 className="w-4 h-4" /></button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      )}

      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map(status => {
            const statusJobs = jobs.filter(j => j.status === status);
            return (
              <div key={status} className="min-w-[220px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <Badge color={statusColors[status]}>{status}</Badge>
                  <span className="text-xs font-mono text-text-tertiary">{statusJobs.length}</span>
                </div>
                <div className="space-y-2">
                  {statusJobs.map(job => (
                    <div key={job.id} className="bg-bg-secondary border border-border p-3 hover:bg-bg-tertiary transition-colors">
                      <p className="font-medium text-sm text-text-primary">{job.company}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{job.title}</p>
                      <p className="text-[10px] font-mono text-text-tertiary mt-2">{formatShortDate(job.date_applied)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card header="Applications by Status">
          <ChartWrapper height={250}>
            <PieChart>
              <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {statusCounts.map((s) => <Cell key={s.name} fill={STATUS_PIE_COLORS[s.name]} />)}
              </Pie>
              <Tooltip {...commonTooltipStyle} />
            </PieChart>
          </ChartWrapper>
        </Card>

        <Card header="Applications Over Time">
          <ChartWrapper height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis dataKey="week" {...commonAxisProps} />
              <YAxis {...commonAxisProps} />
              <Tooltip {...commonTooltipStyle} />
              <Bar dataKey="count" name="Applications" fill={chartColors.slate} />
            </BarChart>
          </ChartWrapper>
        </Card>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Application">
        <div className="space-y-4">
          <Input label="Company" value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} placeholder="e.g. Stripe" />
          <Input label="Job Title" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} placeholder="e.g. Senior Frontend" />
          <Input label="Salary Range" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} placeholder="$150k-$200k" />
          <Input label="Notes" value={newJob.notes} onChange={e => setNewJob({ ...newJob, notes: e.target.value })} placeholder="Optional notes" />
          <Button onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Application'}</Button>
        </div>
      </Modal>
    </div>
  );
}
