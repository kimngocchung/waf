"use client"

import React, { useMemo } from 'react';
import type { LogEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ShieldCheck, ShieldX, Users } from 'lucide-react';

interface MetricsProps {
  logs: LogEntry[];
}

export default function Metrics({ logs }: MetricsProps) {
  const metrics = useMemo(() => {
    const totalRequests = logs.length;
    const blockedRequests = logs.filter(log => log.transaction.response.http_code === 403).length;
    const passedRequests = totalRequests - blockedRequests;
    const uniqueAttackers = new Set(logs.filter(log => log.transaction.response.http_code === 403).map(log => log.transaction.client_ip)).size;

    return { totalRequests, blockedRequests, passedRequests, uniqueAttackers };
  }, [logs]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
          <ShieldX className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.blockedRequests.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.totalRequests > 0 ? `${((metrics.blockedRequests / metrics.totalRequests) * 100).toFixed(1)}% of total` : '0% of total'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Passed Requests</CardTitle>
          <ShieldCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.passedRequests.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
             {metrics.totalRequests > 0 ? `${((metrics.passedRequests / metrics.totalRequests) * 100).toFixed(1)}% of total` : '0% of total'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Attackers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.uniqueAttackers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Unique IPs with blocked requests</p>
        </CardContent>
      </Card>
    </div>
  );
}
