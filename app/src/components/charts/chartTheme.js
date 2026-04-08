export const chartColors = {
  sage: '#7c9a72',
  amber: '#c4973b',
  rose: '#b56b6b',
  slate: '#6b8a9e',
  cream: '#d4c5a9',
  grid: '#3d3633',
  text: '#a89e94',
  bg: '#242120',
};

export const commonAxisProps = {
  stroke: chartColors.grid,
  tick: { fill: chartColors.text, fontSize: 12, fontFamily: 'JetBrains Mono' },
  tickLine: false,
  axisLine: { stroke: chartColors.grid },
};

export const commonTooltipStyle = {
  contentStyle: {
    backgroundColor: '#2e2a28',
    border: '1px solid #3d3633',
    borderRadius: 0,
    color: '#e8e0d8',
    fontFamily: 'DM Sans',
    fontSize: 13,
  },
  cursor: { stroke: chartColors.cream, strokeDasharray: '4 4' },
};
