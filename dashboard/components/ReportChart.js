'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  text: '#737373',       // neutral-500
  barPrimary: '#ffffff', // Stark white
  barSecondary: '#a3a3a3', // neutral-400
  barMuted: '#525252',   // neutral-600
  barDark: '#262626',    // neutral-800
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
          <XAxis 
            dataKey="name" 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
          />
          <YAxis 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#141414] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-neutral-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-neutral-50 mt-0.5">
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
            fill={COLORS.barPrimary} 
            radius={[0, 0, 0, 0]} 
            maxBarSize={28}
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
    { name: 'DevOps', value: data?.devops || 0 },
    { name: 'Docs', value: data?.docs || 0 }
  ];

  return (
    <div className="w-full h-48 font-mono text-[10px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <XAxis 
            dataKey="name" 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
          />
          <YAxis 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#141414] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-neutral-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-neutral-50 mt-0.5">
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
            fill={COLORS.barSecondary} 
            radius={[0, 0, 0, 0]} 
            maxBarSize={28}
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
          <XAxis 
            dataKey="name" 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
          />
          <YAxis 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#141414] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-neutral-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-neutral-50 mt-0.5">
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
            fill={COLORS.barMuted} 
            radius={[0, 0, 0, 0]} 
            maxBarSize={28}
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
          <XAxis 
            dataKey="name" 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
          />
          <YAxis 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#141414] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-neutral-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-neutral-50 mt-0.5">
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
            fill={COLORS.barDark} 
            radius={[0, 0, 0, 0]} 
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IntentChart({ data }) {
  const chartData = [
    { name: 'Feature', value: data?.feature || 0 },
    { name: 'Bugfix', value: data?.bugfix || 0 },
    { name: 'Refactor', value: data?.refactor || 0 },
    { name: 'Chore', value: data?.chore || 0 }
  ];

  return (
    <div className="w-full h-48 font-mono text-[10px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <XAxis 
            dataKey="name" 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
          />
          <YAxis 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#141414] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-neutral-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-neutral-50 mt-0.5">
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
            fill={COLORS.barPrimary} 
            radius={[0, 0, 0, 0]} 
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskChart({ data }) {
  const chartData = [
    { name: 'Low', value: data?.low || 0 },
    { name: 'Medium', value: data?.medium || 0 },
    { name: 'High', value: data?.high || 0 },
    { name: 'Critical', value: data?.critical || 0 }
  ];

  return (
    <div className="w-full h-48 font-mono text-[10px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <XAxis 
            dataKey="name" 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
          />
          <YAxis 
            stroke={COLORS.text} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 9 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#141414] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-neutral-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-neutral-50 mt-0.5">
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
            fill={COLORS.barSecondary} 
            radius={[0, 0, 0, 0]} 
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
