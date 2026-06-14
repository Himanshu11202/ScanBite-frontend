import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './features/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#111111',
        muted: '#8a8a8a',
        accent: '#ff7a18',
        accentSoft: '#ffb37b',
        border: '#222222'
      },
      boxShadow: {
        glow: '0 35px 120px rgba(255, 122, 24, 0.18)',
        soft: '0 20px 60px rgba(0, 0, 0, 0.45)'
      },
      backdropBlur: {
        xs: '2px'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
