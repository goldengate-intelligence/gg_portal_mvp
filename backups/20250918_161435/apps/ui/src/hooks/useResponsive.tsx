import { useState, useEffect } from 'react';

interface BreakpointValues {
  xs: boolean;  // < 640px
  sm: boolean;  // >= 640px
  md: boolean;  // >= 768px
  lg: boolean;  // >= 1024px
  xl: boolean;  // >= 1280px
  '2xl': boolean; // >= 1536px
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
}

export function useResponsive() {
  const [breakpoints, setBreakpoints] = useState<BreakpointValues>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
  });

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouch: false,
    orientation: 'portrait',
  });

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      
      setBreakpoints({
        xs: width < 640,
        sm: width >= 640,
        md: width >= 768,
        lg: width >= 1024,
        xl: width >= 1280,
        '2xl': width >= 1536,
      });

      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      });

      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateBreakpoints();

    const handleResize = () => {
      updateBreakpoints();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isBreakpoint = (breakpoint: keyof BreakpointValues) => {
    return breakpoints[breakpoint];
  };

  const isAbove = (breakpoint: keyof BreakpointValues) => {
    const breakpointValues = {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    };
    return windowSize.width >= breakpointValues[breakpoint];
  };

  const isBelow = (breakpoint: keyof BreakpointValues) => {
    const breakpointValues = {
      xs: 640,
      sm: 768,
      md: 1024,
      lg: 1280,
      xl: 1536,
      '2xl': 9999,
    };
    return windowSize.width < breakpointValues[breakpoint];
  };

  const isBetween = (min: keyof BreakpointValues, max: keyof BreakpointValues) => {
    return isAbove(min) && isBelow(max);
  };

  return {
    ...breakpoints,
    ...deviceInfo,
    windowSize,
    isBreakpoint,
    isAbove,
    isBelow,
    isBetween,
  };
}

// Responsive component helper
import React from 'react';

interface ResponsiveProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  children?: React.ReactNode;
}

export function Responsive({ mobile, tablet, desktop, children }: ResponsiveProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && mobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (isDesktop && desktop) return <>{desktop}</>;
  
  return <>{children}</>;
}

// CSS class helper for responsive design
export function useResponsiveClasses() {
  const responsive = useResponsive();

  const cn = (...classes: (string | undefined | false | null)[]) => {
    return classes.filter(Boolean).join(' ');
  };

  const responsiveClass = (
    base: string,
    options?: {
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
    }
  ) => {
    const classes = [base];
    
    if (options) {
      if (responsive.sm && options.sm) classes.push(options.sm);
      if (responsive.md && options.md) classes.push(options.md);
      if (responsive.lg && options.lg) classes.push(options.lg);
      if (responsive.xl && options.xl) classes.push(options.xl);
      if (responsive['2xl'] && options['2xl']) classes.push(options['2xl']);
    }
    
    return classes.join(' ');
  };

  return { cn, responsiveClass };
}