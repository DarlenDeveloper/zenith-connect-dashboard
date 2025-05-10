import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Search, ChevronRight, Edit, Trash2, Copy, CheckCircle, XCircle, Clock, ArrowLeft, AlertCircle, BarChart, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { logUserAction, LogActions } from "@/utils/user-logs";
import { useUser } from "@/contexts/UserContext";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import NoUserSelected from "@/components/NoUserSelected";

interface TechnicalIssue {
  id: string;
  call_id: string;
  title: string | null;
  description: string | null;
  status: string;
  priority: string;
  reported_by: string | null;
  dateReported?: string;
  created_at: string;
  resolution: string | null;
}

const Technical = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedUser, userRequired } = useUser();
  const [flaggedIssues, setFlaggedIssues] = useState<TechnicalIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedIssueId, setHighlightedIssueId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // If agent selection is required but none is selected, show the NoUserSelected component
  if (userRequired && !selectedUser) {
    return <NoUserSelected />;
  }

  const fetchTechnicalIssues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('technical_issues')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFlaggedIssues(data as TechnicalIssue[]);

    } catch (error: any) {
      console.error("Error fetching technical issues:", error);
      toast.error(`Failed to load technical issues: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchTechnicalIssues();

    const searchParams = new URLSearchParams(location.search);
    const issueId = searchParams.get('techIssueId');
    if (issueId) {
      setHighlightedIssueId(issueId);
      navigate('/technical', { replace: true });
      toast.info("New technical issue flagged. Highlighted below.");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const techIssuesSubscription = supabase
      .channel('custom-tech-issues-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'technical_issues' },
        (payload) => {
          console.log('Tech issue change received!', payload);
          fetchTechnicalIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(techIssuesSubscription);
    };
  }, [user]);

  const handleResolveIssue = async (issueId: string) => {
    try {
      const { error } = await supabase
        .from('technical_issues')
        .update({
          status: "Resolved",
          resolution: "Issue marked as resolved by user.",
          resolved_at: new Date().toISOString()
        })
        .eq('id', issueId);

      if (error) throw error;
      toast.success("Issue marked as resolved");
      if (issueId === highlightedIssueId) setHighlightedIssueId(null);
      
      await logUserAction(
        LogActions.RESOLVE_TECHNICAL_ISSUE, 
        { 
          issue_id: issueId,
          status: 'resolved',
          table: 'technical_issues'
        }
      );
    } catch (error: any) {
      console.error("Error resolving issue:", error);
      toast.error(`Failed to resolve issue: ${error.message}`);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    try {
      const { error } = await supabase
        .from('technical_issues')
        .delete()
        .eq('id', issueId);

      if (error) throw error;
      toast.success("Issue removed successfully");
      if (issueId === highlightedIssueId) setHighlightedIssueId(null);
      
      await logUserAction(
        LogActions.DELETE_TECHNICAL_ISSUE, 
        { 
          issue_id: issueId,
          status: 'deleted',
          table: 'technical_issues'
        }
      );
    } catch (error: any) {
      console.error("Error deleting issue:", error);
      toast.error(`Failed to delete issue: ${error.message}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: true
      }).format(date);
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Count by status
  const openIssuesCount = flaggedIssues.filter(issue => issue.status === "Open").length;
  const resolvedIssuesCount = flaggedIssues.filter(issue => issue.status === "Resolved").length;
  const highPriorityCount = flaggedIssues.filter(issue => issue.priority === "High").length;

  // Filter and search issues
  const filteredIssues = flaggedIssues.filter(issue => {
    const matchesSearch = searchTerm === "" || 
      (issue.title && issue.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <header className="h-16 shrink-0 bg-white flex items-center px-6 justify-between border-b border-gray-100 shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Technical Support Issues</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/call-history')} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Call History
          </Button>
        </header>

        <main className="flex-1 overflow-auto bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Open Issues</p>
                  <p className="text-3xl font-bold">{openIssuesCount}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium mb-1">High Priority</p>
                  <p className="text-3xl font-bold">{highPriorityCount}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">Resolved Issues</p>
                  <p className="text-3xl font-bold">{resolvedIssuesCount}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <Loading text="Loading technical issues" size="md" />
            </div>
          ) : flaggedIssues.length === 0 ? (
            <Card className="bg-white rounded-xl shadow-lg p-8 text-center max-w-3xl mx-auto border-none">
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-full p-4 mb-4">
                  <AlertTriangle className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-medium text-gray-800 mb-2">No Technical Issues</h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  There are currently no calls flagged for technical review. 
                  When a user flags a call with technical issues, it will appear here.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/call-history')}>
                  Go to Call History
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="bg-white rounded-xl shadow-md overflow-hidden border-none">
              <CardHeader className="pb-0">
                <CardTitle>Technical Issues</CardTitle>
                <CardDescription>Manage and resolve technical issues reported by users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center pt-4 pb-5">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search issues..."
                      className="pl-9 pr-4 py-2 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant={statusFilter === "all" ? "default" : "outline"}
                      size="sm"
                      className={statusFilter === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      onClick={() => setStatusFilter("all")}
                    >
                      All
                    </Button>
                    <Button 
                      variant={statusFilter === "Open" ? "default" : "outline"}
                      size="sm"
                      className={statusFilter === "Open" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      onClick={() => setStatusFilter("Open")}
                    >
                      Open
                    </Button>
                    <Button 
                      variant={statusFilter === "Resolved" ? "default" : "outline"}
                      size="sm"
                      className={statusFilter === "Resolved" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      onClick={() => setStatusFilter("Resolved")}
                    >
                      Resolved
                    </Button>
                  </div>
                </div>
                
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No issues match your search criteria.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredIssues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className={`p-4 md:p-6 hover:bg-gray-50 transition-colors rounded-md ${
                          highlightedIssueId === issue.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                          <div className="flex-1">
                            <h3 className="font-medium flex flex-wrap items-center gap-2 text-gray-900">
                              <span>{issue.title || `Issue ID: ${issue.id}`}</span>
                              <Badge 
                                variant={issue.status === "Resolved" ? "default" : "destructive"}
                                className={
                                  issue.status === "Resolved" 
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-none" 
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-none"
                                }
                              >
                                {issue.status}
                              </Badge>
                              <Badge 
                                variant={issue.priority === "High" ? "destructive" : "secondary"}
                                className={
                                  issue.priority === "High" 
                                    ? "bg-black bg-opacity-10 text-gray-800 hover:bg-opacity-20 border-none"
                                    : "bg-blue-100 text-blue-800 hover:bg-blue-200 border-none"
                                }
                              >
                                {issue.priority} Priority
                              </Badge>
                            </h3>
                            <p className="text-sm text-gray-700 mt-1 mb-2 max-w-4xl">{issue.description || "No description provided."}</p>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span>Call ID: {issue.call_id}</span>
                              <span>Reported: {formatDate(issue.created_at)}</span>
                            </div>
                            {issue.status === 'Resolved' && issue.resolution && (
                              <div className="text-sm mt-3 bg-gray-50 p-3 rounded-md border border-gray-100 max-w-4xl">
                                <p className="font-medium text-gray-700 mb-1">Resolution:</p>
                                <p className="text-gray-600">{issue.resolution}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex lg:flex-col items-center gap-2 mt-3 lg:mt-0 ml-0 lg:ml-2 flex-shrink-0">
                            {issue.status !== 'Resolved' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                onClick={() => handleResolveIssue(issue.id)}
                                title="Mark as Resolved"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolve
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                              onClick={() => handleDeleteIssue(issue.id)}
                              title="Delete this issue"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Technical;
