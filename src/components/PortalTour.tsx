import React, { useEffect, useState } from 'react';
import Joyride, { CallBackProps, Status as JoyrideStatus, Step } from 'react-joyride';
import { useTour, Status } from '@/contexts/TourContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PortalTourProps {
  steps: Step[];
  tourName: string;
}

const PortalTour: React.FC<PortalTourProps> = ({ steps, tourName }) => {
  const { 
    status, 
    setStatus, 
    tourStep, 
    setTourStep, 
    markTourCompleted, 
    checkTourCompleted 
  } = useTour();
  
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  
  useEffect(() => {
    // Only show the badge if the tour hasn't been completed
    setShowBadge(!checkTourCompleted(tourName));
  }, [checkTourCompleted, tourName]);
  
  useEffect(() => {
    if (status === 'running') {
      setRun(true);
      setStepIndex(tourStep);
    } else {
      setRun(false);
    }
  }, [status, tourStep]);
  
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;
    
    if (type === 'step:after' && index !== undefined) {
      setTourStep(index + 1);
      setStepIndex(index + 1);
    }
    
    if ((['finished', 'skipped'] as JoyrideStatus[]).includes(status as JoyrideStatus)) {
      setRun(false);
      setStatus(status as unknown as Status);
      
      if (status === 'finished') {
        markTourCompleted(tourName);
      }
    }
  };
  
  return (
    <div className="portal-tour">
      {showBadge && (
        <Badge 
          className={cn(
            "fixed top-20 right-4 z-50 cursor-pointer animate-pulse hover:animate-none", 
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={() => setStatus('running')}
        >
          Tour Available
        </Badge>
      )}
      
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        stepIndex={stepIndex}
        steps={steps}
        styles={{
          options: {
            arrowColor: '#ffffff',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            primaryColor: '#4338ca',
            textColor: '#333',
            zIndex: 1000,
          },
          buttonNext: {
            backgroundColor: '#4338ca',
          },
          buttonBack: {
            marginRight: 10,
          },
        }}
        disableOverlayClose
        locale={{
          last: 'Finish',
          skip: 'Skip tour',
        }}
      />
    </div>
  );
};

export default PortalTour;
