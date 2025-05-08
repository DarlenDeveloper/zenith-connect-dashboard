import * as React from "react"

// Tailwind-aligned breakpoints
export const BREAKPOINTS = {
  XXS: 360, // Extra extra small (mobile)
  XS: 480,  // Extra small (larger mobile)
  SM: 640,  // Small screens (sm)
  MD: 768,  // Medium screens (md)
  LG: 1024, // Large screens (lg)
  XL: 1280, // Extra large (xl)
  XXL: 1536 // Extra extra large (2xl)
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.MD - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.MD)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.MD)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<{
    isXxs: boolean;
    isXs: boolean;
    isSm: boolean;
    isMd: boolean;
    isLg: boolean;
    isXl: boolean;
    isXxl: boolean;
  }>({
    isXxs: false,
    isXs: false,
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
    isXxl: false
  })

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      setBreakpoint({
        isXxs: width < BREAKPOINTS.XXS,
        isXs: width >= BREAKPOINTS.XXS && width < BREAKPOINTS.SM,
        isSm: width >= BREAKPOINTS.SM && width < BREAKPOINTS.MD,
        isMd: width >= BREAKPOINTS.MD && width < BREAKPOINTS.LG,
        isLg: width >= BREAKPOINTS.LG && width < BREAKPOINTS.XL,
        isXl: width >= BREAKPOINTS.XL && width < BREAKPOINTS.XXL,
        isXxl: width >= BREAKPOINTS.XXL
      })
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    ...breakpoint,
    isMobile: breakpoint.isXxs || breakpoint.isXs || breakpoint.isSm,
    isTablet: breakpoint.isMd || breakpoint.isLg,
    isDesktop: breakpoint.isXl || breakpoint.isXxl
  }
}
