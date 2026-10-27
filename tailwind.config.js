/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        accent: "#d4ff00",
        red: {
          DEFAULT: "#ff2200",
          bright: "#FF1E1E",
        },
      },
      fontFamily: {
        anton: ["Anton", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        grotesk: ["'Space Grotesk'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
