"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client'; // Assuming supabase client path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns'; // For date formatting

// Define the structure of an action log based on the SQL schema
interface ActionLog {
  id: number;
  user_id: string;
  acting_agent_id: string | null;
  action_type: string;
  target_table: string | null;
  target_id: string | null; // Changed to string to match UUID retrieval
  details: Record<string, any> | null; // Assuming JSONB maps to an object
  created_at: string; // Comes as ISO string
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('action_logs')
        .select('*') // Select all columns for now
        .order('created_at', { ascending: false }) // Show newest logs first
        .limit(100); // Limit results for performance

      if (error) {
        console.error('Error fetching action logs:', error);
        setError(`Failed to fetch logs: ${error.message}`);
        setLogs([]);
      } else {
        setLogs(data || []);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'PPpp'); // e.g., Aug 17, 2023, 5:09:11 PM
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const renderDetails = (details: Record<string, any> | null) => {
    if (!details) return '-';
    // Basic rendering, could be more sophisticated
    return <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(details, null, 2)}</pre>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading activity logs...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action Type</TableHead>
                  <TableHead>Agent ID</TableHead>
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
                        <Badge variant="outline">{log.action_type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.acting_agent_id || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.target_table ? `${log.target_table} (${log.target_id || 'N/A'})` : '-'}
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
  );
} 