// src/app/page.tsx (hoặc file tương đương)
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { LogEntry } from '@/lib/types';
import Header from '@/components/dashboard/header';
import Metrics from '@/components/dashboard/metrics';
import Charts from '@/components/dashboard/charts';
import LogTable from '@/components/dashboard/log-table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { Home, Shield, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function DashboardPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  // isLoading chỉ dùng cho skeleton ban đầu, sẽ tắt ngay khi component được tải.
  const [isLoading, setIsLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');

  // SỬA ĐỔI CHÍNH NẰM Ở ĐÂY
  // src/app/page.tsx

  // src/app/page.tsx

  useEffect(() => {
    // Bước 1: Tải log cũ khi trang được load
    const fetchInitialLogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/logs/historical'); // Gọi API mới
        if (!response.ok) {
          throw new Error('Failed to fetch historical logs');
        }
        const historicalLogs: LogEntry[] = await response.json();
        setLogs(historicalLogs); // Cập nhật state với log cũ
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialLogs();

    // Bước 2: Mở kết nối streaming để lắng nghe log mới
    const eventSource = new EventSource('/api/logs');

    eventSource.onmessage = (event) => {
      try {
        const newLog = JSON.parse(event.data);
        setLogs((prevLogs) => [newLog, ...prevLogs]); // Thêm log mới vào đầu danh sách
      } catch (error) {
        console.error('Failed to parse incoming log event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource encountered an error:', error);
    };

    // Hàm dọn dẹp để đóng kết nối khi rời trang
    return () => {
      eventSource.close();
    };
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần

  const filteredLogs = useMemo(() => {
    if (!searchTerm) {
      return logs;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return logs.filter(log =>
      (log.transaction.client_ip && log.transaction.client_ip.toLowerCase().includes(lowercasedFilter)) ||
      (log.transaction.request.uri && log.transaction.request.uri.toLowerCase().includes(lowercasedFilter)) ||
      (log.transaction.messages && log.transaction.messages.some(msg => msg.details.ruleId && msg.details.ruleId.toLowerCase().includes(lowercasedFilter))) ||
      (log.transaction.messages && log.transaction.messages.some(msg => msg.message && msg.message.toLowerCase().includes(lowercasedFilter)))
    );
  }, [logs, searchTerm]);
  
  // Logic render loading và phần còn lại của component được giữ nguyên...
  // ... (Phần JSX của bạn không cần thay đổi)
  const renderLoadingSkeleton = () => (
    <>
        <Header title="WAF Dashboard" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[125px]" />
            <Skeleton className="h-[125px]" />
            <Skeleton className="h-[125px]" />
            <Skeleton className="h-[125px]" />
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2">
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    </>
  );

 return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
              <div className="flex items-center gap-2 p-2">
                  <Shield className="w-8 h-8 text-primary" />
                  <h1 className="text-xl font-semibold text-foreground">WAF Analyzer</h1>
              </div>
          </SidebarHeader>
          <SidebarContent>
              <SidebarMenu>
                  <SidebarMenuItem>
                      <Link href="/" passHref>
                        <SidebarMenuButton isActive>
                            <Home />
                            <span>Dashboard</span>
                        </SidebarMenuButton>
                      </Link>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                      <Link href="/domains" passHref>
                        <SidebarMenuButton>
                            <Globe />
                            <span>Domain Management</span>
                        </SidebarMenuButton>
                      </Link>
                  </SidebarMenuItem>
              </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {isLoading && logs.length === 0 ? renderLoadingSkeleton() : (
              <>
                <Header title="WAF Dashboard"/>
                <Metrics logs={filteredLogs} />
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                  <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-row items-center">
                      <div className="grid gap-2">
                        <CardTitle>Log Entries</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Browse and analyze security log events. Updates automatically.
                        </p>
                      </div>
                      <div className="ml-auto w-full max-w-sm">
                        <Input
                          placeholder="Filter by IP, URI, Rule ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <LogTable logs={filteredLogs} />
                    </CardContent>
                  </Card>
                  <Charts logs={filteredLogs} />
                </div>
              </>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
 );
}