// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        muted: '#f4f6f8',
        primary: '#4F46E5',
        secondary: '#6366F1',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
