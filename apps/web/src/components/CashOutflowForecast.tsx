"use client";

import React, { useMemo } from "react";
import { Card } from "./ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

// include same max so background uses full height (0-100 scale)
const data = [
  { name: "0-7 days", value: 45 },
  { name: "8-30 days", value: 67 },
  { name: "31-60 days", value: 30 },
  { name: "60+ days", value: 75 },
];

export function CashOutflowForecast() {
  const yDomain = useMemo(() => [0, 100], []);

  // returns a darker color for larger values. Tweak as you like.
  const getBarColor = (v: number) => {
    // simple linear interpolation on lightness for an HSL navy color
    // v=0 -> light; v=100 -> dark
    const lightness = 70 - (v * 0.45); // maps 0..100 -> 70..25
    return `hsl(240 60% ${lightness}%)`;
  };

  return (
    <Card className="p-6 w-full flex flex-col h-full">
      <div className="mb-6">
        <h3 className="mb-1 font-semibold">Cash Outflow Forecast</h3>
        <p className="text-sm text-gray-500">Expected payment obligations grouped by due date ranges.</p>
      </div>

      <div className="flex-1 h-64"> {/* give the chart a sensible min height */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />

            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `€${value}k`}
              domain={yDomain}
            />

            <Tooltip formatter={(value: number) => `€${value}k`} cursor={{ fill: 'transparent' }} />

            {/*
              Use Recharts `background` prop to draw the full-height light track.
              Then draw the value bar on top and color each bar dynamically with <Cell>.
            */}
            <Bar
              dataKey="value"
              fill="#111827" /* fallback */
              radius={[8, 8, 0, 0]}
              maxBarSize={56}
              background={{ fill: '#eef2f7', radius: 8 }}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* prevent browser / recharts hover shadows (if any) */}
      <style jsx global>{`
        .recharts-bar-rectangle {
          filter: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </Card>
  );
}
