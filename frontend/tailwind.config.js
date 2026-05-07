/** @type {import('tailwindcss').Config} */

import { motion } from "framer-motion";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            canyon: {
                50: "#f3f7ef",
                100: "#dce8d4",
                200: "#bdd1af",
                300: "#96b183",
                400: "#6f915d",
                500: "#557845",
                600: "#3f5d34",
                700: "#2f4727",
                800: "#1f301a",
            },
        },
    },
  },
  plugins: [],
}