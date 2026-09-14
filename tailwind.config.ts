import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        rice: '#f7f1e4',
        ink: '#1d1a16',
        gold: '#c69a4a',
        cinnabar: '#9f2f24',
        jade: '#2f6f63',
        tech: '#1f8fff'
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'serif'],
        body: ['Inter', '"Microsoft YaHei"', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 36px rgba(198, 154, 74, 0.28)',
        tech: '0 0 40px rgba(31, 143, 255, 0.2)'
      },
      animation: {
        floatPattern: 'floatPattern 7s ease-in-out infinite',
        scan: 'scan 2.4s linear infinite',
        pulseRing: 'pulseRing 2.6s ease-out infinite'
      },
      keyframes: {
        floatPattern: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(4deg)' }
        },
        scan: {
          '0%': { transform: 'translateY(-120%)' },
          '100%': { transform: 'translateY(120%)' }
        },
        pulseRing: {
          '0%': { transform: 'scale(0.85)', opacity: '0.75' },
          '100%': { transform: 'scale(1.45)', opacity: '0' }
        }
      }
    }
  },
  plugins: []
} satisfies Config
