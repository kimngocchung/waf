"use client";

import React, { useState } from 'react';
import type { LogEntry, LogMessage } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LogDetailsDialog from './log-details-dialog';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface LogTableProps {
  logs: LogEntry[];
}

const ROWS_PER_PAGE = 10;

export default function LogTable({ logs }: LogTableProps) {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(logs.length / ROWS_PER_PAGE);
  const paginatedLogs = logs.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleViewDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadge = (httpCode: number) => {
    // Only consider 403 as actively blocked by the WAF
    if (httpCode === 403) {
      return <Badge variant="destructive">Blocked</Badge>;
    }
    if (httpCode >= 200 && httpCode < 300) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Passed</Badge>;
    }
    // Other client/server errors
    return <Badge variant="outline">Other</Badge>;
  };
  
  const getRuleId = (messages: LogMessage[]): string => {
    if (!messages || messages.length === 0) {
      return 'N/A';
    }
    // Prioritize showing the most specific attack rule, not the generic blocking rule.
    const specificAttackRule = [...messages]
        .reverse()
        .find(msg => msg.details?.ruleId && !msg.details.ruleId.startsWith('949'));

    if (specificAttackRule) {
        return specificAttackRule.details.ruleId;
    }

    // Fallback to the last rule if no specific attack rule is found
    const lastMessageWithRuleId = [...messages].reverse().find(msg => msg.details?.ruleId);
    return lastMessageWithRuleId?.details?.ruleId || 'N/A';
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Client IP</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>URI</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rule ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <TableRow key={log.transaction.unique_id}>
                  <TableCell className="text-xs">{new Date(log.transaction.time_stamp).toLocaleString()}</TableCell>
                  <TableCell className="font-mono">{log.transaction.client_ip}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.transaction.request.method}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate font-mono">{log.transaction.request.headers.Host}{log.transaction.request.uri}</TableCell>
                  <TableCell>{getStatusBadge(log.transaction.response.http_code)}</TableCell>
                  <TableCell>{getRuleId(log.transaction.messages)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(log)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <LogDetailsDialog
        log={selectedLog}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
