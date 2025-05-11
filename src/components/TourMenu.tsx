import React, { useEffect, useState } from 'react';
import { Check, HelpCircle, RotateCcw } from 'lucide-react';
import { useTour } from '@/contexts/TourContext';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface TourMenuProps {
  className?: string;
  tourNames: string[];
}

const TourMenu: React.FC<TourMenuProps> = ({ className, tourNames }) => {
  const { 
    startTour, 
    resetTour, 
    completedTours, 
    checkTourCompleted 
  } = useTour();
  
  const [availableTours, setAvailableTours] = useState<Array<{name: string, completed: boolean}>>([]);
  
  useEffect(() => {
    setAvailableTours(
      tourNames.map(name => ({
        name,
        completed: checkTourCompleted(name)
      }))
    );
  }, [tourNames, completedTours, checkTourCompleted]);
  
  const handleStartTour = () => {
    startTour();
  };
  
  const handleRestartTour = (tourName: string) => {
    // Reset the tour status and then start it
    resetTour();
    startTour();
  };
  
  const allToursCompleted = availableTours.length > 0 && availableTours.every(tour => tour.completed);
  
  return (
    <div className={cn("flex items-center", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "relative h-8 w-8",
                    allToursCompleted ? "text-green-500 hover:text-green-600" : "text-muted-foreground"
                  )}
                >
                  {allToursCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <HelpCircle className="h-4 w-4" />
                  )}
                  {!allToursCompleted && (
                    <span className="absolute -right-1 -top-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableTours.map((tour) => (
                  <DropdownMenuItem 
                    key={tour.name}
                    onClick={tour.completed ? () => handleRestartTour(tour.name) : handleStartTour}
                    className="flex items-center justify-between"
                  >
                    <span className="mr-2">{tour.name} Tour</span>
                    {tour.completed ? (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <RotateCcw className="h-3 w-3 text-muted-foreground cursor-pointer" />
                      </div>
                    ) : (
                      <span className="text-xs text-primary">Start</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>Interactive Tours</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TourMenu;
