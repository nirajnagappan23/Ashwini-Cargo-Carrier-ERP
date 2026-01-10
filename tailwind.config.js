/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        'bg-blue-600',
        'bg-blue-700',
        'hover:bg-blue-700',
        'text-white',
        'shadow-blue-600/20',
        'focus:ring-blue-500/20',
        'focus:border-blue-500',
        'border-blue-500',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
