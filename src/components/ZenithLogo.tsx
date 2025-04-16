import { cn } from "@/lib/utils";

interface ZenithLogoProps {
  className?: string;
}

const ZenithLogo = ({ className }: ZenithLogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 137 125"
        preserveAspectRatio="xMidYMid meet"
        className="mr-2"
      >
        <defs>
          <clipPath id="roundedCorners">
            <rect x="0" y="0" width="137" height="125" rx="15" ry="15" />
          </clipPath>
        </defs>
        <g clip-path="url(#roundedCorners)">
          <g
            transform="translate(0.000000,125.000000) scale(0.100000,-0.100000)"
            fill="#000000"
            stroke="none"
          >
            <path d="M0 625 l0 -625 685 0 685 0 0 625 0 625 -685 0 -685 0 0 -625z m662 563 c-11 -18 -31 -53 -44 -78 -88 -158 -241 -421 -249 -426 -5 -3 -9 -1 -9 3 0 5 -34 67 -76 138 -51 89 -73 136 -70 150 3 12 33 49 67 83 94 95 233 158 357 161 l44 1 -20 -32z m203 7 c64 -18 168 -79 217 -127 44 -44 98 -116 98 -132 0 -8 -88 -11 -300 -11 -168 0 -300 4 -300 9 0 5 35 71 77 148 l77 139 41 -6 c22 -4 63 -13 90 -20z m-647 -352 c85 -143 262 -452 262 -457 0 -3 -74 -6 -164 -6 l-163 0 -23 68 c-31 92 -38 227 -16 311 16 63 51 151 59 151 3 0 23 -30 45 -67z m1006 14 c53 -80 59 -297 11 -422 -14 -38 -30 -74 -34 -78 -7 -7 -38 42 -239 390 -39 67 -68 124 -64 127 3 3 74 6 158 6 148 0 154 -1 168 -23z m-137 -418 c40 -68 73 -130 73 -137 0 -22 -110 -131 -169 -167 -31 -18 -84 -43 -118 -54 -64 -22 -173 -39 -173 -27 0 7 49 92 211 367 38 64 72 124 75 133 4 9 11 15 18 13 6 -2 43 -59 83 -128z m-289 -117 c-2 -5 -37 -68 -78 -140 -72 -126 -76 -131 -108 -132 -68 0 -238 74 -302 133 -41 37 -120 128 -120 138 0 5 133 9 306 9 168 0 304 -4 302 -8z" />
          </g>
        </g>
      </svg>
      <span className="font-bold text-xl">AIRIESAI</span>
    </div>
  );
};

export default ZenithLogo;
