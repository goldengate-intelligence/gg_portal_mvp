import { CONTRACTOR_DETAIL_COLORS } from '../logic/utils';

/**
 * Design patterns hook for consistent styling across contractor detail components
 * Provides standardized classes, colors, and layout patterns
 */
export const useDesignPatterns = () => {
  // Standard Panel Wrapper Patterns
  const PanelWrapper = {
    hudCard: "border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group",
    container: "border border-gray-600/20 rounded-xl backdrop-blur-sm p-4",
    backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor,
    panelPadding: "p-4",
    fullHeight: "h-full"
  };

  // Typography Patterns
  const Typography = {
    // Panel titles (main headings)
    panelTitle: "font-normal tracking-wide mb-3 text-gray-200 uppercase",
    panelTitleFont: { fontFamily: 'Genos, sans-serif', fontSize: '18px', letterSpacing: '0.0125em' },

    // Container titles (sub-headings)
    containerTitle: "font-sans text-xs uppercase tracking-wider text-gray-500",
    containerTitleMargin: "mb-3",

    // Metric values
    metricValue: { fontFamily: 'Genos, sans-serif', fontSize: '24px', letterSpacing: '0.0125em' },
    largeMetricValue: { fontFamily: 'Genos, sans-serif', fontSize: '30px', lineHeight: '1', letterSpacing: '0.0125em' },

    // Status badges
    statusBadge: "px-1.5 py-0.5 rounded-full uppercase tracking-wider font-sans font-normal",
    statusBadgeSize: { fontSize: '10px' },

    // Info labels
    infoLabel: "text-gray-500 font-light uppercase tracking-wider",
    infoLabelFont: { fontFamily: 'Genos, sans-serif', fontSize: '18px', letterSpacing: '0.0125em' },

    // Description text
    description: "text-[9px] text-gray-600 mt-3 uppercase tracking-wider"
  };

  // Interactive States
  const InteractiveStates = {
    hover: "hover:border-gray-600/20 transition-all duration-300",
    active: "border-[#4EC9B0] shadow-[0_0_20px_rgba(78,201,176,0.3)]",
    tooltip: "bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300",
    tooltipWrapper: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50",
    groupHover: "group relative"
  };

  // Color Schemes
  const ColorSchemes = {
    // Agency/relationship colors
    dod: "#7B61FF",
    prime: "#5BC0EB",
    sub: "#FF4C4C",
    performance: "#4ade80",

    // Brand colors
    gold: "#D2AC38",
    cyan: "#4EC9B0",
    orange: "#E8744B",
    purple: "#9B7EBD",

    // Status colors
    green: "#84cc16",
    red: "#ef4444",

    // Background variants
    backgroundGray: "bg-gray-900/40",
    borderGray: "border-gray-700",
    borderGrayHover: "hover:border-gray-600"
  };

  // Standard Grid Layouts
  const GridLayouts = {
    fourColumn: "grid grid-cols-4 gap-4",
    fourColumnLarge: "grid grid-cols-4 gap-6",
    twoColumn: "grid grid-cols-2 gap-6",
    threeColumn: "grid grid-cols-3 gap-4",
    sixColumn: "grid grid-cols-6 gap-8"
  };

  // Spacing Patterns
  const Spacing = {
    panelGap: "gap-6",
    containerGap: "gap-4",
    sectionMargin: "mb-6",
    itemMargin: "mb-3",
    tightMargin: "mb-2"
  };

  // Accent Patterns
  const AccentPatterns = {
    leftAccentBar: "absolute left-0 top-0 bottom-0 w-[2px]",
    scanLine: "absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/10 to-transparent animate-scan",
    gradientOverlay: "absolute inset-0 bg-gradient-to-br from-gray-700/3 to-gray-900/2"
  };

  // Status Badge Variants
  const StatusBadges = {
    uei: {
      base: "bg-gray-600/20 border border-gray-600/40",
      text: "text-gray-300"
    },
    hot: {
      base: "bg-red-500/20 border border-red-500/40",
      text: "text-red-400"
    },
    strong: {
      base: "bg-[#84cc16]/20 border border-[#84cc16]/40",
      text: "text-[#84cc16]"
    }
  };

  // Animation Classes
  const Animations = {
    pulse: "animate-pulse",
    scan: "animate-scan",
    fadeIn: "transition-opacity duration-200",
    slideIn: "transition-all duration-300",
    hover: "transition-all duration-500"
  };

  return {
    PanelWrapper,
    Typography,
    InteractiveStates,
    ColorSchemes,
    GridLayouts,
    Spacing,
    AccentPatterns,
    StatusBadges,
    Animations
  };
};