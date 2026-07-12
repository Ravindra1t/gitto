'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function SizeChart({ data }) {
  // Convert object data {"small": 60, "medium": 30, "large": 10} to Recharts array format
  const chartData = [
    { name: 'Small (<100 lines)', value: data?.small || 0 },
    { name: 'Medium (100-500 lines)', value: data?.medium || 0 },
    { name: 'Large (>500 lines)', value: data?.large || 0 }
  ];

  return (
    <div className="w-full h-64 font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#71717a" 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#71717a', fontSize: 10 }}
          />
          <YAxis 
            stroke="#71717a" 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#71717a', fontSize: 10 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded font-mono text-xs shadow-xl">
                    <p className="text-zinc-400">{payload[0].payload.name}</p>
                    <p className="text-zinc-100 font-bold mt-1">
                      Share: {payload[0].value.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="value" 
            fill="#f4f4f5" // Zinc-100 (almost white)
            radius={[4, 4, 0, 0]} 
            maxBarSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DomainChart({ data }) {
  // Convert object data {"frontend": 40, "backend": 30, "devops": 30} to Recharts array format
  const chartData = [
    { name: 'Frontend', value: data?.frontend || 0 },
    { name: 'Backend', value: data?.backend || 0 },
    { name: 'DevOps', value: data?.devops || 0 }
  ];

  return (
    <div className="w-full h-64 font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
          <XAxis 
            type="number"
            stroke="#71717a" 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#71717a', fontSize: 10 }}
            unit="%"
          />
          <YAxis 
            dataKey="name" 
            type="category"
            stroke="#71717a" 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#71717a', fontSize: 10 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded font-mono text-xs shadow-xl">
                    <p className="text-zinc-400">{payload[0].payload.name}</p>
                    <p className="text-zinc-100 font-bold mt-1">
                      Share: {payload[0].value.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="value" 
            fill="#a1a1aa" // Zinc-400 (medium gray for contrast)
            radius={[0, 4, 4, 0]} 
            maxBarSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
