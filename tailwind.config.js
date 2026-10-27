/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#121212',
        text: '#f2f2f0',
        muted: '#8a8a85',
        accent: '#e10600',
        hud: '#d4ff00',
        red: {
          DEFAULT: '#e10600',
          bright: '#ff1e1e',
        },
      },
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        space: ['"Space Grotesk"', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      borderColor: {
        subtle: 'rgba(242,242,240,0.18)',
        blueprint: 'rgba(242,242,240,0.18)',
      },
    },
  },
  plugins: [],
};
