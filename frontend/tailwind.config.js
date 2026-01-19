export default {
  content: ['./public/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0E7490',
          light: '#14B8A6',
          dark: '#0F172A',
        },
        accent: '#F97316',
        surface: '#0F172A',
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        floating: '0 15px 35px -15px rgba(13, 148, 136, 0.4)',
      },
    },
  },
  plugins: [],
};
