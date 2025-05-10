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
  ChevronRight,
  Users,
  User,
  GitBranch
} from "lucide-react";

// Update ActionLog interface for joined user data instead of agent data
interface ActionLog {
  id: number;
  user_id: string;
  acting_agent_id: string | null; // Old field
  acting_user_id: string | null;  // New field
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
  agents: { // The join would be with agents, not users
    agent_ref_id: string;
    name: string;
    role: string;
  } | null;
  users: {
    user_ref_id: string;
    name: string;
    role: string;
  } | null;
  // Flag to distinguish between log sources
  source?: 'agent_logs' | 'user_logs' | 'action_logs';
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
  const [logSource, setLogSource] = useState<string>("both");
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    today: 0,
    types: {}
  });
  const [page, setPage] = useState(1);
  const logsPerPage = 10;

  // Enhance the fetchLogs function to include user reference IDs
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch logs from the userlogsorg table 
      const { data: logsData, error: logsError } = await supabase
        .from('userlogsorg')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (logsError) {
        console.error('Error fetching logs:', logsError);
        setError(`Failed to fetch logs: ${logsError.message}`);
        setLogs([]);
        return;
      }
      
      // Collect all user IDs to fetch from users table
      const userIds = new Set<string>();
      
      // Get regular user IDs
      logsData?.forEach(log => {
        if (log.user_id) userIds.add(log.user_id);
        // Also get auth user IDs if they exist
        if (log.details?.auth_user_id) userIds.add(log.details.auth_user_id);
      });
      
      // Convert Set to Array for the query
      const userIdArray = Array.from(userIds);
      
      // Fetch users table for all relevant IDs
      const { data: userData, error: userError } = userIdArray.length > 0 
        ? await supabase
            .from('users')
            .select('id, user_ref_id, name')
            .in('id', userIdArray)
        : { data: null, error: null };
        
      if (userError) {
        console.error('Error fetching user data:', userError);
      }
      
      // Create a mapping of user IDs to reference IDs
      const userRefMap = new Map<string, string>();
      const userNameMap = new Map<string, string>();
      
      if (userData) {
        userData.forEach(user => {
          userRefMap.set(user.id, user.user_ref_id);
          userNameMap.set(user.id, user.name);
        });
      }
      
      // Map logs to the expected format with enhanced user info
      const formattedLogs = (logsData || []).map(log => {
        // Check if we have user_ref_id for this user
        let enhancedDetails = log.details || {};
        
        // Add user_ref_id to details if available but not already present
        if (userRefMap.has(log.user_id) && !enhancedDetails.user_ref_id) {
          enhancedDetails = {
            ...enhancedDetails,
            user_ref_id: userRefMap.get(log.user_id),
            user_name: userNameMap.get(log.user_id)
          };
        }
        
        // Add auth_user_ref_id if available but not already present
        if (enhancedDetails.auth_user_id && 
            userRefMap.has(enhancedDetails.auth_user_id) && 
            !enhancedDetails.auth_user_ref_id) {
          enhancedDetails = {
            ...enhancedDetails,
            auth_user_ref_id: userRefMap.get(enhancedDetails.auth_user_id),
            auth_user_name: userNameMap.get(enhancedDetails.auth_user_id)
          };
        }
        
        return {
          id: log.id,
          user_id: log.user_id,
          action_type: log.action_type,
          details: enhancedDetails,
          created_at: log.created_at,
          // Set other fields to null to match the interface
          acting_agent_id: null,
          acting_user_id: null,
          target_table: null,
          target_id: null,
          agents: null,
          users: null,
          source: 'action_logs' as const
        };
      });
      
      setLogs(formattedLogs);
      
      // Calculate stats
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const today = formattedLogs.filter(log => 
        new Date(log.created_at) >= startOfToday
      ).length;
      
      // Count action types
      const typeCounts: Record<string, number> = {};
      formattedLogs.forEach(log => {
        typeCounts[log.action_type] = (typeCounts[log.action_type] || 0) + 1;
      });
      
      setStats({
        total: formattedLogs.length,
        today,
        types: typeCounts
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while fetching logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

    // Create a formatted version of the details for display
    const formattedDetails = { ...details };
    
    // Remove properties that are already displayed in the User column to avoid duplication
    delete formattedDetails.auth_user_id;
    delete formattedDetails.auth_user_ref_id;
    delete formattedDetails.auth_user_name;
    delete formattedDetails.user_ref_id;
    delete formattedDetails.user_name;
    
    // Format action-specific details for better readability
    if (formattedDetails.table) {
      formattedDetails.target = `${formattedDetails.table}${formattedDetails.issue_id ? ` ID: ${formattedDetails.issue_id}` : 
                                                              formattedDetails.call_id ? ` ID: ${formattedDetails.call_id}` : 
                                                              formattedDetails.profile_id ? ` ID: ${formattedDetails.profile_id}` : ''}`;
      delete formattedDetails.table;
      
      // Clean up redundant IDs
      if (formattedDetails.issue_id) delete formattedDetails.issue_id;
      if (formattedDetails.call_id) delete formattedDetails.call_id;
      if (formattedDetails.profile_id) delete formattedDetails.profile_id;
    }
    
    // Remove timestamp as it's already displayed in the timestamp column
    delete formattedDetails.timestamp;
    
    return (
      <div className="text-xs">
        <pre className="whitespace-pre-wrap max-h-[150px] overflow-y-auto bg-slate-50 p-2 rounded border border-slate-200">
          {JSON.stringify(formattedDetails, null, 2)}
        </pre>
      </div>
    );
  }

  // Helper function to determine badge variant based on action type
  const getActionTypeBadgeVariant = (actionType: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    // Normalize action type
    const type = actionType.toUpperCase();
    
    // Delete actions
    if (type.includes('DELETE')) {
      return 'destructive';
    }
    
    // Create/update/resolve actions
    if (type.includes('CREATE') || 
        type.includes('RESOLVE') ||
        type.includes('UPDATE')) {
      return 'default'; // Often themed green/blue
    }
    
    // Auth and user actions
    if (type.includes('LOGIN') || 
        type.includes('LOGOUT') ||
        type.includes('USER_SELECTED') ||
        type.includes('USER_AUTHENTICATED') ||
        type.includes('ADMIN_LOGIN')) {
      return 'secondary';
    }
    
    // Flagging and notes
    if (type.includes('FLAG') || 
        type.includes('SAVE_NOTES') ||
        type.includes('SAVE_CALL_NOTES')) {
      return 'outline';
    }
    
    // Default for unknown types
    return 'outline';
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
    
    const matchesType = selectedType === "all" || selectedType === "" || 
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

  const getSourceIcon = (source?: 'agent_logs' | 'user_logs' | 'action_logs') => {
    if (source === 'user_logs') {
      return <User className="h-3 w-3 ml-1 text-blue-500" />;
    } else if (source === 'action_logs') {
      return <Activity className="h-3 w-3 ml-1 text-green-500" />;
    }
    return <GitBranch className="h-3 w-3 ml-1 text-purple-500" />;
  };

  // Function to render user ID with copy button and show selected user if available
  const renderUserId = (log: ActionLog) => {
    const { user_id, details } = log;
    const authUserId = details?.auth_user_id;
    
    // Function to fetch and display user reference ID instead of UUID
    const getUserRefDisplay = (userId: string, isAdmin: boolean = false) => {
      // Get appropriate data based on whether it's the actual user or auth admin
      let userRefId, userName;
      
      if (isAdmin) {
        userRefId = details?.auth_user_ref_id || '';
        userName = details?.auth_user_name || '';
      } else {
        userRefId = details?.user_ref_id || '';
        userName = details?.user_name || '';
      }
      
      const copyToClipboard = () => {
        navigator.clipboard.writeText(userId);
      };

      // Format for better display
      const formattedId = userRefId || (userId ? userId.substring(0, 8) + '...' : 'Unknown');
      
      return (
        <div className="flex items-center space-x-1 mb-1">
          <span className="text-gray-600 font-medium">{isAdmin ? "Admin:" : "User:"}</span>
          <Badge 
            variant={isAdmin ? "secondary" : "outline"} 
            className={`font-mono text-xs ${userRefId ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
          >
            {formattedId}
          </Badge>
          {userName && (
            <span className="text-xs text-gray-600 italic">
              ({userName})
            </span>
          )}
          <button 
            onClick={copyToClipboard}
            className="text-gray-500 hover:text-gray-700 ml-1"
            title={`Copy ${isAdmin ? 'Admin' : 'User'} ID: ${userId}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      );
    };
    
    return (
      <div className="flex flex-col gap-0.5 text-xs">
        {/* Show the actual user whose action is logged */}
        {getUserRefDisplay(user_id, false)}
        
        {/* Show the admin user who performed the action */}
        {authUserId && authUserId !== user_id && getUserRefDisplay(authUserId, true)}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-white">
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
                size="sm" 
                className="mr-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <DownloadCloud className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Activity className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Activities</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {loading ? <Skeleton className="h-8 w-16" /> : stats.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Today's Activities</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {loading ? <Skeleton className="h-8 w-16" /> : stats.today.toLocaleString()}
                      </p>
                      {stats.total > 0 && stats.today > 0 && (
                        <p className="ml-2 text-sm text-gray-500">
                          ({Math.round((stats.today / stats.total) * 100)}%)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Filter className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Action Types</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {loading ? <Skeleton className="h-8 w-16" /> : Object.keys(stats.types).length.toLocaleString()}
                      </p>
                      {!loading && Object.keys(stats.types).length > 0 && (
                        <p className="ml-2 text-sm text-gray-500">
                          (Most common: {Object.entries(stats.types)
                            .sort((a, b) => b[1] - a[1])
                            .map(([type]) => type.replace(/_/g, ' ').toLowerCase())
                            [0]})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>A comprehensive record of all user activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search logs..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-1/3">
                  <Select 
                    value={selectedType || "all"}
                    onValueChange={setSelectedType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Action Types</SelectItem>
                      {actionTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead>Action Type</TableHead>
                      <TableHead className="hidden md:table-cell">User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      generateSkeletonRows(5)
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-red-500 p-4">
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : paginatedLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center p-4">
                          No activity logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedLogs.map((log) => (
                        <TableRow key={`${log.source || 'unknown'}-${log.id}`}>
                          <TableCell className="text-xs text-gray-500">
                            <div className="flex items-center">
                              {formatTimestamp(log.created_at)}
                              {getSourceIcon(log.source)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getActionTypeBadgeVariant(log.action_type)} 
                              className="font-normal"
                            >
                              {log.action_type.replace(/_/g, ' ').toLowerCase()
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {renderUserId(log)}
                          </TableCell>
                          <TableCell>
                            {renderDetails(log.details)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center md:justify-between mt-6">
                  <p className="text-sm text-gray-500 hidden md:block">
                    Showing {Math.min(filteredLogs.length, 1 + (page - 1) * logsPerPage)} to {Math.min(filteredLogs.length, page * logsPerPage)} of {filteredLogs.length} logs
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
