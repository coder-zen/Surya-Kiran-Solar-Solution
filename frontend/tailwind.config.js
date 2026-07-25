/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette — see MASTER PROMPT "Color Palette" section
        navy: {
          DEFAULT: "#0B2447",
          light: "#19376D",
          dark: "#071A33",
        },
        solar: {
          yellow: "#FFC93C",
          orange: "#FF7A00",
        },
        ink: "#2B2D42",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "solar-gradient": "linear-gradient(135deg, #FFC93C 0%, #FF7A00 100%)",
        "navy-gradient": "linear-gradient(135deg, #0B2447 0%, #19376D 100%)",
      },
      boxShadow: {
        premium: "0 20px 50px -15px rgba(11, 36, 71, 0.25)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
