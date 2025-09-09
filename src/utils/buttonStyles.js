// Button Style System for Travel Website
// Consistent, attractive color combinations for buttons

export const buttonStyles = {
  // Primary Buttons - Main actions (Book Now, Search, Submit)
  primary: {
    base: "px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2",
    gradient:
      "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white",
    solid: "bg-blue-500 hover:bg-blue-600 text-white",
    disabled:
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg",
  },

  // Secondary Buttons - Supporting actions (Learn More, View Details)
  secondary: {
    base: "px-3 py-1.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2",
    outlined:
      "border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600",
    ghost: "text-blue-600 hover:bg-blue-50 hover:text-blue-700",
  },

  // Accent Buttons - Special offers, promotions
  accent: {
    base: "px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2",
    gradient:
      "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white",
    solid: "bg-blue-500 hover:bg-blue-600 text-white",
  },

  // Info Buttons - Information, filters, sort
  info: {
    base: "px-3 py-1.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2",
    outlined:
      "border border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400",
    solid: "bg-slate-100 hover:bg-slate-200 text-slate-700",
  },

  // Warning/Alert Buttons - Delete, cancel actions
  warning: {
    base: "px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2",
    gradient:
      "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white",
    solid: "bg-blue-500 hover:bg-blue-600 text-white",
    outlined:
      "border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600",
  },

  // Success Buttons - Confirm, complete actions
  success: {
    base: "px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2",
    gradient:
      "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white",
    solid: "bg-blue-500 hover:bg-blue-600 text-white",
  },

  // Navigation Buttons - Tabs, filters, pagination
  navigation: {
    base: "px-3 py-1.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2",
    active: "bg-blue-500 text-white shadow-lg",
    inactive:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-800",
  },

  // Size variants
  sizes: {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  },

  // Special travel-themed buttons
  travel: {
    explore:
      "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300",
    book: "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300",
    promo:
      "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",
    hero: "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-10 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-110 transition-all duration-300 border-2 border-white/20 hover:border-white/40",
    cta: "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300",
  },
};

// Helper function to combine classes
export const combineButtonClasses = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// Pre-built button combinations for common use cases
export const commonButtons = {
  // Primary action buttons
  searchButton: combineButtonClasses(
    buttonStyles.primary.base,
    buttonStyles.primary.gradient,
    buttonStyles.primary.disabled,
    "w-full"
  ),

  bookNowButton: combineButtonClasses(
    buttonStyles.travel.book,
    buttonStyles.primary.disabled
  ),

  exploreButton: combineButtonClasses(buttonStyles.travel.explore),

  // Secondary action buttons
  learnMoreButton: combineButtonClasses(
    buttonStyles.secondary.base,
    buttonStyles.secondary.outlined
  ),

  viewDetailsButton: combineButtonClasses(
    buttonStyles.secondary.base,
    buttonStyles.secondary.ghost
  ),

  // Filter and navigation
  filterButton: combineButtonClasses(
    buttonStyles.navigation.base,
    buttonStyles.navigation.inactive
  ),

  activeFilterButton: combineButtonClasses(
    buttonStyles.navigation.base,
    buttonStyles.navigation.active
  ),

  // Action buttons
  addToCartButton: combineButtonClasses(
    buttonStyles.success.base,
    buttonStyles.success.gradient,
    buttonStyles.primary.disabled
  ),

  removeButton: combineButtonClasses(
    buttonStyles.warning.base,
    buttonStyles.warning.outlined
  ),

  // Auth buttons
  loginButton: combineButtonClasses(
    buttonStyles.primary.base,
    buttonStyles.primary.gradient,
    buttonStyles.primary.disabled,
    "w-full"
  ),

  registerButton: combineButtonClasses(
    buttonStyles.primary.base,
    buttonStyles.primary.gradient,
    buttonStyles.primary.disabled,
    "w-full"
  ),

  // Promo buttons
  promoButton: combineButtonClasses(buttonStyles.travel.promo),

  copyCodeButton: combineButtonClasses(
    buttonStyles.info.base,
    buttonStyles.info.outlined,
    "text-xs"
  ),

  // Hero and CTA buttons
  heroButton: combineButtonClasses(buttonStyles.travel.hero),

  ctaButton: combineButtonClasses(buttonStyles.travel.cta),

  // Gradient outline button
  outlineGradientButton:
    "px-8 py-4 border-3 border-cyan-400 text-cyan-100 hover:text-white rounded-full hover:bg-cyan-400/20 hover:border-cyan-300 transition-all duration-300 font-bold backdrop-blur-sm bg-white/10",

  // Enhanced navigation buttons
  modernFilterButton:
    "px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",

  modernActiveFilter:
    "px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-700 text-white rounded-lg font-medium shadow-xl ring-2 ring-blue-300",
};
