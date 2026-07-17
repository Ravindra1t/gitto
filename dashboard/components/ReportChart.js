'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  text: '#64748b', // slate-500
};

// Global Gradients Component to define gradients once or inside each chart to keep them self-contained
function ChartGradients() {
  return (
    <defs>
      {/* Cyan to Blue */}
      <linearGradient id="smallGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      {/* Amber to Orange */}
      <linearGradient id="mediumGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
      {/* Fuchsia to Purple */}
      <linearGradient id="largeGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d946ef" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
      {/* Green to Forest Green */}
      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#16a34a" />
      </linearGradient>
      {/* Purple to Indigo */}
      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      {/* Cyan to Teal */}
      <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      {/* Pink to Rose */}
      <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#e11d48" />
      </linearGradient>
      {/* Red to Dark Red */}
      <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
      {/* Yellow to Amber */}
      <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      {/* Gray to Charcoal */}
      <linearGradient id="grayGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
  );
}

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
          <ChartGradients />
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
                  <div className="bg-[#141415] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-slate-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-slate-50 mt-0.5">
                      Share: {payload[0].value.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" maxBarSize={28}>
            {chartData.map((entry, index) => {
              let fill = "url(#smallGrad)";
              if (index === 1) fill = "url(#mediumGrad)";
              if (index === 2) fill = "url(#largeGrad)";
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
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
          <ChartGradients />
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
                  <div className="bg-[#141415] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-slate-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-slate-50 mt-0.5">
                      Share: {payload[0].value.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" maxBarSize={28}>
            {chartData.map((entry, index) => {
              let fill = "url(#greenGrad)";
              if (index === 1) fill = "url(#purpleGrad)";
              if (index === 2) fill = "url(#cyanGrad)";
              if (index === 3) fill = "url(#pinkGrad)";
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
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
          <ChartGradients />
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
                  <div className="bg-[#141415] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-slate-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-slate-50 mt-0.5">
                      Share: {payload[0].value.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" maxBarSize={28}>
            {chartData.map((entry, index) => {
              let fill = "url(#greenGrad)";
              if (index === 1) fill = "url(#smallGrad)";
              if (index === 2) fill = "url(#redGrad)";
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
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
          <ChartGradients />
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
                  <div className="bg-[#141415] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-slate-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-slate-50 mt-0.5">
                      Share: {payload[0].value.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" maxBarSize={28}>
            {chartData.map((entry, index) => {
              let fill = "url(#grayGrad)";
              if (index === 1) fill = "url(#mediumGrad)";
              if (index === 2) fill = "url(#largeGrad)";
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
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
          <ChartGradients />
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
                  <div className="bg-[#141415] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-slate-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-slate-50 mt-0.5">
                      Share: {payload[0].value.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" maxBarSize={28}>
            {chartData.map((entry, index) => {
              let fill = "url(#smallGrad)";
              if (index === 1) fill = "url(#redGrad)";
              if (index === 2) fill = "url(#purpleGrad)";
              if (index === 3) fill = "url(#grayGrad)";
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
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
          <ChartGradients />
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
                  <div className="bg-[#141415] border border-white/10 p-2.5 rounded-none font-mono text-[10px] shadow-2xl">
                    <p className="text-slate-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                    <p className="text-slate-50 mt-0.5">
                      Share: {payload[0].value.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" maxBarSize={28}>
            {chartData.map((entry, index) => {
              let fill = "url(#greenGrad)";
              if (index === 1) fill = "url(#yellowGrad)";
              if (index === 2) fill = "url(#mediumGrad)";
              if (index === 3) fill = "url(#redGrad)";
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
