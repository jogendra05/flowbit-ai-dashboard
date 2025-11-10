"use client";
import { Card } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Operations", value: 1000, color: "#4338ca" },
  { name: "Marketing", value: 7250, color: "#fb923c" },
  { name: "Facilities", value: 1000, color: "#fde68a" },
];

export function SpendByCategory() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6 w-full flex flex-col h-full"> {/* <- h-full & flex-col */}
      <div className="mb-6">
        <h3 className="mb-1 font-semibold">Spend by Category</h3>
        <p className="text-sm font-medium text-gray-500">Distribution of spending across different categories.</p>
      </div>

      <div className="flex-1 flex items-center justify-center mb-4"> {/* <- flex-1 */}
        <ResponsiveContainer width="100%" height="100%"> {/* <- height 100% */}
          <PieChart>
            {/* SVG filter for outer soft shadow */}
            <defs>
              <filter id="outerShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.08" />
              </filter>
            </defs>

            {/* Background pale ring + shadow (renders behind the main donut)
            <Pie
              data={[{ value: total }]}
              cx="50%"
              cy="50%"
              innerRadius={90}   // just outside the main donut outerRadius
              outerRadius={106}  // creates the outer pale ring
              paddingAngle={0}
              dataKey="value"
              isAnimationActive={false}
              startAngle={90}
              endAngle={450}
            >
              <Cell fill="#f3f4f6" />
            </Pie> */}

            {/* Main donut (thicker ring) */}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}  // smaller => thicker donut
              outerRadius={90}  // larger outer radius
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600 font-semibold">{item.name}</span>
            </div>
            <span className="font-semibold">${item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
