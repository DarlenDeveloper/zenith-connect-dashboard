import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: "sm" | "md" | "lg";
  center?: boolean;
  className?: string;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ text = "Loading...", size = "md", center = true, className, ...props }, ref) => {
    return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center",
          center && "h-full w-full min-h-[100px]",
          className
        )}
        ref={ref}
        {...props}
      >
        <Spinner size={size} className="animate-spin mb-2" />
        {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
      </div>
    );
  }
);

Loading.displayName = "Loading";

export { Loading }; 