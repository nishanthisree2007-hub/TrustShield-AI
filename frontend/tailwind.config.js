/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080D18',
        card: '#111827',
        'card-hover': '#162032',
        primary: {
          DEFAULT: '#22D3EE',
          dark: '#0891B2',
          light: '#67E8F9',
        },
        'high-risk': '#F97316',
        'critical-risk': '#EF4444',
        'medium-risk': '#EAB308',
        'success-custom': '#22C55E',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
