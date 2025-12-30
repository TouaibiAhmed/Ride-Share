/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // Primary Blue
          hover: '#1d4ed8',
        },
        secondary: {
          DEFAULT: '#14b8a6', // Secondary Teal
          hover: '#0f766e',
        },
        accent: {
          DEFAULT: '#f97316', // Accent Orange
          hover: '#ea580c',
        },
        dark: '#1e293b',
        medium: '#64748b',
        light: '#f1f5f9',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
  },
  plugins: [],
}
