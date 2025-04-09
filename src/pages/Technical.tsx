import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Search, ChevronRight, Edit, Trash2, Copy, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

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
  const [flaggedIssues, setFlaggedIssues] = useState<TechnicalIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedIssueId, setHighlightedIssueId] = useState<string | null>(null);

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

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-gray-500" />
            <h1 className="text-xl font-medium">Technical Support Issues</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/call-history')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Call History
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#f9f9f9] p-6">
          {loading ? (
            <div className="text-center p-8">
              <p>Loading technical issues...</p>
            </div>
          ) : flaggedIssues.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-800 mb-2">No Technical Issues</h2>
              <p className="text-gray-600 mb-4">
                There are currently no calls flagged for technical review. 
                When an agent flags a call with technical issues, it will appear here.
              </p>
              <Button variant="outline" onClick={() => navigate('/call-history')}>
                Go to Call History
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="font-medium">Flagged Technical Issues</h2>
                <p className="text-sm text-gray-500">{flaggedIssues.length} issues found</p>
              </div>

              <div className="divide-y divide-gray-200">
                {flaggedIssues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      highlightedIssueId === issue.id ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium flex items-center flex-wrap gap-2">
                          <span>{issue.title || `Issue ID: ${issue.id}`}</span>
                          <Badge 
                            variant={issue.status === "Resolved" ? "default" : issue.status === "Open" ? "destructive" : "secondary"}
                            className={issue.status === "Resolved" ? "bg-green-100 text-green-800 border-green-200" 
                                     : issue.status === "Open" ? "bg-red-100 text-red-800 border-red-200" 
                                     : "bg-blue-100 text-blue-800 border-blue-200"}
                          >
                            {issue.status}
                          </Badge>
                          <Badge 
                            variant={issue.priority === "High" ? "destructive" : issue.priority === "Low" ? "outline" : "secondary"}
                          >
                            {issue.priority} Priority
                          </Badge>
                        </h3>
                        <p className="text-sm text-gray-700 mt-1 mb-2">{issue.description || "No description provided."}</p>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span>Call ID: {issue.call_id}</span>
                          <span>Reported: {formatDate(issue.created_at)}</span>
                        </div>
                        {issue.status === 'Resolved' && issue.resolution && (
                          <p className="text-sm mt-2 bg-gray-100 p-2 rounded">
                            <span className="font-medium">Resolution:</span> {issue.resolution}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-center space-y-1 ml-2 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50" 
                          onClick={() => handleResolveIssue(issue.id)}
                          disabled={issue.status === 'Resolved'}
                          title="Mark as Resolved"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" 
                          onClick={() => handleDeleteIssue(issue.id)}
                          title="Delete Issue"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Technical;
