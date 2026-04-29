import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette inspirée Firn (épuré) + Aime (chaleureux)
        cream: {
          50: "#FBF8F3",
          100: "#F6F1E8",
          200: "#EDE3D2",
          300: "#E1D2B5",
          400: "#D2BC93"
        },
        sage: {
          50: "#F2F4EF",
          100: "#E1E7DB",
          200: "#C4CFB7",
          300: "#A2B190",
          400: "#849572",
          500: "#6A7A5C",
          600: "#556248",
          700: "#444E39",
          800: "#363E2E",
          900: "#262C20"
        },
        clay: {
          100: "#F2E5DA",
          200: "#E5C9B4",
          300: "#D6A98B",
          400: "#BC8862",
          500: "#9C6A47"
        },
        ink: {
          DEFAULT: "#1F1B16",
          soft: "#3A332B"
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"]
      },
      letterSpacing: {
        widest: "0.18em"
      },
      maxWidth: {
        container: "1280px"
      }
    }
  },
  plugins: []
};

export default config;
