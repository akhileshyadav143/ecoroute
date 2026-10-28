/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ["Figtree", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#12201c",
        moss: { 50: "#f3f7f4", 100: "#e3ece6", 200: "#c5d6cb", 600: "#2f6b50", 700: "#245640", 900: "#12201c" },
        signal: "#e5484d",
        dusk: "#26306b",
      },
    },
  },
  plugins: [],
};
