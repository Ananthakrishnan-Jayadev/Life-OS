import { useState } from 'react';
import { LayoutList, Columns, Plus } from 'lucide-react';
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
import useStore from '../store/useStore';

const STATUS_PIE_COLORS = {
  'Applied': chartColors.slate, 'Phone Screen': chartColors.amber, 'Interview': chartColors.cream,
  'Offer': chartColors.sage, 'Accepted': '#5a8a5a', 'Rejected': chartColors.rose, 'Ghosted': '#4a4440',
};

export default function JobTracker() {
  const { jobs, updateJobStatus, addJob } = useStore();
  const [view, setView] = useState('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState('dateApplied');
  const [sortDir, setSortDir] = useState('desc');
  const [newJob, setNewJob] = useState({ company: '', title: '', salary: '', notes: '', status: 'Applied' });

  // Stats
  const totalApplied = jobs.length;
  const responded = jobs.filter(j => !['Applied', 'Ghosted'].includes(j.status)).length;
  const responseRate = totalApplied > 0 ? Math.round((responded / totalApplied) * 100) : 0;
  const interviewing = jobs.filter(j => j.status === 'Interview').length;
  const offers = jobs.filter(j => j.status === 'Offer' || j.status === 'Accepted').length;
  const thisWeek = jobs.filter(j => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(j.dateApplied) >= weekAgo;
  }).length;

  // Sorted table
  const sorted = [...jobs].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'dateApplied') return mul * a.dateApplied.localeCompare(b.dateApplied);
    return mul * (a[sortBy] || '').localeCompare(b[sortBy] || '');
  });

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  // Charts
  const statusCounts = statuses.map(s => ({
    name: s, value: jobs.filter(j => j.status === s).length,
  })).filter(s => s.value > 0);

  const weeklyData = (() => {
    const weeks = {};
    jobs.forEach(j => {
      const d = new Date(j.dateApplied);
      const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b)).map(([week, count]) => ({
      week: formatShortDate(week), count,
    }));
  })();

  const handleAdd = () => {
    if (!newJob.company || !newJob.title) return;
    addJob(newJob);
    setNewJob({ company: '', title: '', salary: '', notes: '', status: 'Applied' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 stagger-fade">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Applied" value={totalApplied} />
        <StatCard label="Response Rate" value={responseRate} suffix="%" />
        <StatCard label="Interviewing" value={interviewing} />
        <StatCard label="Offers" value={offers} />
        <StatCard label="This Week" value={thisWeek} />
      </div>

      {/* View Toggle + Add */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant={view === 'table' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('table')}>
            <LayoutList className="w-4 h-4" /> Table
          </Button>
          <Button variant={view === 'kanban' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('kanban')}>
            <Columns className="w-4 h-4" /> Kanban
          </Button>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Add Application
        </Button>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <Card>
          <Table>
            <Thead>
              <Th sortable onClick={() => toggleSort('company')}>Company</Th>
              <Th>Title</Th>
              <Th sortable onClick={() => toggleSort('dateApplied')}>Date</Th>
              <Th>Status</Th>
              <Th>Salary</Th>
              <Th>Follow-up</Th>
              <Th>Notes</Th>
            </Thead>
            <Tbody>
              {sorted.map(job => (
                <Tr key={job.id}>
                  <Td className="font-medium">{job.company}</Td>
                  <Td className="text-text-secondary">{job.title}</Td>
                  <Td className="font-mono text-sm">{formatShortDate(job.dateApplied)}</Td>
                  <Td>
                    <Select
                      options={statuses.map(s => ({ value: s, label: s }))}
                      value={job.status}
                      onChange={e => updateJobStatus(job.id, e.target.value)}
                    />
                  </Td>
                  <Td className="font-mono text-sm text-text-secondary">{job.salary}</Td>
                  <Td className="font-mono text-sm">{job.followUp ? formatShortDate(job.followUp) : '—'}</Td>
                  <Td className="text-text-tertiary text-sm max-w-[200px] truncate">{job.notes}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      )}

      {/* Kanban View */}
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
                    <div
                      key={job.id}
                      className="bg-bg-secondary border border-border p-3 hover:bg-bg-tertiary transition-colors"
                    >
                      <p className="font-medium text-sm text-text-primary">{job.company}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{job.title}</p>
                      <p className="text-[10px] font-mono text-text-tertiary mt-2">{formatShortDate(job.dateApplied)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts */}
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

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Application">
        <div className="space-y-4">
          <Input label="Company" value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} placeholder="e.g. Stripe" />
          <Input label="Job Title" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} placeholder="e.g. Senior Frontend" />
          <Input label="Salary Range" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} placeholder="$150k-$200k" />
          <Input label="Notes" value={newJob.notes} onChange={e => setNewJob({ ...newJob, notes: e.target.value })} placeholder="Optional notes" />
          <Button onClick={handleAdd}>Add Application</Button>
        </div>
      </Modal>
    </div>
  );
}
