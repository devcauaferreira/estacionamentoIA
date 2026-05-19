export default {
  darkMode: 'class',
  content: ['./*.html', './pages/**/*.html', './cliente/**/*.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#a855f7',
          hover: '#6b21a8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
