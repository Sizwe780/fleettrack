/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        softGrey: '#F2F2F2',
        charcoal: '#2C2C2C',
        darkBlue: '#010A26',
        emerald: '#2ECC71',
        platinum: '#E5E4E2',
        alertRed: '#FF3B3B',
        warningYellow: '#FFD700',
        successGreen: '#00C853',
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        cockpit: '1rem',
      },
      spacing: {
        cockpit: '2.5rem',
      },
      boxShadow: {
        cockpit: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      outline: {
        cockpit: ['2px solid #2ECC71'],
      },
      ringColor: {
        cockpit: '#2ECC71',
      },
      screens: {
        cockpit: '1440px',
        xl: '1280px',
        lg: '1024px',
        md: '768px',
        sm: '640px',
      },
      transitionDuration: {
        cockpit: '250ms',
      },
      animation: {
        pulseCockpit: 'pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      zIndex: {
        cockpit: '999',
        overlay: '1000',
        modal: '1100',
      },
      opacity: {
        cockpitDisabled: '0.4',
      },
      borderWidth: {
        cockpit: '2px',
      },
    },
  },
  plugins: [],
};