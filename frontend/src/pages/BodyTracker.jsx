import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import ChartWrapper from '../components/charts/ChartWrapper';
import { chartColors, commonAxisProps, commonTooltipStyle } from '../components/charts/chartTheme';
import { measurements, latestMeasurement, previousMeasurement } from '../data/measurements';
import { formatShortDate, daysAgo } from '../lib/utils';

const measurementFields = ['neck', 'chest', 'waist', 'hips', 'arms', 'thighs'];
const rangeOptions = [
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
  { value: '180', label: '180 Days' },
  { value: 'all', label: 'All Time' },
];

export default function BodyTracker() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [range, setRange] = useState('all');
  const [selectedMeasurement, setSelectedMeasurement] = useState('waist');
  const [unit, setUnit] = useState('imperial');

  const daysSinceLast = daysAgo(latestMeasurement.date);
  const weightDiff = (latestMeasurement.weight - previousMeasurement.weight).toFixed(1);
  const bfDiff = (latestMeasurement.bf - previousMeasurement.bf).toFixed(1);

  const filteredData = range === 'all' ? measurements : measurements.filter(m => {
    const d = daysAgo(m.date);
    return d <= parseInt(range);
  });

  const chartData = filteredData.map(m => ({
    date: formatShortDate(m.date),
    weight: m.weight,
    bf: m.bf,
  }));

  const measurementChartData = filteredData.map(m => ({
    date: formatShortDate(m.date),
    value: m[selectedMeasurement],
  }));

  return (
    <div className="space-y-8 stagger-fade">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Weight"
          value={latestMeasurement.weight}
          suffix=" lbs"
          trend={parseFloat(weightDiff) <= 0 ? 'up' : 'down'}
          trendValue={`${weightDiff} lbs`}
        />
        <StatCard
          label="Body Fat %"
          value={latestMeasurement.bf}
          suffix="%"
          trend={parseFloat(bfDiff) <= 0 ? 'up' : 'down'}
          trendValue={`${bfDiff}%`}
        />
        <StatCard label="Waist" value={latestMeasurement.waist} suffix='"' />
        <StatCard label="Days Since Entry" value={daysSinceLast} suffix=" days" />
      </div>

      {/* New Entry Form */}
      <Card header="New Entry">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input label="Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          <Input label="Weight (lbs)" type="number" placeholder="182" />
          <Input label="Neck (in)" type="number" placeholder="15.4" />
          <Input label="Chest (in)" type="number" placeholder="40.5" />
          <Input label="Waist (in)" type="number" placeholder="31" />
          <Input label="Hips (in)" type="number" placeholder="37.5" />
          <Input label="Arms (in)" type="number" placeholder="15.6" />
          <Input label="Thighs (in)" type="number" placeholder="22.8" />
          <Input label="BF% (auto)" type="number" placeholder="Auto-calculated" disabled />
          <Input label="BF% Override" type="number" placeholder="Optional" />
        </div>
        <Button className="mt-4">Save Entry</Button>
      </Card>

      {/* History */}
      <section>
        <h2 className="font-display text-xl mb-4">History</h2>
        <Card>
          <Table>
            <Thead>
              <Th>Date</Th>
              <Th>Weight</Th>
              <Th>BF%</Th>
              <Th>Waist</Th>
              <Th>Chest</Th>
              <Th></Th>
            </Thead>
            <Tbody>
              {[...measurements].reverse().map(m => (
                <>
                  <Tr key={m.id} onClick={() => setExpandedRow(expandedRow === m.id ? null : m.id)}>
                    <Td className="font-mono text-sm">{formatShortDate(m.date)}</Td>
                    <Td className="font-mono">{m.weight} lbs</Td>
                    <Td className="font-mono">{m.bf}%</Td>
                    <Td className="font-mono">{m.waist}"</Td>
                    <Td className="font-mono">{m.chest}"</Td>
                    <Td>{expandedRow === m.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</Td>
                  </Tr>
                  {expandedRow === m.id && (
                    <tr key={m.id + '-detail'}>
                      <td colSpan={6} className="px-4 py-3 bg-bg-tertiary">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          {measurementFields.map(f => (
                            <div key={f}>
                              <span className="text-text-tertiary capitalize">{f}: </span>
                              <span className="font-mono text-text-primary">{m[f]}"</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </Tbody>
          </Table>
        </Card>
      </section>

      {/* Charts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Progress Charts</h2>
          <Select
            options={rangeOptions}
            value={range}
            onChange={e => setRange(e.target.value)}
          />
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
              <Select
                options={measurementFields.map(f => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))}
                value={selectedMeasurement}
                onChange={e => setSelectedMeasurement(e.target.value)}
              />
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
    </div>
  );
}
