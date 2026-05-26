/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F5F1ED",
        ivory: "#F5F1ED",
        "ivory-warm": "#EDE8E2",
        "ivory-deep": "#E0D9D0",
        navy: {
          DEFAULT: "#1B3A5C",
          deep: "#0F2540",
          mid: "#2A5280",
        },
        "pro-blue": "#DBEAFE",
        "pro-blue-dark": "#93C5FD",
        amber: {
          DEFAULT: "#C49A3C",
          light: "#FEF3C7",
        },
        red: {
          DEFAULT: "#7F1D1D",
          dark: "#6B1414",
        },
        crimson: {
          DEFAULT: "#7F1D1D",
          light: "#9B2626",
        },
        gold: {
          DEFAULT: "#C49A3C",
          light: "#D4AD55",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        linkio: "6px",
        "linkio-lg": "16px",
      },
      boxShadow: {
        linkio: "0 20px 60px rgba(27, 58, 92, 0.09)",
      },
    },
  },
  plugins: [],
};
