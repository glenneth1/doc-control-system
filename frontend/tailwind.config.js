/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solarized: {
          base03: '#002b36',    // Dark background
          base02: '#073642',    // Secondary background
          base01: '#586e75',    // Optional emphasized content
          base00: '#657b83',    // Primary content
          base0: '#839496',     // Secondary content
          base1: '#93a1a1',     // Comments
          base2: '#eee8d5',     // Background highlights
          base3: '#fdf6e3',     // Background
          yellow: '#b58900',
          orange: '#cb4b16',
          red: '#dc322f',
          magenta: '#d33682',
          violet: '#6c71c4',
          blue: '#268bd2',
          cyan: '#2aa198',
          green: '#859900',
        },
      },
    },
  },
  plugins: [],
}
