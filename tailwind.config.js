/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Theme hover backgrounds
    'hover:bg-purple-600',
    'hover:bg-blue-600',
    'hover:bg-green-600', 
    'hover:bg-orange-600',
    'hover:bg-red-600',
    'hover:bg-indigo-600',
    'hover:bg-pink-600',
    'hover:bg-teal-600',
    // Theme text colors
    'text-purple-600',
    'text-blue-600',
    'text-green-600',
    'text-orange-600', 
    'text-red-600',
    'text-indigo-600',
    'text-pink-600',
    'text-teal-600',
    // Theme hover text colors
    'hover:text-purple-600',
    'hover:text-blue-600',
    'hover:text-green-600',
    'hover:text-orange-600',
    'hover:text-red-600', 
    'hover:text-indigo-600',
    'hover:text-pink-600',
    'hover:text-teal-600',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ea580c", // Orange-600
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f3f4f6", // Gray-100
          foreground: "#111827", // Gray-900
        },
        destructive: {
          DEFAULT: "#ef4444", // Red-500
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f9fafb", // Gray-50
          foreground: "#6b7280", // Gray-500
        },
        accent: {
          DEFAULT: "#f3f4f6", // Gray-100
          foreground: "#111827", // Gray-900
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#111827", // Gray-900
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#111827", // Gray-900
        },
        border: "#e5e7eb", // Gray-200
        input: "#e5e7eb", // Gray-200
        ring: "#ea580c", // Orange-600
        background: "#ffffff",
        foreground: "#111827", // Gray-900
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
}
