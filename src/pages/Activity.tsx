"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from 'date-fns';
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  Search, 
  Filter, 
  ArrowDownUp, 
  RefreshCw, 
  Activity, 
  DownloadCloud, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

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

interface ActivityStats {
  total: number;
  today: number; 
  types: Record<string, number>;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    today: 0,
    types: {}
  });
  const [page, setPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        // Modify query to join with agents table and select agent_ref_id
        const { data, error } = await supabase
          .from('action_logs')
          .select(`
            *,
            agents ( agent_ref_id )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching action logs:', error);
          setError(`Failed to fetch logs: ${error.message}`);
          setLogs([]);
        } else {
          // Cast data to the updated ActionLog interface
          const typedData = data as ActionLog[] || [];
          setLogs(typedData);
          
          // Calculate stats
          const now = new Date();
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          const today = typedData.filter(log => 
            new Date(log.created_at) >= startOfToday
          ).length;
          
          // Count action types
          const typeCounts: Record<string, number> = {};
          typedData.forEach(log => {
            typeCounts[log.action_type] = (typeCounts[log.action_type] || 0) + 1;
          });
          
          setStats({
            total: typedData.length,
            today,
            types: typeCounts
          });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred while fetching logs');
      } finally {
        setLoading(false);
      }
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
    return <pre className="text-xs whitespace-pre-wrap max-h-[150px] overflow-y-auto bg-slate-50 p-2 rounded border border-slate-200">{JSON.stringify(details, null, 2)}</pre>;
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

  // Filter logs based on search term and selected type
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || 
      log.action_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Paginate logs
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * logsPerPage, 
    page * logsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  
  const actionTypes = Object.keys(stats.types).sort();

  const handleRefresh = async () => {
    await fetchLogs();
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('action_logs')
        .select(`
          *,
          agents ( agent_ref_id )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching action logs:', error);
        setError(`Failed to fetch logs: ${error.message}`);
        setLogs([]);
      } else {
        // Cast data to the updated ActionLog interface
        const typedData = data as ActionLog[] || [];
        setLogs(typedData);
        
        // Calculate stats
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const today = typedData.filter(log => 
          new Date(log.created_at) >= startOfToday
        ).length;
        
        // Count action types
        const typeCounts: Record<string, number> = {};
        typedData.forEach(log => {
          typeCounts[log.action_type] = (typeCounts[log.action_type] || 0) + 1;
        });
        
        setStats({
          total: typedData.length,
          today,
          types: typeCounts
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while fetching logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Activity className="mr-2 h-6 w-6 text-indigo-600" />
              Activity Log
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Track all system activities and events
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline"
              className="flex items-center gap-1"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Logs</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  )}
                </div>
                <div className="p-2 bg-blue-50 rounded-full">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Logs</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                  )}
                </div>
                <div className="p-2 bg-green-50 rounded-full">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Action Types</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.types).length}</p>
                  )}
                </div>
                <div className="p-2 bg-purple-50 rounded-full">
                  <Filter className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border border-gray-200 rounded-lg shadow-lg mb-6">
          <CardHeader className="pb-0">
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>Detailed record of all activities in the system</CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    type="search"
                    placeholder="Search logs..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                )}
              </div>
              
              {loading ? (
                <Skeleton className="h-10 w-full md:w-[200px]" />
              ) : (
                <Select
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {actionTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {loading ? (
                <Skeleton className="h-10 w-[100px] md:w-auto" />
              ) : (
                <Button 
                  variant="outline" 
                  className="md:w-auto"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              
              {loading ? (
                <Skeleton className="h-10 w-[100px] md:w-auto" />
              ) : (
                <Button
                  variant="secondary"
                  className="md:w-auto"
                >
                  <DownloadCloud className="h-4 w-4 mr-1" />
                  Export
                </Button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                <p>{error}</p>
              </div>
            )}
          
            {loading ? (
              <div className="min-h-[300px] flex flex-col w-full">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead>Action Type</TableHead>
                        <TableHead>Agent Ref ID</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generateSkeletonRows(5)}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead>Action Type</TableHead>
                        <TableHead>Agent Ref ID</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No activity logs found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedLogs.map((log) => (
                          <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="whitespace-nowrap font-medium">{formatTimestamp(log.created_at)}</TableCell>
                            <TableCell>
                              <Badge variant={getActionTypeBadgeVariant(log.action_type)} className="font-semibold">
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
                </div>
                
                {/* Pagination */}
                {filteredLogs.length > logsPerPage && (
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-gray-500">
                      Showing {Math.min(filteredLogs.length, (page - 1) * logsPerPage + 1)} to {Math.min(filteredLogs.length, page * logsPerPage)} of {filteredLogs.length} entries
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm font-medium">
                        Page {page} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
