import { ResponsiveContainer } from 'recharts';

export default function ChartWrapper({ children, height = 300 }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
