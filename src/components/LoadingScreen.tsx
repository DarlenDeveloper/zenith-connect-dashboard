import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
  minimumDisplayTime?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading your experience...",
  minimumDisplayTime = 5000, // 5 seconds default
}) => {
  const [showLoader, setShowLoader] = useState(true);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        // Gradually increase progress to 90% over 4 seconds
        const newProgress = prevProgress + (90 - prevProgress) * 0.1;
        return Math.min(newProgress, 90);
      });
    }, 200);
    
    // Final progress boost at the end of minimum display time
    const timer = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      // Small delay to show 100% completion before hiding
      setTimeout(() => {
        setShowLoader(false);
      }, 300);
    }, minimumDisplayTime - 300); // Subtract a little time to ensure a smooth transition

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [minimumDisplayTime]);

  if (!showLoader) return null;

  // Format progress as a percentage
  const formattedProgress = Math.round(progress);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 z-50">
      {/* CSS-based Spinner Animation */}
      <div className="w-32 h-32 mb-6 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-75" style={{animationDuration: '2s'}}></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-1 bg-gray-700 rounded-full mb-2">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${formattedProgress}%` }}
        ></div>
      </div>
      
      {/* Progress Percentage */}
      <div className="text-sm text-gray-400 mb-4">
        {formattedProgress}%
      </div>

      {/* Loading Progress Dots */}
      <div className="flex space-x-2 mb-4">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '300ms', animationDuration: '1.5s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '600ms', animationDuration: '1.5s' }}></div>
      </div>
      
      <p className="text-gray-300 mt-2 text-sm">{message}</p>
      
      {/* Add some ambient animations in the background */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: -1 }}>
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-blue-500 rounded-full opacity-10 floating-bubble"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              animationDuration: `${Math.random() * 10 + 15}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Global styles for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, -100px) scale(0.9);
          }
          100% {
            transform: translate(0, -200px) scale(0.7);
            opacity: 0;
          }
        }
        
        .floating-bubble {
          animation: float infinite linear;
        }
      `}} />
    </div>
  );
};

export default LoadingScreen; 