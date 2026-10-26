/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1B3B2B',
          dark: '#12291E',
          light: '#28533E',
          muted: '#365E49',
        },
        sage: {
          DEFAULT: '#76937F',
          dark: '#587461',
          light: '#A3B899',
          pale: '#E2EBD8',
        },
        cream: {
          DEFAULT: '#FAF7F2',
          card: '#F4EFEA',
          muted: '#EFE9DE',
          darker: '#E5DEC8',
        },
        sand: {
          DEFAULT: '#E8E2D6',
          light: '#F0ECE4',
          dark: '#D5CABE',
        },
        terracotta: {
          DEFAULT: '#C86D51',
          light: '#DE886E',
          dark: '#A6533A',
        },
        charcoal: {
          DEFAULT: '#1C241E',
          muted: '#3A483E',
          light: '#5D6E62',
        },
        primary: {
          50: '#F2F7F0',
          100: '#E2EBD8',
          200: '#C7D9B8',
          300: '#A3B899',
          400: '#76937F',
          500: '#4E7158',
          600: '#365E49',
          700: '#28533E',
          800: '#1B3B2B',
          900: '#12291E',
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
        'luxury': '0 20px 40px -15px rgba(27, 59, 43, 0.08)',
        'luxury-hover': '0 25px 50px -12px rgba(27, 59, 43, 0.16)',
        'soft-glow': '0 0 35px -5px rgba(226, 235, 216, 0.6)',
      },
    },
  },
  plugins: [],
}
