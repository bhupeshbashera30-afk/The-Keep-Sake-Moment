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
        soft: '0 20px 60px rgba(61, 20, 30, 0.12)',
        glow: '0 0 40px rgba(91, 33, 49, 0.25)'
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.7s ease forwards',
        'slide-in-left': 'slideInLeft 0.9s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in-right': 'slideInRight 0.9s cubic-bezier(0.16,1,0.3,1) forwards',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'line-grow': 'lineGrow 1s cubic-bezier(0.16,1,0.3,1) forwards',
        'counter-up': 'counterUp 2s ease-out forwards',
        'blur-in': 'blurIn 0.9s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        lineGrow: {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' }
        },
        blurIn: {
          '0%': { opacity: '0', filter: 'blur(12px)', transform: 'translateY(16px)' },
          '100%': { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' }
        },
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'expo-in-out': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  plugins: [],
}
