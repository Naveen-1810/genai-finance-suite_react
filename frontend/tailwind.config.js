/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1220',
        panel: '#111A2C',
        panel2: '#16213A',
        border: '#233150',
        mint: '#22C7A9',
        mintdark: '#0E9E85',
        coral: '#FF6B6B',
        amber: '#F2B84B',
        muted: '#8896B3',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
