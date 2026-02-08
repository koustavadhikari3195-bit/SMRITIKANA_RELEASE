import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2c2c2c',
                    dark: '#1a1a1a',
                    light: '#4a4a4a',
                },
                gold: {
                    DEFAULT: '#a8a8a8',
                    light: '#c0c0c0',
                    dark: '#8e8e8e',
                },
                silver: {
                    DEFAULT: '#c0c0c0',
                    light: '#d4d4d4',
                    dark: '#8e8e8e',
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
