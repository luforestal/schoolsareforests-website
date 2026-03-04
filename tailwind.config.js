/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f2f7ee',
          100: '#ddecd4',
          200: '#bbd9a9',
          300: '#91bf74',
          400: '#6ba348',
          500: '#4a7c25',
          600: '#3a6119',
          700: '#2d5016',
          800: '#274414',
          900: '#1e3410',
        },
      },
    },
  },
  plugins: [],
}
