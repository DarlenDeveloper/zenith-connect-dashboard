import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

// Define possible tour status types
export type Status = 'idle' | 'running' | 'paused' | 'finished' | 'skipped';

interface TourContextType {
  status: Status;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  startTour: () => void;
  pauseTour: () => void;
  skipTour: () => void;
  finishTour: () => void;
  tourStep: number;
  setTourStep: React.Dispatch<React.SetStateAction<number>>;
  resetTour: () => void;
  completedTours: string[];
  markTourCompleted: (tourName: string) => void;
  checkTourCompleted: (tourName: string) => boolean;
}

// Create context with default values
const TourContext = createContext<TourContextType>({
  status: 'idle',
  setStatus: () => {},
  startTour: () => {},
  pauseTour: () => {},
  skipTour: () => {},
  finishTour: () => {},
  tourStep: 0,
  setTourStep: () => {},
  resetTour: () => {},
  completedTours: [],
  markTourCompleted: () => {},
  checkTourCompleted: () => false,
});

// Storage key for completed tours
const COMPLETED_TOURS_KEY = 'zmilly_completed_tours';

// Tour Provider component
export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [tourStep, setTourStep] = useState(0);
  const [completedTours, setCompletedTours] = useState<string[]>(() => {
    const saved = localStorage.getItem(COMPLETED_TOURS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem(COMPLETED_TOURS_KEY, JSON.stringify(completedTours));
  }, [completedTours]);

  const startTour = () => {
    setStatus('running');
    setTourStep(0);
  };

  const pauseTour = () => {
    setStatus('paused');
  };

  const skipTour = () => {
    setStatus('skipped');
    setTourStep(0);
  };

  const finishTour = () => {
    setStatus('finished');
    setTourStep(0);
    toast({
      title: 'Tour completed!',
      description: 'You have successfully completed the tour.',
      duration: 3000,
    });
  };

  const resetTour = () => {
    setStatus('idle');
    setTourStep(0);
  };

  const markTourCompleted = (tourName: string) => {
    if (!completedTours.includes(tourName)) {
      setCompletedTours([...completedTours, tourName]);
    }
  };

  const checkTourCompleted = (tourName: string) => {
    return completedTours.includes(tourName);
  };

  return (
    <TourContext.Provider
      value={{
        status,
        setStatus,
        startTour,
        pauseTour,
        skipTour,
        finishTour,
        tourStep,
        setTourStep,
        resetTour,
        completedTours,
        markTourCompleted,
        checkTourCompleted,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

// Hook for using the tour context
export const useTour = () => useContext(TourContext);

export default TourContext;
