/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    base: true, // Disable base theme
    darkTheme: "light",
    styled: true,
    themes: [
      {
        cmu: {
          "primary": "#570DF8",  // Customize primary color
          "secondary": "#F000B8", // Customize secondary color
          "accent": "#37CDBE",    // Customize accent color
          "neutral": "#3D4451",   // Neutral color for background
          "base-100": "#FFFFFF",  // Background base
          "info": "#3ABFF8",      // Info color
          "success": "#36D399",   // Success color
          "warning": "#FBBD23",   // Warning color
          "error": "#F87272",     // Error color
        },
      },
    ],
  },
}

