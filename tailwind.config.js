import tailwindScrollbarHide from 'tailwind-scrollbar-hide';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#001E45',
          50: '#f0f5fa',
          100: '#dfeaef',
          200: '#c5d7e5',
          300: '#9ebab3',
          400: '#719dbd',
          500: '#467ea7',
          600: '#2b628d',
          700: '#214e74',
          800: '#1d4261',
          900: '#001E45',
          950: '#00112b',
        },
        ink: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
        },
        surface: {
          base: '#ffffff',
          soft: '#f8fafc',
        },
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'marquee-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        slideInRight: 'slideInRight 0.3s ease-out forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        'marquee-left': 'marquee-left var(--duration, 40s) linear infinite',
      },
    },
  },
  plugins: [tailwindScrollbarHide],
};
