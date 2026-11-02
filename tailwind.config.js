/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"SF Mono"', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        aura: {
          bg: '#F7F4EE',
          sand: '#EFECE6',
          sandDark: '#E4DFD5',
          card: '#FFFFFF',
          clay: '#B86B53',
          clayHover: '#A45D46',
          clayLight: '#F3E5E0',
          sage: '#7D8D7B',
          sageLight: '#E8EDE7',
          charcoal: '#262422',
          graphite: '#383533',
          gold: '#C5A059',
          goldLight: '#F5EEDB',
          bronze: '#A68244',
          darkBg: '#161412',
          darkSurface: '#221F1B',
          darkCard: '#2C2823',
          darkBorder: '#3D3730',
        }
      }
    },
  },
  plugins: [],
};

