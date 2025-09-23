/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        contractor: {
          detail: '#111726',
          container: '#010204',
          accent: '#D2AC38',
          orange: '#F97316'
        }
      }
    },
  },
  plugins: [],
}