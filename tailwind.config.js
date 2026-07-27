/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B1E3F",
        "navy-deep": "#07152B",
        gold: "#C8A02E",
        "gold-bright": "#E4C158",
        crimson: "#A81E27",
        sky: "#5E93C4",
        cream: "#F5F0E4",
        paper: "#FFFFFF",
        ink: "#14243D",
        "ink-muted": "#4A5B72",
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["'Source Sans 3'", "sans-serif"],
      },
      borderRadius: {
        card: "2px",
        img: "4px",
      },
      boxShadow: {
        soft: "0 6px 24px rgba(7,21,43,.10)",
        lift: "0 10px 28px rgba(7,21,43,.14)",
      },
      maxWidth: {
        site: "1200px",
      },
    },
  },
  plugins: [],
};
