import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-container": "#edeeef",
        "surface-container-high": "#e7e8e9",
        "surface-container-highest": "#e1e3e4",
        "surface": "#f8f9fa",
        "surface-dim": "#d9dadb",
        "surface-bright": "#f8f9fa",
        "on-surface": "#191c1d",
        "on-surface-variant": "#5b4039",
        "surface-variant": "#e1e3e4",
        "inverse-surface": "#2e3132",
        "inverse-on-surface": "#f0f1f2",
        "background": "#f8f9fa",
        "on-background": "#191c1d",
        
        "primary": "#b02f00",
        "on-primary": "#ffffff",
        "primary-container": "#ff5722",
        "on-primary-container": "#541200",
        "inverse-primary": "#ffb5a0",
        
        "secondary": "#00629d",
        "on-secondary": "#ffffff",
        "secondary-container": "#00a2fd",
        "on-secondary-container": "#003558",
        
        "tertiary": "#00628c",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#007caf",
        "on-tertiary-container": "#fcfcff",
        
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        
        "primary-fixed": "#ffdbd1",
        "primary-fixed-dim": "#ffb5a0",
        "on-primary-fixed": "#3b0900",
        "on-primary-fixed-variant": "#862200",
        
        "secondary-fixed": "#cfe5ff",
        "secondary-fixed-dim": "#98cbff",
        "on-secondary-fixed": "#001d33",
        "on-secondary-fixed-variant": "#004a77",
        
        "tertiary-fixed": "#c8e6ff",
        "tertiary-fixed-dim": "#86cfff",
        "on-tertiary-fixed": "#001e2e",
        "on-tertiary-fixed-variant": "#004c6d",
        
        "outline": "#907067",
        "outline-variant": "#e4beb4",
        "surface-tint": "#b02f00",
        
        "deep-slate": "#1A1C1E",
        "surface-dark": "#121416",
        "aero-orange-vibrant": "#FF5722",
        "critical-red": "#D32F2F",
        "success-green": "#2E7D32"
      },
      borderRadius: {
        "sm": "0.25rem",
        DEFAULT: "0.5rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "unit": "8px",
        "container-max-width": "1280px",
        "gutter": "24px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
        "card-gap": "16px"
      },
      fontFamily: {
        "display-lg": ["Outfit", "sans-serif"],
        "headline-lg": ["Outfit", "sans-serif"],
        "headline-md": ["Outfit", "sans-serif"],
        "headline-sm": ["Outfit", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-sm": ["Plus Jakarta Sans", "sans-serif"],
        "label-lg": ["Plus Jakarta Sans", "sans-serif"],
        "accent-playful": ["Caveat", "cursive"]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "600" }],
        "accent-playful": ["22px", { lineHeight: "1.2", fontWeight: "500" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
export default config;
