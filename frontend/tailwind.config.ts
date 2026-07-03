import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography"; // <-- 1. Import it at the top

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {} },
  plugins: [
    typography, // <-- 2. Add the imported variable to the array
  ],
};
export default config;
