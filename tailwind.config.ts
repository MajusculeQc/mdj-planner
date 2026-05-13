import type { Config } from 'tailwindcss';

export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./lib/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                base: 'var(--bg-base)',
                surface: 'var(--bg-surface)',
                overlay: 'var(--bg-overlay)',
                primary: 'var(--text-primary)',
                secondary: 'var(--text-secondary)',
                muted: 'var(--text-muted)',
                subtle: 'var(--border-subtle)',
                defined: 'var(--border-defined)',
                mdj: {
                    cyan: '#00FFFF',
                    orange: '#FF7A59',
                    yellow: '#FFFF00',
                    magenta: '#FF00FF',
                    red: '#ef4444',
                    black: '#0f172a',
                    dark: '#1e293b',
                    surface: '#334155'
                }
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                funky: ['Permanent Marker', 'cursive'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'bounce-soft': 'bounceSoft 2s infinite',
                'flashing': 'flashing 0.5s step-end infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                bounceSoft: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                flashing: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' }
                }
            }
        },
    },
    plugins: [],
} satisfies Config;
