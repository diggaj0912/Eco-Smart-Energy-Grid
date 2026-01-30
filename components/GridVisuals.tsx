import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface GridVisualsProps {
  severity: 'Low' | 'Medium' | 'High';
  lastUpdate: Date;
}

const generateData = (severity: string) => {
  const baseLoad = severity === 'High' ? 85 : severity === 'Medium' ? 65 : 45;
  const volatility = severity === 'High' ? 15 : 5;
  
  return Array.from({ length: 20 }, (_, i) => ({
    time: `T-${20-i}`,
    load: Math.min(100, Math.max(0, baseLoad + (Math.random() * volatility * 2 - volatility))),
    capacity: 90
  }));
};

const GridVisuals: React.FC<GridVisualsProps> = ({ severity, lastUpdate }) => {
  const data = useMemo(() => generateData(severity), [severity, lastUpdate]);

  const color = severity === 'High' ? '#ef4444' : severity === 'Medium' ? '#f59e0b' : '#10b981';

  return (
    <div 
      className="h-64 w-full bg-grid-800 rounded-lg p-4 border border-gray-800"
      role="img"
      aria-label={`Real-time load analysis chart showing ${severity} severity load fluctuations over the last 20 intervals.`}
    >
      <h3 className="text-gray-400 text-xs font-mono mb-2 uppercase tracking-wider" aria-hidden="true">Real-time Load Analysis</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
            itemStyle={{ color: '#f3f4f6' }}
          />
          <ReferenceLine y={90} label="Capacity" stroke="red" strokeDasharray="3 3" />
          <Area 
            type="monotone" 
            dataKey="load" 
            stroke={color} 
            fillOpacity={1} 
            fill="url(#colorLoad)" 
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(GridVisuals);