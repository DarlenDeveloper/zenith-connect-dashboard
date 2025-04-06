import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Laptop, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SmallScreenWarning = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ignoreWarning, setIgnoreWarning] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      // Only show the warning if the user hasn't chosen to ignore it
      if (!ignoreWarning && (window.innerWidth < 987 || window.innerHeight < 555)) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Check on mount
    checkScreenSize();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [ignoreWarning]);

  const handleDismiss = () => {
    setIgnoreWarning(true);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-red-600">Device Too Small</DialogTitle>
          <DialogDescription className="text-center pt-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-black-bean-600" />
                <Laptop className="h-6 w-6 text-black-bean-600" />
              </div>
              <p className="text-base">
                Your screen resolution is too small to properly display this application.
              </p>
              <p className="text-sm text-gray-500">
                Please use a device with a screen size of at least 987×555 pixels for the best experience.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex justify-center sm:justify-between">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Continue Anyway</Button>
          <Button variant="default" className="bg-black-bean-600 hover:bg-black-bean-700" onClick={handleDismiss}>
            Don't Show Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SmallScreenWarning; 