import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'marrom': '#2C1810',
        'marrom-medio': '#3D2215',
        'marrom-claro': '#5C3520',
        'bege': '#E8DDD0',
        'bege-escuro': '#C8B9A8',
        'dourado': '#C9A84C',
        'dourado-claro': '#F0D080',
        'dourado-escuro': '#9A7830',
        'preto-profundo': '#0A0604',
        'cinza-escuro': '#1A1210',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        accent: ['Cinzel', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        brand: ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 0 25px rgba(201, 168, 76, 0.3)',
        'gold-strong': '0 0 40px rgba(201, 168, 76, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #9A7830 0%, #C9A84C 50%, #9A7830 100%)',
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'scan': 'scanLine 2s linear infinite',
        'pulse-gold': 'pulse-gold 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
