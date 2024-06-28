import type { Config } from "tailwindcss";
import path from 'node:path'; 

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    path.join(path.dirname(require.resolve('@coinbase/onchainkit')), '**/*.js'), 
  ],
  theme: {
    fontFamily: {
      sans: ['Roboto', 'sans-serif'],
    },
    extend: {  
      fontFamily: {
        display: ['Roboto', 'sans-serif'],
      },
      fill: {  
        default: 'var(--bg-default)',  
        alternate: 'var(--bg-alternate)',  
        inverse: 'var(--bg-inverse)',  
        primary: 'var(--bg-primary)',  
        secondary: 'var(--bg-secondary)',  
        error: 'var(--bg-error)',  
        warning: 'var(--bg-warning)',  
        success: 'var(--bg-success)',  
      },  
      textColor: {  
        inverse: 'var(--text-inverse)',  
        foreground: 'var(--text-foreground)',  
        'foreground-muted': 'var(--text-foreground-muted)',  
        error: 'var(--text-error)',  
        primary: 'var(--text-primary)',  
        success: 'var(--text-success)',  
        warning: 'var(--text-warning)',  
        disabled: 'var(--text-disabled)',  
      },  
      backgroundColor: {  
        default: 'var(--bg-default)',  
        'default-hover': 'var(--bg-default-hover)',  
        'default-active': 'var(--bg-default-active)',  
        alternate: 'var(--bg-alternate)',  
        'alternate-hover': 'var(--bg-alternate-hover)',  
        'alternate-active': 'var(--bg-alternate-active)',  
        inverse: 'var(--bg-inverse)',  
        'inverse-hover': 'var(--bg-inverse-hover)',  
        'inverse-active': 'var(--bg-inverse-active)',  
        primary: 'var(--bg-primary)',  
        'primary-hover': 'var(--bg-primary-hover)',  
        'primary-active': 'var(--bg-primary-active)',  
        secondary: 'var(--bg-secondary)',  
        'secondary-hover': 'var(--bg-secondary-hover)',  
        'secondary-active': 'var(--bg-secondary-active)',  
        error: 'var(--bg-error)',  
        warning: 'var(--bg-warning)',  
        success: 'var(--bg-success)',  
      }, 
    },
  },
  plugins: [],
};
export default config;
