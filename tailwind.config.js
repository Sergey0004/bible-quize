/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        parchment: {
          50: '#fdf8f0',
          100: '#f9edd8',
          200: '#f2d9b0',
          300: '#e8bf7e',
          400: '#dca04a',
          500: '#c8842a',
          600: '#a8671e',
          700: '#854f18',
          800: '#6b3f17',
          900: '#593415',
        },
        sacred: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a5bafc',
          400: '#8196f8',
          500: '#6171f1',
          600: '#4a52e4',
          700: '#3d43c9',
          800: '#3338a2',
          900: '#2e3380',
        },
        gold: {
          400: '#f0c040',
          500: '#e0a820',
          600: '#c08010',
        }
      },
      backgroundImage: {
        'cross-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18 0h4v40h-4zM0 18h40v4H0z' fill='%23ffffff' fill-opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          from: { backgroundPosition: '200% center' },
          to: { backgroundPosition: '-200% center' },
        }
      }
    },
  },
  plugins: [],
}
