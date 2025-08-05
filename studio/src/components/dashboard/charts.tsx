"use client";

import React, { useMemo } from 'react';
import type { LogEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface ChartsProps {
  logs: LogEntry[];
}

const chartConfigStatus = {
  passed: { label: 'Passed', color: 'hsl(var(--chart-1))' },
  blocked: { label: 'Blocked', color: 'hsl(var(--chart-2))' },
};

export default function Charts({ logs }: ChartsProps) {
  const { statusData, topUrisData } = useMemo(() => {
    const blockedRequests = logs.filter(log => log.transaction.response.http_code === 403);
    const passedRequests = logs.length - blockedRequests.length;

    const statusData = [
      { name: 'Passed', value: passedRequests, fill: 'var(--color-passed)' },
      { name: 'Blocked', value: blockedRequests.length, fill: 'var(--color-blocked)' },
    ];
    
    const uriCounts = blockedRequests.reduce((acc, log) => {
      const uri = log.transaction.request.uri;
      acc[uri] = (acc[uri] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topUrisData = Object.entries(uriCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, count: value }));

    return { statusData, topUrisData };
  }, [logs]);

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
      <Card>
        <CardHeader>
          <CardTitle>Request Status</CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          <ChartContainer
            config={chartConfigStatus}
            className="mx-auto aspect-square h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Attacked URIs</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ count: { label: "Count", color: "hsl(var(--chart-1))" } }} className="h-[250px] w-full">
            <BarChart
              data={topUrisData}
              layout="vertical"
              margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                width={100}
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
