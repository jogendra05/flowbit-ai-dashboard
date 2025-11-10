"use client";

import React, { useMemo, useState } from "react";
import { Card } from "./ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const vendors = [
  { name: "AcmeCorp", percentage: 95 },
  { name: "Tech Solutions", percentage: 85 },
  { name: "PrimeVendors", percentage: 75 },
  { name: "DataServices", percentage: 60 },
  { name: "OmegaLtd", percentage: 65 },
];

export function SpendByVendor({ scaleMax = 48000 }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = useMemo(
    () =>
      vendors.map((v) => ({
        name: v.name,
        percentage: v.percentage,
        value: (v.percentage / 100) * scaleMax,
      })),
    [scaleMax]
  );

  const xTicks = [0, 15000, 30000, 45000].filter((t) => t <= scaleMax);
  const euroFmt = (val: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(val);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-100">
        <div className="font-medium text-gray-700">{item.name}</div>
        <div className="mt-2 text-sm text-gray-500">
          Vendor Spend:{" "}
          <span className="font-semibold text-indigo-600">{euroFmt(item.value)}</span>
        </div>
      </div>
    );
  };

  const baseFill = "#BDBCD6";
  const highlightFill = "#1B1464";

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="mb-1 font-semibold text-gray-900">Spend by Vendor (Top 10)</h3>
        <p className="text-sm text-gray-500">
          Vendor spend with cumulative percentage distribution.
        </p>
      </div>

      <div style={{ height: 320 }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 8, right: 24, bottom: 24, left: 0 }}
          >
            <XAxis
              type="number"
              domain={[0, scaleMax]}
              ticks={xTicks}
              tickFormatter={(v) => (v >= 1000 ? `€${Math.round(v / 1000)}k` : `€${v}`)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#374151", fontSize: 14 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="value"
              barSize={28}
              radius={[8, 8, 8, 8]}
              background={{ fill: "#E9ECF1D1", radius: 8 }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === activeIndex ? highlightFill : baseFill}
                  cursor="pointer"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  stroke={index === activeIndex ? "rgba(0,0,0,0.06)" : "transparent"}
                  strokeWidth={index === activeIndex ? 6 : 0}
                  style={{
                    transition: "all 150ms ease",
                    filter:
                      index === activeIndex
                        ? "drop-shadow(0 6px 12px rgba(30,41,59,0.12))"
                        : undefined,
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
