/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        pingSlow: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.3)', opacity: 0.8 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        popIcon: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceBadge: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        shakeIcon: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'ping-slow': 'pingSlow 0.5s ease-in-out',
        'pop-icon': 'popIcon 0.5s ease-in-out',
        'bounce-badge': 'bounceBadge 0.5s ease-in-out',
        'shake-icon': 'shakeIcon 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
