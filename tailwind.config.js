/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
            },
            colors: {
                brand: {
                    DEFAULT: '#001E45', // Primary Brand Color (Navy)
                    50: '#f0f5fa',
                    100: '#dfeaef',
                    200: '#c5d7e5',
                    300: '#9ebab3',
                    400: '#719dbd',
                    500: '#467ea7',
                    600: '#2b628d',
                    700: '#214e74',
                    800: '#1d4261',
                    900: '#001E45', // Core Navy
                    950: '#00112b',
                },
                ink: {
                    primary: '#0f172a', // slate-900
                    secondary: '#475569', // slate-600
                    muted: '#94a3b8', // slate-400
                },
                surface: {
                    base: '#ffffff',
                    soft: '#f8fafc', // slate-50
                }
            },
            keyframes: {
                slideInRight: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
            animation: {
                slideInRight: 'slideInRight 0.3s ease-out forwards',
                fadeIn: 'fadeIn 0.2s ease-out forwards',
            }
        },
    },
    plugins: [
        require('tailwind-scrollbar-hide')
    ],
}
