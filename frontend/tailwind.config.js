export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand:     "#1f7a4d",
        brandSoft: "rgba(31,122,77,0.12)",
        bg:        "#f2f2f7",
        surface:   "#ffffff",
        ink:       "#000000",
        ink2:      "rgba(60,60,67,0.6)",
        ink3:      "rgba(60,60,67,0.3)",
        sep:       "rgba(60,60,67,0.12)",
        fill:      "rgba(120,120,128,0.16)",
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
