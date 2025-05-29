/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Prometheus Brand Colors - Exact same as your Exercise Library
        primary: {
          DEFAULT: '#ed8936',
          50: '#fef7f0',
          100: '#feead9',
          200: '#fcd2b2',
          300: '#f9b380',
          400: '#f6954c',
          500: '#ed8936',
          600: '#dc6f1a',
          700: '#c05621',
          800: '#9c4624',
          900: '#7d3b21',
        },
        orange: {
          DEFAULT: '#ed8936',
          light: '#f6ad55',
          dark: '#c05621',
          500: '#ed8936',
          600: '#dc6f1a',
          700: '#c05621',
        },
        dark: {
          DEFAULT: '#0d1117',
          lighter: '#1a1a1a',
          secondary: '#374151',
        },
        gray: {
          850: '#1f2937',
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          500: '#6b7280',
          400: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'prometheus': '0 10px 30px rgba(237, 137, 54, 0.3)',
        'prometheus-lg': '0 20px 50px rgba(237, 137, 54, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-prometheus': 'pulsePrometheus 2s infinite',
        'glow': 'glow 3s infinite alternate',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulsePrometheus: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 15px 40px rgba(237, 137, 54, 0.5)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 20px 50px rgba(237, 137, 54, 0.7)' },
        },
        glow: {
          '0%': { textShadow: '0 0 10px rgba(237, 137, 54, 0.4)' },
          '100%': { textShadow: '0 0 30px rgba(237, 137, 54, 0.7), 0 0 60px rgba(237, 137, 54, 0.3)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}