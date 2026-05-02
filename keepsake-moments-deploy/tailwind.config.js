export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#f8f2f3',
          100: '#f1e3e6',
          200: '#dfc0c8',
          300: '#c78d9b',
          400: '#af5f72',
          500: '#953f57',
          600: '#7e3047',
          700: '#692639',
          800: '#5b2131',
          900: '#4f1d2a',
          950: '#2b1118'
        },
        parchment: '#f7f1ee',
        ink: '#201615',
        gold: '#b08c5a'
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'sans-serif']
      },
      boxShadow: {
        soft: '0 20px 60px rgba(61, 20, 30, 0.12)'
      },
      animation: {
        marquee: 'marquee 24s linear infinite'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      }
    },
  },
  plugins: [],
}
