/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Ivory Palette
        ivory: {
          DEFAULT: '#FAF6EE',
          light: '#FFFDF9',
          card: '#FDFBF7',
          muted: '#F3ECE0',
          border: '#EAE3D2',
          dark: '#DFD5BE',
        },
        // Emerald Green Palette
        emerald: {
          DEFAULT: '#0A5C36',
          dark: '#063D23',
          light: '#0D7A47',
          vibrant: '#059669',
          pale: '#E1F2E8',
          tint: '#C5E5D1',
          50: '#F0F9F4',
          100: '#E1F2E8',
          200: '#C5E5D1',
          300: '#9DD2B1',
          400: '#6CB98D',
          500: '#059669',
          600: '#0D7A47',
          700: '#0A5C36',
          800: '#063D23',
          900: '#032616',
        },
        // Vermillion Palette
        vermillion: {
          DEFAULT: '#D9381E',
          dark: '#B72B15',
          light: '#E64A19',
          vibrant: '#E34234',
          pale: '#FCEBE6',
          tint: '#F8D0C7',
          50: '#FDF3F0',
          100: '#FCEBE6',
          200: '#F8D0C7',
          300: '#F2A999',
          400: '#EA7963',
          500: '#E34234',
          600: '#D9381E',
          700: '#B72B15',
          800: '#92200E',
          900: '#75180A',
        },
        // Charcoal neutrals for readable contrast
        charcoal: {
          DEFAULT: '#1A261D',
          muted: '#3A483E',
          light: '#586A5E',
        },
        primary: {
          DEFAULT: '#0A5C36',
          dark: '#063D23',
          light: '#0D7A47',
        },
        secondary: {
          DEFAULT: '#D9381E',
          dark: '#B72B15',
          light: '#E64A19',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Newsreader', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(10, 92, 54, 0.09)',
        'luxury-hover': '0 25px 50px -12px rgba(10, 92, 54, 0.18)',
        'vermillion-glow': '0 10px 25px -5px rgba(217, 56, 30, 0.25)',
        'emerald-glow': '0 10px 25px -5px rgba(10, 92, 54, 0.25)',
      },
    },
  },
  plugins: [],
}
