/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff6b35",
        "background-light": "#f8f6f5",
        "background-dark": "#23140f",
        "content-light": "#3a3a3a",
        "content-dark": "#d4d4d4",
        "surface-light": "#ffffff",
        "surface-dark": "#2d2d2d",
        "border-light": "#e5e7eb",
        "border-dark": "#4b5563",
      },
      fontFamily: {
        display: "Work Sans",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};