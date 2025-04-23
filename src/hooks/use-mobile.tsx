import * as React from "react"

// Tailwind-aligned breakpoints
export const BREAKPOINTS = {
  XS: 480,  // Extra small
  SM: 640,  // Small screens (sm)
  MD: 768,  // Medium screens (md)
  LG: 1024, // Large screens (lg)
  XL: 1280  // Extra large (xl)
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
    isXs: boolean;
    isSm: boolean;
    isMd: boolean;
    isLg: boolean;
    isXl: boolean;
  }>({
    isXs: false,
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false
  })

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      setBreakpoint({
        isXs: width < BREAKPOINTS.SM,
        isSm: width >= BREAKPOINTS.SM && width < BREAKPOINTS.MD,
        isMd: width >= BREAKPOINTS.MD && width < BREAKPOINTS.LG,
        isLg: width >= BREAKPOINTS.LG && width < BREAKPOINTS.XL,
        isXl: width >= BREAKPOINTS.XL
      })
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    ...breakpoint,
    isMobile: breakpoint.isXs || breakpoint.isSm,
    isTablet: breakpoint.isMd,
    isDesktop: breakpoint.isLg || breakpoint.isXl
  }
}
