import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Agent, useAgent } from "@/contexts/AgentContext";
import { Lock, UserCheck } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface AgentPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  onVerify: (success: boolean) => void;
}

const AgentPasswordDialog = ({ 
  isOpen, 
  onClose, 
  agent,
  onVerify
}: AgentPasswordDialogProps) => {
  const { authenticateAgent } = useAgent();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agent) {
      onClose();
      return;
    }
    
    setError(null);
    setIsVerifying(true);
    
    try {
      // Using the authenticateAgent function from context
      const success = await authenticateAgent(agent.id, password);
      
      if (success) {
        // Briefly show success message
        setIsVerifying(false);
        onVerify(true);
        
        // Close dialog after a brief delay to show the success state
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setError("Invalid PIN. Please try again or contact your administrator.");
        setIsVerifying(false);
        onVerify(false);
      }
    } catch (error) {
      setError("Authentication failed. Please try again later.");
      setIsVerifying(false);
      onVerify(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError(null);
    onClose();
  };

  // Display information about the PIN format for demonstration purposes
  const getDemoPasswordHint = () => {
    // Remove demo hint in production
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            Agent Authentication
          </DialogTitle>
          <DialogDescription>
            Please enter your 4-digit PIN to continue.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agent-password">Agent PIN</Label>
              <Input
                id="agent-password"
                type="password"
                placeholder="Enter 4-digit PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? "border-red-500" : ""}
                maxLength={4}
                pattern="[0-9]{4}"
                inputMode="numeric"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            
            {/* No demo password hint in production */}
            {getDemoPasswordHint()}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!password || isVerifying || password.length !== 4}
            >
              {isVerifying ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Verifying
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Unlock Agent
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgentPasswordDialog; 