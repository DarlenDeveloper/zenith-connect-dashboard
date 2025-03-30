
import { cn } from "@/lib/utils";

interface ZenithLogoProps {
  className?: string;
}

const ZenithLogo = ({ className }: ZenithLogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <rect width="32" height="32" rx="8" fill="#9efa06" />
        <path
          d="M8 10H24M8 22H24M19 10L13 22"
          stroke="black"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-bold text-xl">Zenith</span>
    </div>
  );
};

export default ZenithLogo;
