'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Monochromatic palette shades
const COLORS = {
  primary: '#18181b',   // Zinc-900 (dark gray)
  secondary: '#71717a', // Zinc-500 (medium gray)
  tertiary: '#a1a1aa',  // Zinc-400 (light-medium gray)
  light: '#d4d4d8',     // Zinc-300 (light gray)
  border: '#e4e4e7'     // Zinc-200 (subtle grid line)
};

export function SizeChart({ data }) {
  const chartData = [
    { name: 'Small', value: data?.small || 0 },
    { name: 'Medium', value: data?.medium || 0 },
    { name: 'Large', value: data?.large || 0 }
  ];

  return (
    <div className="w-full h-48 font-mono text-[10px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke={COLORS.secondary} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.secondary, fontSize: 10 }}
          />
          <YAxis 
            stroke={COLORS.secondary} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.secondary, fontSize: 10 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'rgba(24, 24, 27, 0.02)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-zinc-200 p-2 rounded font-mono text-[11px] shadow-sm">
                    <p className="text-zinc-500 font-bold">{payload[0].payload.name}</p>
                    <p className="text-zinc-900 mt-0.5">
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
            fill={COLORS.primary} 
            radius={[3, 3, 0, 0]} 
            maxBarSize={35}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DomainChart({ data }) {
  const chartData = [
    { name: 'Frontend', value: data?.frontend || 0 },
    { name: 'Backend', value: data?.backend || 0 },
    { name: 'DevOps', value: data?.devops || 0 }
  ];

  return (
    <div className="w-full h-48 font-mono text-[10px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke={COLORS.secondary} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.secondary, fontSize: 10 }}
          />
          <YAxis 
            stroke={COLORS.secondary} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.secondary, fontSize: 10 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'rgba(24, 24, 27, 0.02)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-zinc-200 p-2 rounded font-mono text-[11px] shadow-sm">
                    <p className="text-zinc-500 font-bold">{payload[0].payload.name}</p>
                    <p className="text-zinc-900 mt-0.5">
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
            fill={COLORS.secondary} 
            radius={[3, 3, 0, 0]} 
            maxBarSize={35}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VelocityChart({ data }) {
  const chartData = [
    { name: 'Fast (<24h)', value: data?.fast || 0 },
    { name: 'Medium (1-5d)', value: data?.medium || 0 },
    { name: 'Slow (>5d)', value: data?.slow || 0 }
  ];

  return (
    <div className="w-full h-48 font-mono text-[10px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke={COLORS.secondary} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.secondary, fontSize: 10 }}
          />
          <YAxis 
            stroke={COLORS.secondary} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.secondary, fontSize: 10 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'rgba(24, 24, 27, 0.02)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-zinc-200 p-2 rounded font-mono text-[11px] shadow-sm">
                    <p className="text-zinc-500 font-bold">{payload[0].payload.name}</p>
                    <p className="text-zinc-900 mt-0.5">
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
            fill={COLORS.tertiary} 
            radius={[3, 3, 0, 0]} 
            maxBarSize={35}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DiscussionChart({ data }) {
  const chartData = [
    { name: 'None (0)', value: data?.none || 0 },
    { name: 'Low (1-5)', value: data?.low || 0 },
    { name: 'High (>5)', value: data?.high || 0 }
  ];

  return (
    <div className="w-full h-48 font-mono text-[10px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke={COLORS.secondary} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.secondary, fontSize: 10 }}
          />
          <YAxis 
            stroke={COLORS.secondary} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.secondary, fontSize: 10 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'rgba(24, 24, 27, 0.02)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-zinc-200 p-2 rounded font-mono text-[11px] shadow-sm">
                    <p className="text-zinc-500 font-bold">{payload[0].payload.name}</p>
                    <p className="text-zinc-900 mt-0.5">
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
            fill={COLORS.light} 
            radius={[3, 3, 0, 0]} 
            maxBarSize={35}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
