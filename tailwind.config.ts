import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        /* 🎬 Cinema-Inspired Theme */
        background: "#140d1f",
        foreground: "#f1eef5",

        card: "#1d142d",
        "card-foreground": "#f1eef5",

        popover: "#1d142d",
        "popover-foreground": "#f1eef5",

        primary: "#9b45e3",
        "primary-foreground": "#f1eef5",

        secondary: "#2a1f3a",
        "secondary-foreground": "#f1eef5",

        muted: "#241b33",
        "muted-foreground": "#9b92aa",

        accent: "#33e0cc",
        "accent-foreground": "#140d1f",

        destructive: "#d94c4c",
        "destructive-foreground": "#f1eef5",

        border: "#322745",
        input: "#2a1f3a",
        ring: "#9b45e3",

        /* Custom Cinema colors */
        cinema: {
          primary: "#40205f",
          secondary: "#523c75",
          accent: "#33e0cc",
          muted: "#241b33",
        },

        /* Sidebar */
        sidebar: {
          background: "#fafafa",
          foreground: "#3e3e46",
          primary: "#19191b",
          "primary-foreground": "#fafafa",
          accent: "#f3f3f4",
          "accent-foreground": "#19191b",
          border: "#e4e7ee",
          ring: "#4a8fff",
        },

        /* 🌑 Dark mode variant */
        dark: {
          background: "#070b12",
          foreground: "#f5f9ff",

          card: "#070b12",
          "card-foreground": "#f5f9ff",

          popover: "#070b12",
          "popover-foreground": "#f5f9ff",

          primary: "#f5f9ff",
          "primary-foreground": "#0c1421",

          secondary: "#1f2737",
          "secondary-foreground": "#f5f9ff",

          muted: "#1f2737",
          "muted-foreground": "#99a2b5",

          accent: "#1f2737",
          "accent-foreground": "#f5f9ff",

          destructive: "#7d2020",
          "destructive-foreground": "#f5f9ff",

          border: "#1f2737",
          input: "#1f2737",
          ring: "#b7c8ec",

          sidebar: {
            background: "#19191b",
            foreground: "#f3f3f4",
            primary: "#3068eb",
            "primary-foreground": "#ffffff",
            accent: "#242427",
            "accent-foreground": "#f3f3f4",
            border: "#242427",
            ring: "#4a8fff",
          },
        },
      },
    },
  },
};

export default config;
