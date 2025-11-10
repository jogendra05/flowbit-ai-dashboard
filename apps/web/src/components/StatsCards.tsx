"use client";
// statscards.tsx
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "./ui/card";

interface StatCardProps {
  title: string;
  subtitle?: string;
  value: string;
  change: string;
  isPositive: boolean;
  showTrendline?: boolean;
}

function StatCard({
  title,
  subtitle,
  value,
  change,
  isPositive,
  showTrendline,
}: StatCardProps) {
  return (
    <Card className="p-0">
      {/* Header: title left, subtitle right */}
      <CardHeader className="flex items-start justify-between px-6 pt-4 pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {subtitle && (
          <CardAction className="text-sm text-gray-400 self-start">
            {subtitle}
          </CardAction>
        )}
      </CardHeader>

      {/* Content: value + change (left) and trendline (right) */}
      <CardContent className="px-6 pb-6">
        <div className="flex items-center justify-between gap-4">
          {/* Left column: value and change */}
          <div className="min-w-0">
            <div className="text-2xl font-semibold text-gray-900 leading-tight">
              {value}
            </div>
            <div
              className={`mt-2 text-sm flex items-center gap-2 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              
              {/* keep same phrasing as original — you can change text here */}
              <span>{change} from last month</span>
            </div>
          </div>

          {/* Right column: small trendline chart, vertically centered */}
          {showTrendline && (
            <div className="w-12 h-8 flex-shrink-0 self-center">
              {/* <svg viewBox="0 0 80 48" className="w-full h-full">
                <polyline
                  points="0,40 20,25 40,30 60,15 80,10"
                  fill="none"
                  stroke={isPositive ? "#10b981" : "#ef4444"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg> */}
              <img src={isPositive ? "/line up.svg" : "/line down.svg"} alt="" className="w-12 h-8"/>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Spend"
        subtitle="(YTD)"
        value="€ 12.679,25"
        change="+8.2%"
        isPositive={true}
        showTrendline={true}
      />
      <StatCard
        title="Total Invoices Processed"
        value="64"
        change="+8.2%"
        isPositive={true}
        showTrendline={true}
      />
      <StatCard
        title="Documents Uploaded"
        subtitle="This Month"
        value="17"
        change="-3% less"
        isPositive={false}
        showTrendline={true}
      />
      <StatCard
        title="Average Invoice Value"
        value="€ 2.455,00"
        change="+8.2%"
        isPositive={true}
      />
    </div>
  );
} 