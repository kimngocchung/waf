
"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { Home, Shield, Globe, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import Header from '@/components/dashboard/header';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function DomainManagementPage() {
    const [domains, setDomains] = useState<string[]>([]);
    const [newDomain, setNewDomain] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const { toast } = useToast();

    const fetchDomains = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/domains');
            if (!response.ok) {
                throw new Error('Failed to fetch domains');
            }
            const data = await response.json();
            setDomains(data.domains);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error fetching domains',
                description: (error as Error).message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        // Updated regex to be more permissive for hostnames like 'localhost'
        if (!newDomain || !/^[a-zA-Z0-9.-]+$/.test(newDomain)) {
             toast({
                variant: 'destructive',
                title: 'Invalid Domain',
                description: 'Please enter a valid domain name.',
            });
            return;
        }
        setIsAdding(true);
        try {
            const response = await fetch('/api/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: newDomain }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add domain');
            }
            toast({
                title: 'Domain Added',
                description: `Successfully added ${newDomain} to the allowlist.`,
            });
            setNewDomain('');
            fetchDomains(); // Re-fetch to update the list
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error adding domain',
                description: (error as Error).message,
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteDomain = async (domainToDelete: string) => {
        try {
            const response = await fetch('/api/domains', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: domainToDelete }),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete domain');
            }
            toast({
                title: 'Domain Deleted',
                description: `Successfully removed ${domainToDelete} from the allowlist.`,
            });
            fetchDomains(); // Re-fetch to update the list
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Error deleting domain',
                description: (error as Error).message,
            });
        }
    };

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
                            <SidebarMenuButton>
                                <Home />
                                <span>Dashboard</span>
                            </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                             <Link href="/domains" passHref>
                            <SidebarMenuButton isActive>
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
                     <Header title="Domain Management"/>
                     <Card>
                        <CardHeader>
                            <CardTitle>Allowed Domains</CardTitle>
                            <CardDescription>
                                Only requests to these domains will be processed by the WAF. All other domains will be blocked.
                                Changes may require a moment to propagate to the WAF.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddDomain} className="flex items-center gap-2 mb-6">
                                <Input 
                                    placeholder="e.g., example.com"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    disabled={isAdding}
                                />
                                <Button type="submit" disabled={isAdding}>
                                    {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                    Add Domain
                                </Button>
                            </form>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Domain</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={2} className="h-24 text-center">
                                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                                </TableCell>
                                            </TableRow>
                                        ) : domains.length > 0 ? (
                                            domains.map(domain => (
                                                <TableRow key={domain}>
                                                    <TableCell className="font-mono">{domain}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleDeleteDomain(domain)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="h-24 text-center">
                                                    No domains configured. Add a domain to get started.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                     </Card>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
