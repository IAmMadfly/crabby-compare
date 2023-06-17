/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{html,tsx,css}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
}

