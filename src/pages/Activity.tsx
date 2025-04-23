"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";

// Update ActionLog interface for joined agent data
interface ActionLog {
  id: number;
  user_id: string;
  acting_agent_id: string | null;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
  agents: { // Added from join
    agent_ref_id: string;
  } | null;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);

      // Modify query to join with agents table and select agent_ref_id
      const { data, error } = await supabase
        .from('action_logs')
        .select(`
          *,
          agents ( agent_ref_id )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching action logs:', error);
        setError(`Failed to fetch logs: ${error.message}`);
        setLogs([]);
      } else {
        // Cast data to the updated ActionLog interface
        setLogs(data as ActionLog[] || []);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'PPpp');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const renderDetails = (details: Record<string, any> | null) => {
    if (!details) return '-';
    return <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(details, null, 2)}</pre>;
  }

  // Helper function to determine badge variant based on action type
  const getActionTypeBadgeVariant = (actionType: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (actionType) {
      case 'DELETE_TECHNICAL_ISSUE':
        return 'destructive';
      case 'RESOLVE_TECHNICAL_ISSUE':
        return 'default'; // Often themed green/blue
      case 'FLAG_TECHNICAL_ISSUE':
        return 'outline'; // Neutral, could customize color further if needed
      case 'SAVE_CALL_NOTES':
      case 'UPDATE_CALL_STATUS':
        return 'secondary'; // Gray background
      // Add more cases for other action types as needed
      default:
        return 'outline'; // Default for unknown types
    }
  };

  // Generate an array of placeholder rows for the skeleton loader
  const generateSkeletonRows = (count: number) => {
    return Array(count).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-12 w-full" /></TableCell>
      </TableRow>
    ));
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10 px-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <Loading text="Loading activity logs" size="md" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action Type</TableHead>
                    <TableHead>Agent Ref ID</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No activity logs found.</TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">{formatTimestamp(log.created_at)}</TableCell>
                        <TableCell>
                          {/* Use helper function to set variant */}
                          <Badge variant={getActionTypeBadgeVariant(log.action_type)}>
                            {log.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{log.agents?.agent_ref_id || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.target_table || '-'}
                        </TableCell>
                        <TableCell>{renderDetails(log.details)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
