/**
 * Original Obsidian Card Design Pattern
 *
 * These are the exact settings used in the portfolio cards that create
 * the dark obsidian-like appearance with animated grid backgrounds.
 */

export const OG_OBSIDIAN_CARDS = {
  // Main container classes
  container: "relative group",

  // Card wrapper with all styling
  card: "p-6 bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 border border-[#8B8EFF]/30 hover:border-[#8B8EFF]/50 rounded-xl backdrop-blur-sm shadow-2xl relative overflow-hidden transition-all duration-500",

  // Animated background grid
  backgroundGrid: {
    wrapper: "absolute inset-0 opacity-5",
    style: {
      backgroundImage: `
        linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
        linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
      `,
      backgroundSize: '15px 15px'
    }
  },

  // Hover glow effect
  hoverGlow: {
    wrapper: "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300",
    style: {
      background: 'linear-gradient(135deg, #8B8EFF20, transparent)'
    }
  },

  // Color variants (replace #8B8EFF with desired color)
  colors: {
    indigo: '#8B8EFF',
    orange: '#F97316',
    green: '#22c55e',
    red: '#ef4444',
    purple: '#a855f7'
  },

  // Settings breakdown
  settings: {
    // Main gradient: vertical from top to bottom
    backgroundGradient: "bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90",

    // Border with color and opacity
    border: "border-[COLOR]/30 hover:border-[COLOR]/50",

    // Grid pattern with matching color
    gridPattern: {
      horizontal: "linear-gradient(90deg, [COLOR] 1px, transparent 1px)",
      vertical: "linear-gradient(180deg, [COLOR] 1px, transparent 1px)",
      size: "15px 15px",
      opacity: "opacity-5"
    },

    // Hover effect
    hoverEffect: {
      gradient: "linear-gradient(135deg, [COLOR]20, transparent)",
      opacity: "opacity-0 group-hover:opacity-10",
      transition: "transition-opacity duration-300"
    },

    // Additional styling
    other: {
      borderRadius: "rounded-xl",
      backdropBlur: "backdrop-blur-sm",
      shadow: "shadow-2xl",
      overflow: "overflow-hidden",
      transition: "transition-all duration-500"
    }
  }
};

/**
 * Usage example:
 *
 * <div className={OG_OBSIDIAN_CARDS.container}>
 *   <div className={OG_OBSIDIAN_CARDS.card}>
 *     <div className={OG_OBSIDIAN_CARDS.backgroundGrid.wrapper}>
 *       <div className="absolute inset-0" style={OG_OBSIDIAN_CARDS.backgroundGrid.style} />
 *     </div>
 *
 *     // Your content here
 *
 *     <div className={OG_OBSIDIAN_CARDS.hoverGlow.wrapper} style={OG_OBSIDIAN_CARDS.hoverGlow.style} />
 *   </div>
 * </div>
 */