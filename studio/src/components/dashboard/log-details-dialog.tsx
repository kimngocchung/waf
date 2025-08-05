"use client";

import React, { useState } from 'react';
import type { LogEntry } from '@/lib/types';
import type { AnalyzeLogMessageOutput } from '@/ai/flows/analyze-log-messages';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getAttackSignature } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Bot, Sparkles, Loader, Info, ShieldAlert, Wrench } from 'lucide-react';

interface LogDetailsDialogProps {
  log: LogEntry | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LogDetailsDialog({ log, isOpen, onOpenChange }: LogDetailsDialogProps) {
  const [analysis, setAnalysis] = useState<AnalyzeLogMessageOutput['analysis'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!log || !log.transaction.messages[0]) return;
    setIsLoading(true);
    setAnalysis(null);
    // We stringify the entire message array to give the AI more context.
    const result = await getAttackSignature(JSON.stringify(log.transaction.messages));
    setAnalysis(result.analysis);
    setIsLoading(false);
  };
  
  const onDialogStateChange = (open: boolean) => {
    if (!open) {
      setAnalysis(null);
      setIsLoading(false);
    }
    onOpenChange(open);
  }

  if (!log) return null;

  const { transaction } = log;
  const message = transaction.messages.find(m => m.details.ruleId && !m.details.ruleId.startsWith('949')) || transaction.messages[0];

  return (
    <Dialog open={isOpen} onOpenChange={onDialogStateChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
          <DialogDescription>
            Detailed view of log entry <span className="font-mono">{transaction.unique_id}</span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Transaction Info</h3>
                <p className="text-sm"><strong className="text-muted-foreground">Timestamp:</strong> {new Date(transaction.time_stamp).toLocaleString()}</p>
                <p className="text-sm"><strong className="text-muted-foreground">Client IP:</strong> <span className="font-mono">{transaction.client_ip}</span></p>
                <p className="text-sm"><strong className="text-muted-foreground">Host IP:</strong> <span className="font-mono">{transaction.host_ip}:{transaction.host_port}</span></p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Request</h3>
                <p className="text-sm"><strong className="text-muted-foreground">Method:</strong> <Badge variant="outline">{transaction.request.method}</Badge></p>
                <p className="text-sm"><strong className="text-muted-foreground">URI:</strong> <span className="font-mono break-all">{transaction.request.headers.Host}{transaction.request.uri}</span></p>
                <p className="text-sm"><strong className="text-muted-foreground">HTTP Version:</strong> {transaction.request.http_version}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">User Agent</h3>
              <p className="text-sm font-mono bg-muted p-2 rounded-md">{transaction.request.headers['User-Agent']}</p>
            </div>
            {message && (
              <>
                <div>
                    <h3 className="font-semibold text-foreground mb-2">WAF Message</h3>
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>{message.message}</AlertTitle>
                        <AlertDescription>
                        <p className="font-mono text-xs mt-2 p-2 bg-muted rounded-md">{message.details.match}</p>
                        <div className="mt-2 text-xs">
                            <strong>Rule ID:</strong> <Badge variant="secondary">{message.details.ruleId}</Badge> | <strong>Severity:</strong> <Badge variant="destructive">{message.details.severity}</Badge>
                        </div>
                        </AlertDescription>
                    </Alert>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary"/> AI Analysis</h3>
                    <div className="flex flex-col gap-4">
                        <Button onClick={handleAnalyze} disabled={isLoading}>
                            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                            {isLoading ? 'Analyzing...' : 'Analyze Attack with AI'}
                        </Button>
                        {analysis && (
                            <div className="space-y-4">
                               <Alert variant="default" className="border-primary/50">
                                   <ShieldAlert className="h-4 w-4" />
                                   <AlertTitle>{analysis.attackType}</AlertTitle>
                                   <AlertDescription>
                                       {analysis.description}
                                   </AlertDescription>
                               </Alert>
                               <Alert variant="default" className="border-green-500/50">
                                   <Wrench className="h-4 w-4" />
                                   <AlertTitle>Recommendation</AlertTitle>
                                   <AlertDescription>
                                       {analysis.recommendation}
                                   </AlertDescription>
                               </Alert>
                            </div>
                        )}
                    </div>
                </div>
              </>
            )}
            
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
