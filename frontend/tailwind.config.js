export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Direction A — "Stil"
        bg:        '#f6f5f1',
        surface:   '#ffffff',
        ink:       '#1a1f1a',
        ink2:      '#5d655c',
        ink3:      '#9aa19a',
        line:      '#e7e4dc',
        line2:     '#efece4',
        brand:     '#1f3a2c',
        brandSoft: '#e9efe6',
        accent:    '#c2603a',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        eyebrow: ['11px', { letterSpacing: '1.4px', lineHeight: '1.4' }],
      },
      borderRadius: {
        card: '14px',
        'card-lg': '18px',
      },
    },
  },
  plugins: [],
};
