"use client"
import React, { useState } from "react";
import { Card } from "./ui/card";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { month: "Jan", invoices: 8, spend: 5 },
  { month: "Feb", invoices: 65, spend: 58 },
  { month: "Mar", invoices: 38, spend: 32 },
  { month: "Apr", invoices: 45, spend: 40 },
  { month: "May", invoices: 28, spend: 25 },
  { month: "Jun", invoices: 18, spend: 15 },
  { month: "Jul", invoices: 50, spend: 45 },
  { month: "Aug", invoices: 42, spend: 38 },
  { month: "Sep", invoices: 38, spend: 33 },
  { month: "Oct", invoices: 47, spend: 35 },
  { month: "Nov", invoices: 35, spend: 30 },
  { month: "Dec", invoices: 15, spend: 12 },
].map((d) => ({ ...d, bg: 80 })); // bg makes full-height bars

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;

  const spendItem = payload.find((p: any) => p.dataKey === "spend");
  const invoicesItem = payload.find((p: any) => p.dataKey === "invoices");

  const invoicesVal = invoicesItem?.value ?? 0;
  const spendVal = (spendItem?.value ?? 0) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
      <div className="mb-2 font-medium">{label} 2025</div>
      <div className="space-y-1">
        <div className="text-sm text-gray-600 flex justify-between gap-8">
          <span>Invoice count:</span>
          <span className="text-indigo-600">{invoicesVal}</span>
        </div>
        <div className="text-sm text-gray-600 flex justify-between gap-8">
          <span>Total Spend:</span>
          <span className="text-indigo-600">€ {spendVal.toLocaleString("de-DE")}</span>
        </div>
      </div>
    </div>
  );
};

export default function InvoiceVolumeChart() {
  // track which bar (month) is hovered; null = none
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="mb-1 font-semibold">Invoice Volume + Value Trend</h3>
        <p className="text-sm text-gray-500">Invoice count and total spend over 12 months.</p>
      </div>

      {/* Inline CSS to control SVG hover + active state */}
      <style>{`
        /* base transition for all bars */
        .bg-bar rect,
        .bg-bar path {
          transition: transform 180ms ease, filter 180ms ease, opacity 180ms ease;
          transform-origin: center bottom;
        }

        /* hover effect when using native hover (still works) */
        .bg-bar:hover rect,
        .bg-bar:hover path {
          filter: brightness(0.75);
        }

        /* explicit active class set from React state */
        .bg-bar--active rect,
        .bg-bar--active path {
          /* lift the bar slightly and make it look stronger */
          transform: translateY(-6px) scaleY(1.03);
          filter: drop-shadow(0 6px 12px rgba(67,56,202,0.12)) brightness(0.92);
        }

        /* make cursor pointer on bars */
        .bg-bar,
        .bg-bar--active {
          cursor: pointer;
        }

        /* subtle focus outline (for keyboard / accessibility if needed) */
        .bg-bar:focus rect,
        .bg-bar--active:focus rect {
          outline: none;
          filter: brightness(0.88);
        }
      `}</style>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eef2ff" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#eef2ff" stopOpacity={0.45} />
            </linearGradient>

            <linearGradient id="barGradientDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c7d2fe" stopOpacity={1} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.9} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 80]} />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e0e7ff", strokeWidth: 2, strokeDasharray: "5 5" }} />

          {/* Full-height background bars. We add onMouse handlers to each Cell so we can set an active state. */}
          <Bar dataKey="bg" barSize={44} radius={[10, 10, 10, 10]} isAnimationActive={false}>
            {data.map((_, index) => {
              const isActive = hoveredIndex === index;
              return (
                <Cell
                  key={`cell-${index}`}
                  className={`bg-bar ${isActive ? "bg-bar--active" : ""}`}
                  fill={isActive ? "url(#barGradientDark)" : "url(#barGradient)"}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  // keyboard accessibility: allow focus/blur to trigger the same visual state
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                />
              );
            })}
          </Bar>

          {/* Foreground lines. When a bar is hovered we slightly emphasise the related points by increasing dot size. */}
          <Line
            type="monotone"
            dataKey="spend"
            stroke="#c7d2fe"
            strokeWidth={3}
            dot={false}
            activeDot={(props: any) => {
              // when hoveredIndex is set, only show the active dot for that index
              const { cx, cy, index } = props;
              if (hoveredIndex === null || hoveredIndex !== index) return <></>;
              return (
                <circle cx={cx} cy={cy} r={6} fill="#c7d2fe" stroke="#fff" strokeWidth={2} />
              );
            }}
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="invoices"
            stroke="#4338ca"
            strokeWidth={3}
            dot={false}
            activeDot={(props: any) => {
              const { cx, cy, index } = props;
              if (hoveredIndex === null || hoveredIndex !== index) return <></>;
              return (
                <circle cx={cx} cy={cy} r={6} fill="#4338ca" stroke="#fff" strokeWidth={2} />
              );
            }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
